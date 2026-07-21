import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Database,
  ExternalLink,
  Files,
  Github,
  HardDrive,
  Loader2,
  Play,
  RefreshCw,
  Server,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client.ts";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { useToast } from "@/hooks/use-toast.ts";

type ProviderKey = "google_drive" | "github";
type ProviderStatus = "not_configured" | "ready" | "connected" | "read_only" | "error";
type SyncMode = "drive_scan" | "drive_to_github_manifest";

type EadNode =
  | { name: string; type: "folder"; path: string; children: EadNode[] }
  | { name: string; type: "file"; path: string; size: number; ext: string };

interface IndexFile {
  generatedAt: string;
  tree: EadNode[];
}

interface ProviderState {
  provider: ProviderKey;
  label: string;
  status: ProviderStatus;
  message: string;
  externalId?: string;
  lastCheckedAt?: string;
  requiredSecrets?: string[];
  capabilities?: {
    read?: boolean;
    write?: boolean;
    scan?: boolean;
  };
  details?: Record<string, unknown>;
}

interface ApiStatus {
  ok: boolean;
  serverTime: string;
  config: {
    driveRootFolderId: string;
    githubRepo: string;
    githubBranch: string;
    publicBasePath: string;
    maxGithubFileMb: number;
    scanLimit: number;
  };
  providers: Record<ProviderKey, ProviderState>;
  sql: {
    enabled: boolean;
    message: string;
  };
}

interface RunResult {
  ok: boolean;
  mode: SyncMode;
  message: string;
  startedAt: string;
  finishedAt: string;
  manifestPath?: string;
  githubCommitSha?: string;
  stats?: {
    folders: number;
    files: number;
    bytes: number;
    githubEligibleFiles: number;
    driveOnlyFiles: number;
    htmlFiles: number;
    videos: number;
    truncated: boolean;
  };
}

interface LocalStats {
  folders: number;
  files: number;
  bytes: number;
  htmlFiles: number;
  videos: number;
  githubEligible: number;
  driveOnly: number;
}

const PROVIDER_META: Record<ProviderKey, { icon: typeof Cloud; title: string; description: string }> = {
  google_drive: {
    icon: Cloud,
    title: "Google Drive",
    description: "Fonte principal dos arquivos EAD, apostilas HTML e videos pesados.",
  },
  github: {
    icon: Github,
    title: "GitHub",
    description: "Cache versionado dos arquivos leves e manifesto para o deploy no Coolify.",
  },
};

const STATUS_LABELS: Record<ProviderStatus, string> = {
  not_configured: "Configurar segredo",
  ready: "Pronto para testar",
  connected: "Conectado",
  read_only: "Leitura ok",
  error: "Erro",
};

const STATUS_CLASSES: Record<ProviderStatus, string> = {
  not_configured: "border-amber-200 bg-amber-100 text-amber-900",
  ready: "border-blue-200 bg-blue-100 text-blue-900",
  connected: "border-green-200 bg-green-100 text-green-900",
  read_only: "border-cyan-200 bg-cyan-100 text-cyan-900",
  error: "border-red-200 bg-red-100 text-red-900",
};

const FALLBACK_STATUS: ApiStatus = {
  ok: false,
  serverTime: "",
  config: {
    driveRootFolderId: "1jYFYbdJdJHT-f7BpzFX9t1mQLD6xwgbd",
    githubRepo: "thenorm-br/faesde",
    githubBranch: "main",
    publicBasePath: "/eadplataforma",
    maxGithubFileMb: 25,
    scanLimit: 5000,
  },
  providers: {
    google_drive: {
      provider: "google_drive",
      label: "Google Drive",
      status: "not_configured",
      message: "Clique em Validar conexao para testar a API e ver exatamente o que falta configurar.",
      externalId: "1jYFYbdJdJHT-f7BpzFX9t1mQLD6xwgbd",
      requiredSecrets: ["GOOGLE_SERVICE_ACCOUNT_JSON"],
      capabilities: { read: false, write: false, scan: false },
    },
    github: {
      provider: "github",
      label: "GitHub",
      status: "ready",
      message: "Clique em Validar conexao para testar o repositorio. Para escrita, configure GITHUB_TOKEN no Coolify.",
      externalId: "thenorm-br/faesde@main",
      requiredSecrets: ["GITHUB_TOKEN"],
      capabilities: { read: true, write: false, scan: false },
    },
  },
  sql: {
    enabled: false,
    message: "SQL ficou para uma etapa futura de redundancia.",
  },
};

