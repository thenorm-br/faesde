import { useEffect, useMemo, useState } from "react";
import {
  Folder,
  FolderOpen,
  FileText,
  FileImage,
  FileVideo,
  FileCode,
  File as FileIcon,
  ChevronRight,
  ChevronDown,
  Search,
  Download,
  ExternalLink,
  Home,
  Info,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

type Node =
  | { name: string; type: "folder"; path: string; children: Node[] }
  | { name: string; type: "file"; path: string; size: number; ext: string };

interface IndexFile {
  generatedAt: string;
  tree: Node[];
}

const BASE_URL = "/eadplataforma";

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function iconFor(ext: string) {
  if (["jpg", "jpeg", "png", "gif", "webp", "svg", "bmp", "ico"].includes(ext))
    return FileImage;
  if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return FileVideo;
  if (["html", "htm", "js", "css", "json", "xml", "ts", "tsx"].includes(ext))
    return FileCode;
  if (["pdf", "doc", "docx", "txt", "md"].includes(ext)) return FileText;
  return FileIcon;
}

function findNodeByPath(nodes: Node[], path: string): Node | null {
  for (const n of nodes) {
    if (n.path === path) return n;
    if (n.type === "folder") {
      const f = findNodeByPath(n.children, path);
      if (f) return f;
    }
  }
  return null;
}

function flattenForSearch(nodes: Node[], acc: Node[] = []): Node[] {
  for (const n of nodes) {
    acc.push(n);
    if (n.type === "folder") flattenForSearch(n.children, acc);
  }
  return acc;
}

function countContents(node: Node): { files: number; folders: number; size: number } {
  if (node.type === "file") return { files: 1, folders: 0, size: node.size };
  let files = 0,
    folders = 1,
    size = 0;
  for (const c of node.children) {
    const r = countContents(c);
    files += r.files;
    folders += r.folders;
    size += r.size;
  }
  return { files, folders: folders - 1, size };
}

const FilesManager = () => {
  const [data, setData] = useState<IndexFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPath, setCurrentPath] = useState<string>("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/eadplataforma-index.json", { cache: "no-cache" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((json: IndexFile) => setData(json))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

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
    const q = search.trim().toLowerCase();
    return flattenForSearch(data.tree)
      .filter((n) => n.name.toLowerCase().includes(q))
      .slice(0, 200);
  }, [data, search]);

  const displayNodes = searchResults ?? currentNodes;

  const totalStats = useMemo(() => {
    if (!data) return { files: 0, folders: 0, size: 0 };
    let files = 0,
      folders = 0,
      size = 0;
    for (const n of data.tree) {
      const r = countContents(n);
      files += r.files;
      folders += r.folders + (n.type === "folder" ? 1 : 0);
      size += r.size;
    }
    return { files, folders, size };
  }, [data]);

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Carregando arquivos...</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Não foi possível carregar o índice de arquivos: {error}
          <br />
          Execute o build (ou reinicie o servidor) para gerar o índice.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Arquivos EAD</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Navegação read-only de <code className="text-xs bg-muted px-1.5 py-0.5 rounded">/eadplataforma/</code>
          </p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div>{totalStats.folders} pastas · {totalStats.files} arquivos</div>
          <div>{formatSize(totalStats.size)} no total</div>
        </div>
      </div>

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription className="text-sm">
          Este painel é <strong>somente leitura</strong>. Para upload e exclusão, será necessário
          migrar os arquivos para Lovable Cloud Storage ou conectar a GitHub API. Avise quando
          quiser habilitar.
        </AlertDescription>
      </Alert>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar arquivo ou pasta..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Breadcrumbs */}
      {!searchResults && (
        <div className="flex items-center gap-1 text-sm flex-wrap">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPath("")}
            className="h-7 px-2"
          >
            <Home className="h-3.5 w-3.5 mr-1" />
            eadplataforma
          </Button>
          {breadcrumbs.map((b) => (
            <div key={b.path} className="flex items-center gap-1">
              <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentPath(b.path)}
                className="h-7 px-2"
              >
                {b.name}
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

      {/* File list */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {displayNodes.length === 0 ? (
          <p className="text-center text-muted-foreground py-12 text-sm">
            {searchResults ? "Nenhum arquivo encontrado." : "Pasta vazia."}
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {displayNodes.map((node) => {
              if (node.type === "folder") {
                const stats = countContents(node);
                return (
                  <li key={node.path}>
                    <button
                      onClick={() => {
                        setSearch("");
                        setCurrentPath(node.path);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <Folder className="h-5 w-5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground truncate">{node.name}</div>
                        {searchResults && (
                          <div className="text-xs text-muted-foreground truncate">{node.path}</div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground shrink-0">
                        {stats.files} arq · {formatSize(stats.size)}
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </button>
                  </li>
                );
              }
              const Icon = iconFor(node.ext);
              const url = `${BASE_URL}/${node.path}`;
              return (
                <li
                  key={node.path}
                  className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
                >
                  <Icon className="h-5 w-5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-foreground truncate">{node.name}</div>
                    {searchResults && (
                      <div className="text-xs text-muted-foreground truncate">{node.path}</div>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground shrink-0 hidden sm:block">
                    {formatSize(node.size)}
                  </div>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
                    title="Abrir em nova aba"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <a
                    href={url}
                    download={node.name}
                    className="p-2 rounded-md hover:bg-muted text-muted-foreground hover:text-foreground"
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
        <p className="text-xs text-muted-foreground text-right">
          Índice gerado em {new Date(data.generatedAt).toLocaleString("pt-BR")}
        </p>
      )}
    </div>
  );
};

export default FilesManager;
