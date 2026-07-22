import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
  Download,
  ExternalLink,
  File as FileIcon,
  FileCode,
  FileImage,
  FileText,
  FileVideo,
  Folder,
  Home,
  Loader2,
  MoveRight,
  Pencil,
  Play,
  RefreshCw,
  Search,
  Upload,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client.ts";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Progress } from "@/components/ui/progress.tsx";

type Node =
  | { name: string; type: "folder"; path: string; driveFileId?: string; modifiedAt?: string; children: Node[] }
  | { name: string; type: "file"; path: string; driveFileId?: string; size: number; ext: string; modifiedAt?: string };

interface IndexFile {
  generatedAt: string;
  tree: Node[];
}

interface DriveManifestItem {
  type: "folder" | "file";
  path: string;
  driveFileId?: string;
  size?: number;
  extension?: string;
  modifiedTime?: string;
  storageTarget?: "github_cache" | "drive_proxy";
  githubCached?: boolean;
  githubCachedAt?: string | null;
  webViewLink?: string;
}

interface DriveManifest {
  generatedAt: string;
  sync?: {
    syncedAt?: string;
    batchSize?: number;
    batchLimit?: number;
  };
  stats?: {
    files: number;
    folders: number;
    githubEligibleFiles: number;
    driveOnlyFiles: number;
    videos: number;
  };
  items: DriveManifestItem[];
}

interface LiveManifestResponse {
  manifest: DriveManifest;
  cache?: RuntimeCacheStats;
  source: "github";
  serverTime: string;
}

interface RuntimeCacheStats {
  eligible: number;
  cached: number;
  pending: number;
}

interface CacheHydrateResult {
  ok: boolean;
  message: string;
  manifest: DriveManifest;
  cached: number;
  attempted: number;
  pending: number;
  stats: RuntimeCacheStats;
}

interface SyncRunResult {
  ok: boolean;
  message: string;
  finishedAt: string;
  githubCommitSha?: string | null;
  stats?: {
    syncedFiles?: number;
    pendingFiles?: number;
    failedFiles?: number;
    batchLimit?: number;
    cache?: RuntimeCacheStats;
  };
}

interface FileActionResult {
  ok: boolean;
  message: string;
  manifest: DriveManifest;
  cache?: RuntimeCacheStats;
  fileSync?: {
    syncedFiles?: number;
    pendingFiles?: number;
    failedFiles?: number;
    githubCommitSha?: string | null;
  };
}

interface TotalStats {
  files: number;
  folders: number;
  size: number;
  latestModifiedAt: string | null;
}

const BASE_URL = "/eadplataforma";

async function fetchWithAdminSession<T>(path: string, options: RequestInit = {}): Promise<T> {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token) {
    throw new Error("Sessao admin expirada. Entre novamente no painel.");
  }

  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const response = await fetch(path, {
    ...options,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok) {
    throw new Error(payload.message || payload.error || `HTTP ${response.status}`);
  }

  return payload as T;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(value?: string | null) {
  if (!value) return "Sem data";

  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function formatRelativeDate(value?: string | null) {
  if (!value) return "Sem data";

  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const absMs = Math.abs(diffMs);
  const rtf = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });
  const units: Array<{ unit: Intl.RelativeTimeFormatUnit; ms: number }> = [
    { unit: "year", ms: 1000 * 60 * 60 * 24 * 365 },
    { unit: "month", ms: 1000 * 60 * 60 * 24 * 30 },
    { unit: "day", ms: 1000 * 60 * 60 * 24 },
    { unit: "hour", ms: 1000 * 60 * 60 },
    { unit: "minute", ms: 1000 * 60 },
  ];

  for (const { unit, ms } of units) {
    if (absMs >= ms) {
      return rtf.format(Math.round(diffMs / ms), unit);
    }
  }

  return "agora";
}

function getTime(value?: string | null) {
  if (!value) return 0;
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : 0;
}