function formatSize(bytes = 0) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDate(value?: string | null) {
  if (!value) return "Nunca";
  return new Date(value).toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function collectStats(nodes: EadNode[], maxGithubBytes: number): LocalStats {
  const stats: LocalStats = {
    folders: 0,
    files: 0,
    bytes: 0,
    htmlFiles: 0,
    videos: 0,
    githubEligible: 0,
    driveOnly: 0,
  };

  const visit = (node: EadNode) => {
    if (node.type === "folder") {
      stats.folders += 1;
      node.children.forEach(visit);
      return;
    }

    const ext = node.ext.toLowerCase();
    const isVideo = ["mp4", "webm", "mov", "avi", "mkv"].includes(ext);
    const isDriveOnly = isVideo || node.size > maxGithubBytes;

    stats.files += 1;
    stats.bytes += node.size;
    stats.htmlFiles += ["html", "htm"].includes(ext) ? 1 : 0;
    stats.videos += isVideo ? 1 : 0;
    stats.githubEligible += isDriveOnly ? 0 : 1;
    stats.driveOnly += isDriveOnly ? 1 : 0;
  };

  nodes.forEach(visit);
  return stats;
}

const ConnectionsManager = () => {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [indexData, setIndexData] = useState<IndexFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [runningProvider, setRunningProvider] = useState<ProviderKey | null>(null);
  const [runningMode, setRunningMode] = useState<SyncMode | null>(null);
  const [lastRun, setLastRun] = useState<RunResult | null>(null);
  const { toast } = useToast();

  const maxGithubBytes = (apiStatus?.config.maxGithubFileMb || 25) * 1024 * 1024;
  const localStats = useMemo(() => {
    if (!indexData) {
      return {
        folders: 0,
        files: 0,
        bytes: 0,
        htmlFiles: 0,
        videos: 0,
        githubEligible: 0,
        driveOnly: 0,
      };
    }
    return collectStats(indexData.tree, maxGithubBytes);
  }, [indexData, maxGithubBytes]);

  const fetchWithSession = async <T,>(path: string, options: RequestInit = {}): Promise<T> => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
      throw new Error("Sessao admin expirada. Entre novamente no painel.");
    }

    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
        ...(options.headers || {}),
      },
    });

    const text = await response.text();
    const payload = text ? JSON.parse(text) : {};

    if (!response.ok) {
      throw new Error(payload.message || payload.error || `HTTP ${response.status}`);
    }

    return payload as T;
  };

  const loadIndex = async () => {
    try {
      const response = await fetch("/eadplataforma-index.json", { cache: "no-cache" });
      if (response.ok) {
        setIndexData(await response.json());
      }
    } catch {
      setIndexData(null);
    }
  };

  const loadStatus = async () => {
    setApiError(null);
    const status = await fetchWithSession<ApiStatus>("/api/sync/status", { method: "GET" });
    setApiStatus(status);
  };

  const refreshAll = async () => {
    setLoading(true);
    await loadIndex();
    try {
      await loadStatus();
    } catch (error) {
      setApiStatus(FALLBACK_STATUS);
      setApiError(error instanceof Error ? error.message : "Nao foi possivel acessar a API de sync.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshAll();
    // Initial load only. Manual refresh is handled by the Atualizar button.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connectProvider = async (provider: ProviderKey) => {
    setRunningProvider(provider);
    try {
      const result = await fetchWithSession<{ provider: ProviderState }>("/api/sync/connect", {
        method: "POST",
        body: JSON.stringify({ provider }),
      });

      setApiStatus((current) =>
        current
          ? {
              ...current,
              providers: {
                ...current.providers,
                [provider]: result.provider,
              },
            }
          : current,
      );

      toast({
        title: result.provider.status === "connected" || result.provider.status === "read_only" ? "Conexao validada" : "Configurar conexao",
        description: result.provider.message,
      });
    } catch (error) {
      await loadStatus().catch(() => null);
      toast({
        title: "Erro ao conectar",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setRunningProvider(null);
    }
  };

  const runSync = async (mode: SyncMode) => {
    setRunningMode(mode);
    try {
      const result = await fetchWithSession<RunResult>("/api/sync/run", {
        method: "POST",
        body: JSON.stringify({ mode }),
      });
      setLastRun(result);
      toast({ title: "Acao concluida", description: result.message });
    } catch (error) {
      toast({
        title: "Erro na sincronizacao",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setRunningMode(null);
      loadStatus().catch(() => null);
    }
  };

  const connectedProviders = apiStatus
    ? Object.values(apiStatus.providers).filter((provider) => ["connected", "read_only"].includes(provider.status)).length
    : 0;
  const progress = apiStatus ? Math.round((connectedProviders / 2) * 100) : 0;

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Carregando conexoes...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Conexoes</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Conecte Google Drive e GitHub para preparar a sincronizacao da EADPlataforma.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refreshAll}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={() => runSync("drive_scan")} disabled={!!runningMode}>
            {runningMode === "drive_scan" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Escanear Drive
          </Button>
        </div>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            A API de sincronizacao respondeu com alerta: {apiError}. Os botoes continuam ativos para testar novamente
            e mostrar o erro real da conexao.
          </AlertDescription>
        </Alert>
      )}

      <Alert>
        <Database className="h-4 w-4" />
        <AlertDescription>
          SQL ficou para uma segunda etapa. Esta versao cuida somente de Drive, GitHub e manifesto de arquivos.
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-5 w-5 text-primary" />
              Status do sync
            </CardTitle>
            <CardDescription>API server-side protegida pelo login admin do Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Conexoes</p>
                <p className="text-2xl font-bold">{connectedProviders}/2</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Arquivos locais</p>
                <p className="text-2xl font-bold">{localStats.files}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Cache GitHub</p>
                <p className="text-2xl font-bold">{localStats.githubEligible}</p>
              </div>
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Drive/videos</p>
                <p className="text-2xl font-bold">{localStats.driveOnly}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progresso de conexao</span>
                <span className="font-medium">{progress}%</span>
              </div>
              <Progress value={progress} />
              <p className="text-xs text-muted-foreground">
                Indice local gerado em {formatDate(indexData?.generatedAt)}. Volume publicado: {formatSize(localStats.bytes)}.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <HardDrive className="h-5 w-5 text-primary" />
              Pasta EAD
            </CardTitle>
            <CardDescription>Caminho publico preservado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">URL publica</p>
              <p className="font-mono text-xs break-all">{apiStatus?.config.publicBasePath || "/eadplataforma"}/</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">HTML/SCORM</p>
              <p className="font-semibold">{localStats.htmlFiles} paginas</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Videos detectados</p>
              <p className="font-semibold">{localStats.videos}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Seguranca
            </CardTitle>
            <CardDescription>Segredos ficam so no servidor.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>O navegador envia apenas o token de sessao admin.</p>
            <p>Drive usa service account no Coolify.</p>
            <p>GitHub usa token server-side para escrita.</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="providers">Conectar</TabsTrigger>
          <TabsTrigger value="sync">Sincronizar</TabsTrigger>
          <TabsTrigger value="environment">Ambiente</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(Object.keys(PROVIDER_META) as ProviderKey[]).map((providerKey) => {
              const meta = PROVIDER_META[providerKey];
              const Icon = meta.icon;
              const provider = apiStatus?.providers[providerKey];
              const status = provider?.status || "not_configured";
              const isBusy = runningProvider === providerKey;

              return (
                <Card key={providerKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-3 text-lg">
                      <span className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {meta.title}
                      </span>
                      <Badge variant="outline" className={STATUS_CLASSES[status]}>
                        {STATUS_LABELS[status]}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{meta.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Destino</p>
                        <p className="font-mono text-xs break-all">{provider?.externalId || "Nao configurado"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ultima checagem</p>
                        <p>{formatDate(provider?.lastCheckedAt)}</p>
                      </div>
                      <p className="rounded-md bg-muted/50 p-3 text-sm">{provider?.message || "Aguardando API de sync."}</p>
                    </div>

                    {provider?.requiredSecrets && provider.requiredSecrets.length > 0 && (
                      <div className="rounded-lg border border-dashed p-3">
                        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Secrets necessarios no Coolify
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {provider.requiredSecrets.map((secret) => (
                            <Badge key={secret} variant="secondary" className="font-mono">
                              {secret}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="rounded-md bg-muted/40 p-2">
                        <p>Leitura</p>
                        <p className="font-semibold text-foreground">{provider?.capabilities?.read ? "Ativa" : "Pendente"}</p>
                      </div>
                      <div className="rounded-md bg-muted/40 p-2">
                        <p>Escrita</p>
                        <p className="font-semibold text-foreground">{provider?.capabilities?.write ? "Ativa" : "Pendente"}</p>
                      </div>
                    </div>

                    <Button className="w-full" onClick={() => connectProvider(providerKey)} disabled={!!runningProvider}>
                      {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      Validar conexao
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="sync" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Files className="h-5 w-5 text-primary" />
                  Escanear Google Drive
                </CardTitle>
                <CardDescription>
                  Lista a pasta raiz do Drive, conta arquivos, identifica videos e separa o que pode ir para o GitHub.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => runSync("drive_scan")} disabled={!!runningMode} className="w-full">
                  {runningMode === "drive_scan" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cloud className="mr-2 h-4 w-4" />}
                  Escanear agora
                </Button>
                <p className="text-xs text-muted-foreground">
                  Esse passo nao altera arquivos. Ele so confirma se o Drive esta acessivel pelo servidor.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5 text-primary" />
                  Gerar manifesto no GitHub
                </CardTitle>
                <CardDescription>
                  Cria ou atualiza `public/eadplataforma-drive-manifest.json` com os caminhos do Drive.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => runSync("drive_to_github_manifest")}
                  disabled={!!runningMode}
                  className="w-full"
                >
                  {runningMode === "drive_to_github_manifest" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Github className="mr-2 h-4 w-4" />
                  )}
                  Sincronizar manifesto
                </Button>
                <p className="text-xs text-muted-foreground">
                  Essa etapa exige `GITHUB_TOKEN` com permissao de escrita no repositorio.
                </p>
              </CardContent>
            </Card>
          </div>

          {lastRun && (
            <Card>
              <CardHeader>
                <CardTitle>Ultima acao</CardTitle>
                <CardDescription>
                  {lastRun.message} Finalizado em {formatDate(lastRun.finishedAt)}.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastRun.stats && (
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Pastas Drive</p>
                      <p className="text-2xl font-bold">{lastRun.stats.folders}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Arquivos Drive</p>
                      <p className="text-2xl font-bold">{lastRun.stats.files}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Elegiveis GitHub</p>
                      <p className="text-2xl font-bold">{lastRun.stats.githubEligibleFiles}</p>
                    </div>
                    <div className="rounded-lg border p-3">
                      <p className="text-xs text-muted-foreground">Somente Drive</p>
                      <p className="text-2xl font-bold">{lastRun.stats.driveOnlyFiles}</p>
                    </div>
                  </div>
                )}
                <div className="rounded-lg bg-muted/40 p-3 text-sm">
                  <p>
                    Manifesto: <span className="font-mono text-xs">{lastRun.manifestPath || "Nao gerado"}</span>
                  </p>
                  <p>
                    Commit GitHub: <span className="font-mono text-xs">{lastRun.githubCommitSha || "Nao houve commit"}</span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="environment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuracao do servidor</CardTitle>
              <CardDescription>Valores lidos pelo backend. Segredos aparecem apenas como nomes esperados.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Drive folder</p>
                <p className="font-mono text-xs break-all">{apiStatus?.config.driveRootFolderId || "-"}</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">GitHub repo</p>
                <p className="font-mono text-xs break-all">
                  {apiStatus ? `${apiStatus.config.githubRepo}@${apiStatus.config.githubBranch}` : "-"}
                </p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Limite GitHub</p>
                <p className="font-semibold">{apiStatus?.config.maxGithubFileMb || 25} MB por arquivo</p>
              </div>
              <div className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">Limite scan</p>
                <p className="font-semibold">{apiStatus?.config.scanLimit || 0} itens por execucao</p>
              </div>
              <div className="rounded-lg border p-3 md:col-span-2">
                <p className="text-xs text-muted-foreground">API server time</p>
                <p className="font-mono text-xs">{apiStatus?.serverTime || "-"}</p>
              </div>
              <Button variant="outline" asChild className="md:col-span-2">
                <a
                  href={`https://github.com/${apiStatus?.config.githubRepo || "thenorm-br/faesde"}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  Abrir repositorio
                </a>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ConnectionsManager;
