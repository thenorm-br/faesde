import { useEffect, useMemo, useState } from "react";
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
  Search,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Progress } from "@/components/ui/progress.tsx";

type Node =
  | { name: string; type: "folder"; path: string; modifiedAt?: string; children: Node[] }
  | { name: string; type: "file"; path: string; size: number; ext: string; modifiedAt?: string };

interface IndexFile {
  generatedAt: string;
  tree: Node[];
}

interface DriveManifestItem {
  type: "folder" | "file";
  path: string;
  size?: number;
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

interface TotalStats {
  files: number;
  folders: number;
  size: number;
  latestModifiedAt: string | null;
}

const BASE_URL = "/eadplataforma";

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

    return () => {
      cancelled = true;
    };
  }, []);

  const driveItemsByPath = useMemo(() => {
    return new Map((driveManifest?.items || []).map((item) => [item.path, item]));
  }, [driveManifest]);

  const currentNodes: Node[] = useMemo(() => {
    if (!data) return [];
    if (!currentPath) return data.tree;
    const node = findNodeByPath(data.tree, currentPath);
    if (node && node.type === "folder") return node.children;
    return [];
  }, [data, currentPath]);

  const breadcrumbs = useMemo(() => {
    if (!currentPath) return [];
    const parts = currentPath.split("/");
    return parts.map((part, i) => ({
      name: part,
      path: parts.slice(0, i + 1).join("/"),
    }));
  }, [currentPath]);

  const searchResults = useMemo(() => {
    if (!data || !search.trim()) return null;
    const query = search.trim().toLowerCase();
    return flattenForSearch(data.tree)
      .filter((node) => {
        const driveItem = driveItemsByPath.get(node.path);
        return [node.name, node.path, driveItem?.storageTarget || ""].join(" ").toLowerCase().includes(query);
      })
      .slice(0, 200);
  }, [data, driveItemsByPath, search]);

  const displayNodes = searchResults ?? currentNodes;

  const totalStats = useMemo<TotalStats>(() => {
    if (!data) return { files: 0, folders: 0, size: 0, latestModifiedAt: null };

    let files = 0;
    let folders = 0;
    let size = 0;
    let latestModifiedAt: string | null = null;

    for (const node of data.tree) {
      const nodeStats = countContents(node);
      files += nodeStats.files;
      folders += nodeStats.folders + (node.type === "folder" ? 1 : 0);
      size += nodeStats.size;

      if (getTime(nodeStats.latestModifiedAt) > getTime(latestModifiedAt)) {
        latestModifiedAt = nodeStats.latestModifiedAt;
      }
    }

    return { files, folders, size, latestModifiedAt };
  }, [data]);

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
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>
            {totalStats.folders} pastas - {totalStats.files} arquivos
          </div>
          <div>{formatSize(totalStats.size)} no total</div>
          <div>Mais recente: {formatRelativeDate(totalStats.latestModifiedAt)}</div>
        </div>
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
              <Badge variant="outline">{driveSyncStats.percent}% concluido</Badge>
            </div>
            <Progress value={driveSyncStats.percent} />
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
                  <li key={node.path}>
                    <button
                      onClick={() => {
                        setSearch("");
                        setCurrentPath(node.path);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50"
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