function iconFor(ext: string) {
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext)) return FileImage;
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return FileVideo;
  if (["html", "htm", "js", "css", "json", "xml", "ts", "tsx"].includes(ext)) return FileCode;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return FileText;
  return FileIcon;
}

function findNodeByPath(nodes: Node[], path: string): Node | null {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.type === "folder") {
      const found = findNodeByPath(node.children, path);
      if (found) return found;
    }
  }
  return null;
}

function flattenForSearch(nodes: Node[], acc: Node[] = []): Node[] {
  for (const node of nodes) {
    acc.push(node);
    if (node.type === "folder") flattenForSearch(node.children, acc);
  }
  return acc;
}

function buildTreeFromManifest(manifest: DriveManifest | null): Node[] {
  if (!manifest?.items?.length) return [];

  const root: Node[] = [];
  const folders = new Map<string, Extract<Node, { type: "folder" }>>();

  const ensureFolder = (folderPath: string): Extract<Node, { type: "folder" }> => {
    const parts = folderPath.split("/").filter(Boolean);
    let currentList = root;
    let currentPath = "";
    let folder: Extract<Node, { type: "folder" }> | null = null;

    for (const part of parts) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      folder = folders.get(currentPath) || null;

      if (!folder) {
        folder = {
          name: part,
          type: "folder",
          path: currentPath,
          modifiedAt: undefined,
          children: [],
        };
        folders.set(currentPath, folder);
        currentList.push(folder);
      }

      currentList = folder.children;
    }

    if (!folder) throw new Error("Pasta raiz nao possui node proprio.");
    return folder;
  };

  const sortedItems = [...manifest.items].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.path.localeCompare(b.path, "pt-BR");
  });

  for (const item of sortedItems) {
    const parts = item.path.split("/").filter(Boolean);
    const name = parts.pop();
    if (!name) continue;

    const parent = parts.length ? ensureFolder(parts.join("/")).children : root;

    if (item.type === "folder") {
      const folder = folders.get(item.path) || {
        name,
        type: "folder" as const,
        path: item.path,
        driveFileId: item.driveFileId,
        modifiedAt: item.modifiedTime,
        children: [],
      };
      folder.driveFileId = item.driveFileId;
      folder.modifiedAt = item.modifiedTime;
      folders.set(item.path, folder);
      if (!parent.some((node) => node.path === folder.path)) parent.push(folder);
      continue;
    }

    parent.push({
      name,
      type: "file",
      path: item.path,
      driveFileId: item.driveFileId,
      size: Number(item.size || 0),
      ext: item.extension || (name.includes(".") ? name.split(".").pop()?.toLowerCase() || "" : ""),
      modifiedAt: item.modifiedTime,
    });
  }

  const sortNodes = (nodes: Node[]) => {
    nodes.sort((a, b) => {
      if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
      return a.name.localeCompare(b.name, "pt-BR");
    });
    nodes.forEach((node) => {
      if (node.type === "folder") sortNodes(node.children);
    });
  };

  sortNodes(root);
  return root;
}

function countContents(node: Node): TotalStats {
  if (node.type === "file") {
    return {
      files: 1,
      folders: 0,
      size: node.size,
      latestModifiedAt: node.modifiedAt || null,
    };
  }

  let files = 0;
  let folders = 1;
  let size = 0;
  let latestModifiedAt = node.modifiedAt || null;

  for (const child of node.children) {
    const childStats = countContents(child);
    files += childStats.files;
    folders += childStats.folders;
    size += childStats.size;

    if (getTime(childStats.latestModifiedAt) > getTime(latestModifiedAt)) {
      latestModifiedAt = childStats.latestModifiedAt;
    }
  }

  return { files, folders: folders - 1, size, latestModifiedAt };
}

const FilesManager = () => {
  const [data, setData] = useState<IndexFile | null>(null);
  const [driveManifest, setDriveManifest] = useState<DriveManifest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [search, setSearch] = useState("");
  const [liveSource, setLiveSource] = useState<"static" | "github">("static");
  const [liveLoading, setLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState<string | null>(null);
  const [lastLiveUpdate, setLastLiveUpdate] = useState<string | null>(null);
  const [syncRunning, setSyncRunning] = useState(false);
  const [syncMessage, setSyncMessage] = useState("Aguardando status ao vivo do GitHub.");
  const [runtimeCache, setRuntimeCache] = useState<RuntimeCacheStats | null>(null);
  const [cacheRunning, setCacheRunning] = useState(false);
  const [cacheMessage, setCacheMessage] = useState("Cache local aguardando manifesto ao vivo.");
  const [fileActionRunning, setFileActionRunning] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const syncRunningRef = useRef(false);
  const cacheRunningRef = useRef(false);
  const uploadInputRef = useRef<HTMLInputElement | null>(null);

  const loadLiveManifest = async (silent = false) => {
    if (!silent) setLiveLoading(true);
    try {
      const result = await fetchWithAdminSession<LiveManifestResponse>("/api/sync/manifest", { method: "GET" });
      setDriveManifest(result.manifest);
      setRuntimeCache(result.cache || null);
      setLiveSource("github");
      setLiveError(null);
      setLastLiveUpdate(result.serverTime || new Date().toISOString());
    } catch (loadError) {
      setLiveError(loadError instanceof Error ? loadError.message : "Nao foi possivel carregar o manifesto ao vivo.");
    } finally {
      if (!silent) setLiveLoading(false);
    }
  };

  const hydrateLocalCache = async (automatic = false) => {
    if (cacheRunningRef.current) return;

    cacheRunningRef.current = true;
    setCacheRunning(true);
    setCacheMessage(automatic ? "Baixando cache local no servidor..." : "Atualizando cache local do servidor...");

    try {
      const result = await fetchWithAdminSession<CacheHydrateResult>("/api/sync/cache", {
        method: "POST",
        body: JSON.stringify({ batchSize: 150 }),
      });
      setDriveManifest(result.manifest);
      setRuntimeCache(result.stats);
      setCacheMessage(
        result.pending > 0
          ? `Cache local: ${result.cached} arquivo(s) baixados agora, ${result.pending} pendente(s).`
          : "Cache local alinhado com o GitHub.",
      );
      setLastLiveUpdate(new Date().toISOString());
    } catch (cacheError) {
      setCacheMessage(
        `Cache local pausado: ${cacheError instanceof Error ? cacheError.message : "falha inesperada."}`,
      );
    } finally {
      cacheRunningRef.current = false;
      setCacheRunning(false);
    }
  };

  const runNextBatch = async (automatic = false) => {
    if (syncRunningRef.current) return;

    syncRunningRef.current = true;
    setSyncRunning(true);
    setSyncMessage(automatic ? "Auto-sync enviando proximo lote..." : "Enviando proximo lote para o GitHub...");

    try {
      const result = await fetchWithAdminSession<SyncRunResult>("/api/sync/run", {
        method: "POST",
        body: JSON.stringify({ mode: "drive_to_github_files" }),
      });
      const synced = result.stats?.syncedFiles || 0;
      const pending = result.stats?.pendingFiles || 0;
      const failed = result.stats?.failedFiles || 0;
      if (result.stats?.cache) setRuntimeCache(result.stats.cache);

      setSyncMessage(
        pending > 0
          ? `Ultimo lote: ${synced} arquivo(s) enviados, ${pending} pendente(s), ${failed} falha(s).`
          : `Sincronizacao em dia: ${synced} arquivo(s) enviados no ultimo lote, ${failed} falha(s).`,
      );
      await loadLiveManifest(true);
    } catch (syncError) {
      setSyncMessage(
        `Auto-sync pausado: ${syncError instanceof Error ? syncError.message : "falha inesperada na sincronizacao."}`,
      );
    } finally {
      syncRunningRef.current = false;
      setSyncRunning(false);
    }
  };

  const applyActionResult = (result: FileActionResult) => {
    setDriveManifest(result.manifest);
    if (result.cache) setRuntimeCache(result.cache);
    setLiveSource("github");
    setLastLiveUpdate(new Date().toISOString());
    setActionMessage(result.message);
  };

  const renameNode = async (node: Node) => {
    const newName = window.prompt("Novo nome:", node.name)?.trim();
    if (!newName || newName === node.name) return;
    if (!window.confirm(`Renomear "${node.path}" para "${newName}"? O link antigo vai parar de funcionar.`)) return;

    setFileActionRunning(`rename:${node.path}`);
    try {
      const result = await fetchWithAdminSession<FileActionResult>("/api/ead/files/rename", {
        method: "POST",
        body: JSON.stringify({ path: node.path, newName }),
      });
      applyActionResult(result);
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : "Falha ao renomear item.");
    } finally {
      setFileActionRunning(null);
    }
  };

  const moveNode = async (node: Node) => {
    const targetFolderPath = window.prompt(
      "Mover para qual pasta? Use caminho dentro de eadplataforma. Deixe vazio para raiz.",
      currentPath,
    );
    if (targetFolderPath === null) return;
    if (!window.confirm(`Mover "${node.path}" para "${targetFolderPath || "raiz"}"? O link antigo vai parar de funcionar.`)) {
      return;
    }

    setFileActionRunning(`move:${node.path}`);
    try {
      const result = await fetchWithAdminSession<FileActionResult>("/api/ead/files/move", {
        method: "POST",
        body: JSON.stringify({ path: node.path, targetFolderPath }),
      });
      applyActionResult(result);
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : "Falha ao mover item.");
    } finally {
      setFileActionRunning(null);
    }
  };

  const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.set("targetFolderPath", currentPath);
    formData.set("file", file);

    setFileActionRunning("upload");
    setActionMessage(`Enviando "${file.name}" para ${currentPath || "raiz"}...`);
    try {
      const result = await fetchWithAdminSession<FileActionResult>("/api/ead/files/upload", {
        method: "POST",
        body: formData,
      });
      applyActionResult(result);
    } catch (actionError) {
      setActionMessage(actionError instanceof Error ? actionError.message : "Falha ao enviar arquivo.");
    } finally {
      setFileActionRunning(null);
      if (uploadInputRef.current) uploadInputRef.current.value = "";
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadFiles = async () => {
      try {
        const indexResponse = await fetch("/eadplataforma-index.json", { cache: "no-cache" });
        if (!indexResponse.ok) throw new Error(`HTTP ${indexResponse.status}`);
        const indexJson: IndexFile = await indexResponse.json();

        let manifestJson: DriveManifest | null = null;
        try {
          const manifestResponse = await fetch("/eadplataforma-drive-manifest.json", { cache: "no-cache" });
          if (manifestResponse.ok) manifestJson = await manifestResponse.json();
        } catch {
          manifestJson = null;
        }

        if (!cancelled) {
          setData(indexJson);
          setDriveManifest(manifestJson);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Erro ao carregar indice.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadFiles();
    loadLiveManifest(true);
    const liveTimer = window.setInterval(() => {
      loadLiveManifest(true);
    }, 30000);

    return () => {
      cancelled = true;
      window.clearInterval(liveTimer);
    };
  }, []);

  const driveItemsByPath = useMemo(() => {
    return new Map((driveManifest?.items || []).map((item) => [item.path, item]));
  }, [driveManifest]);

  const sourceTree = useMemo(() => {
    const liveTree = buildTreeFromManifest(driveManifest);
    return liveTree.length > 0 ? liveTree : data?.tree || [];
  }, [data, driveManifest]);

  const currentNodes: Node[] = useMemo(() => {
    if (!sourceTree.length) return [];
    if (!currentPath) return sourceTree;
    const node = findNodeByPath(sourceTree, currentPath);
    if (node && node.type === "folder") return node.children;
    return [];
  }, [currentPath, sourceTree]);

  const breadcrumbs = useMemo(() => {
    if (!currentPath) return [];
    const parts = currentPath.split("/");
    return parts.map((part, i) => ({
      name: part,
      path: parts.slice(0, i + 1).join("/"),
    }));
  }, [currentPath]);

  const searchResults = useMemo(() => {
    if (!sourceTree.length || !search.trim()) return null;
    const query = search.trim().toLowerCase();
    return flattenForSearch(sourceTree)
      .filter((node) => {
        const driveItem = driveItemsByPath.get(node.path);
        return [node.name, node.path, driveItem?.storageTarget || ""].join(" ").toLowerCase().includes(query);
      })
      .slice(0, 200);
  }, [driveItemsByPath, search, sourceTree]);

  const displayNodes = searchResults ?? currentNodes;

  const totalStats = useMemo<TotalStats>(() => {
    if (!sourceTree.length) return { files: 0, folders: 0, size: 0, latestModifiedAt: null };

    let files = 0;
    let folders = 0;
    let size = 0;
    let latestModifiedAt: string | null = null;

    for (const node of sourceTree) {
      const nodeStats = countContents(node);
      files += nodeStats.files;
      folders += nodeStats.folders + (node.type === "folder" ? 1 : 0);
      size += nodeStats.size;

      if (getTime(nodeStats.latestModifiedAt) > getTime(latestModifiedAt)) {
        latestModifiedAt = nodeStats.latestModifiedAt;
      }
    }

    return { files, folders, size, latestModifiedAt };
  }, [sourceTree]);

  const driveSyncStats = useMemo(() => {
    const items = driveManifest?.items || [];
    const files = items.filter((item) => item.type === "file");
    const githubEligible = files.filter((item) => item.storageTarget === "github_cache");
    const cached = githubEligible.filter((item) => item.githubCached);
    const driveOnly = files.filter((item) => item.storageTarget === "drive_proxy");
    const pending = Math.max(githubEligible.length - cached.length, 0);
    const percent = githubEligible.length ? Math.round((cached.length / githubEligible.length) * 1000) / 10 : 0;
    const latestDriveModifiedAt = items.reduce<string | null>((latest, item) => {
      return getTime(item.modifiedTime) > getTime(latest) ? item.modifiedTime || null : latest;
    }, null);

    return {
      githubEligible: githubEligible.length,
      cached: cached.length,
      pending,
      driveOnly: driveOnly.length,
      percent,
      latestDriveModifiedAt,
    };
  }, [driveManifest]);

  useEffect(() => {
    if (loading || !driveManifest) return;

    if (driveSyncStats.pending <= 0) {
      setSyncMessage("Sincronizacao em dia. Nenhum arquivo leve pendente no GitHub.");
      return;
    }

    if (syncRunningRef.current) return;

    const timer = window.setTimeout(() => {
      runNextBatch(true);
    }, 15000);

    return () => window.clearTimeout(timer);
    // Auto-sync follows the manifest counters; runNextBatch is intentionally not a trigger.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driveManifest, driveSyncStats.pending, loading]);

  useEffect(() => {
    if (loading || !driveManifest || !runtimeCache) return;
    if (runtimeCache.pending <= 0) {
      setCacheMessage("Cache local alinhado com o GitHub.");
      return;
    }
    if (cacheRunningRef.current) return;

    const timer = window.setTimeout(() => {
      hydrateLocalCache(true);
    }, 20000);

    return () => window.clearTimeout(timer);
  }, [driveManifest, loading, runtimeCache]);

  const getDisplayModifiedAt = (node: Node) => {
    return driveItemsByPath.get(node.path)?.modifiedTime || node.modifiedAt || null;
  };

  const getStorageBadge = (node: Node) => {
    const driveItem = driveItemsByPath.get(node.path);
    if (!driveItem || node.type === "folder") return null;
    if (driveItem.storageTarget === "drive_proxy") {
      return { label: "Drive", className: "border-amber-200 bg-amber-100 text-amber-900" };
    }
    if (driveItem.githubCached) {
      return { label: "GitHub", className: "border-green-200 bg-green-100 text-green-900" };
    }
    if (driveItem.storageTarget === "github_cache") {
      return { label: "Pendente", className: "border-blue-200 bg-blue-100 text-blue-900" };
    }
    return null;
  };

  if (loading) {
    return <p className="py-8 text-center text-muted-foreground">Carregando arquivos...</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Nao foi possivel carregar o indice de arquivos: {error}
          <br />
          Execute o build ou reinicie o servidor para gerar o indice.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Arquivos EAD</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Navegacao de <code className="rounded bg-muted px-1.5 py-0.5 text-xs">/eadplataforma/</code>
          </p>
          {actionMessage && <p className="mt-2 text-sm font-medium text-foreground">{actionMessage}</p>}
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>
            {totalStats.folders} pastas - {totalStats.files} arquivos
          </div>
          <div>{formatSize(totalStats.size)} no total</div>
          <div>Mais recente: {formatRelativeDate(totalStats.latestModifiedAt)}</div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-xl border bg-card p-3">
        <input
          ref={uploadInputRef}
          type="file"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) uploadFile(file);
          }}
        />
        <Button onClick={() => uploadInputRef.current?.click()} disabled={!!fileActionRunning}>
          {fileActionRunning === "upload" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
          Upload nesta pasta
        </Button>
        <Button variant="outline" onClick={() => hydrateLocalCache(false)} disabled={cacheRunning || !runtimeCache}>
          {cacheRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
          Atualizar cache local
        </Button>
        <span className="text-xs text-muted-foreground">
          Pasta atual: <span className="font-mono">{currentPath || "raiz"}</span>
        </span>
      </div>

      {driveManifest && (
        <div className="grid gap-4 rounded-xl border border-border bg-card p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-foreground">Progresso Drive para GitHub</h3>
                <p className="text-sm text-muted-foreground">
                  {driveSyncStats.cached} de {driveSyncStats.githubEligible} arquivos leves ja estao cacheados no GitHub.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline">{driveSyncStats.percent}% concluido</Badge>
                <Badge
                  variant="outline"
                  className={
                    liveSource === "github"
                      ? "border-green-200 bg-green-100 text-green-900"
                      : "border-amber-200 bg-amber-100 text-amber-900"
                  }
                >
                  {liveSource === "github" ? "GitHub ao vivo" : "Deploy estatico"}
                </Badge>
              </div>
            </div>
            <Progress value={driveSyncStats.percent} />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => loadLiveManifest()} disabled={liveLoading}>
                {liveLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                Atualizar status
              </Button>
              <Button size="sm" onClick={() => runNextBatch(false)} disabled={syncRunning || driveSyncStats.pending <= 0}>
                {syncRunning ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
                Sincronizar lote agora
              </Button>
              <span className="text-xs text-muted-foreground">{syncMessage}</span>
            </div>
            <p className="text-xs text-muted-foreground">{cacheMessage}</p>
            {liveError && <p className="text-xs text-amber-700">Status ao vivo indisponivel: {liveError}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4 lg:grid-cols-2">
            <div className="rounded-lg bg-muted/50 p-2">
              <p>Pendentes</p>
              <p className="text-lg font-bold text-foreground">{driveSyncStats.pending}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p>Somente Drive</p>
              <p className="text-lg font-bold text-foreground">{driveSyncStats.driveOnly}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p>Ultimo sync</p>
              <p className="font-medium text-foreground">{formatRelativeDate(driveManifest.sync?.syncedAt)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p>Drive alterado</p>
              <p className="font-medium text-foreground">{formatRelativeDate(driveSyncStats.latestDriveModifiedAt)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2 sm:col-span-2 lg:col-span-2">
              <p>Status ao vivo</p>
              <p className="font-medium text-foreground">{formatRelativeDate(lastLiveUpdate)}</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2 sm:col-span-2 lg:col-span-2">
              <p>Cache local servidor</p>
              <p className="font-medium text-foreground">
                {runtimeCache ? `${runtimeCache.cached}/${runtimeCache.eligible}` : "Sem leitura"}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar arquivo, pasta ou status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {!searchResults && (
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <Button variant="ghost" size="sm" onClick={() => setCurrentPath("")} className="h-7 px-2">
            <Home className="mr-1 h-3.5 w-3.5" />
            eadplataforma
          </Button>
          {breadcrumbs.map((breadcrumb) => (
            <div key={breadcrumb.path} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPath(breadcrumb.path)}
                className="h-7 px-2"
              >
                {breadcrumb.name}
              </Button>
            </div>
          ))}
        </div>
      )}

      {searchResults && (
        <p className="text-sm text-muted-foreground">
          {searchResults.length} resultado(s) para "{search}"
          {searchResults.length === 200 && " (limitado a 200)"}
        </p>
      )}

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        {displayNodes.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {searchResults ? "Nenhum arquivo encontrado." : "Pasta vazia."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {displayNodes.map((node) => {
              const modifiedAt = getDisplayModifiedAt(node);
              const storageBadge = getStorageBadge(node);

              if (node.type === "folder") {
                const stats = countContents(node);
                return (
                  <li key={node.path} className="flex items-center gap-2 px-4 py-3 transition-colors hover:bg-muted/50">
                    <button
                      onClick={() => {
                        setSearch("");
                        setCurrentPath(node.path);
                      }}
                      className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    >
                      <Folder className="h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-medium text-foreground">{node.name}</div>
                        {searchResults && <div className="truncate text-xs text-muted-foreground">{node.path}</div>}
                        <div className="text-xs text-muted-foreground">
                          Modificado {formatRelativeDate(modifiedAt)} - {formatDate(modifiedAt)}
                        </div>
                      </div>
                      <div className="hidden shrink-0 text-right text-xs text-muted-foreground sm:block">
                        <div>
                          {stats.files} arq - {formatSize(stats.size)}
                        </div>
                        <div>Mais recente {formatRelativeDate(stats.latestModifiedAt)}</div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => renameNode(node)}
                      disabled={!!fileActionRunning}
                      title="Renomear"
                    >
                      {fileActionRunning === `rename:${node.path}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Pencil className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveNode(node)}
                      disabled={!!fileActionRunning}
                      title="Mover"
                    >
                      {fileActionRunning === `move:${node.path}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <MoveRight className="h-4 w-4" />
                      )}
                    </Button>
                  </li>
                );
              }

              const Icon = iconFor(node.ext);
              const url = `${BASE_URL}/${node.path}`;
              const driveItem = driveItemsByPath.get(node.path);

              return (
                <li key={node.path} className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
                  <Icon className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-foreground">{node.name}</div>
                    {searchResults && <div className="truncate text-xs text-muted-foreground">{node.path}</div>}
                    <div className="text-xs text-muted-foreground">
                      Modificado {formatRelativeDate(modifiedAt)} - {formatDate(modifiedAt)}
                    </div>
                  </div>
                  <div className="hidden min-w-32 shrink-0 text-right text-xs text-muted-foreground sm:block">
                    <div>{formatSize(node.size)}</div>
                    {driveItem?.githubCachedAt && <div>Cache {formatRelativeDate(driveItem.githubCachedAt)}</div>}
                  </div>
                  {storageBadge && (
                    <Badge variant="outline" className={`hidden shrink-0 md:inline-flex ${storageBadge.className}`}>
                      {storageBadge.label}
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => renameNode(node)}
                    disabled={!!fileActionRunning}
                    title="Renomear"
                  >
                    {fileActionRunning === `rename:${node.path}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Pencil className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveNode(node)}
                    disabled={!!fileActionRunning}
                    title="Mover"
                  >
                    {fileActionRunning === `move:${node.path}` ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <MoveRight className="h-4 w-4" />
                    )}
                  </Button>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Abrir em nova aba"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={url}
                    download={node.name}
                    className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                    title="Baixar"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {data && (
        <p className="text-right text-xs text-muted-foreground">
          Indice gerado em {formatDate(data.generatedAt)}
          {driveManifest?.generatedAt && ` - Manifesto Drive gerado em ${formatDate(driveManifest.generatedAt)}`}
        </p>
      )}
    </div>
  );
};

export default FilesManager;
