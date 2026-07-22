import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  Cloud,
  Copy,
  Database,
  ExternalLink,
  Files,
  Github,
  HardDrive,
  KeyRound,
  Loader2,
  LogOut,
  Play,
  RefreshCw,
  Save,
  Server,
  Settings2,
  ShieldCheck,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client.ts";
import { Alert, AlertDescription } from "@/components/ui/alert.tsx";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Progress } from "@/components/ui/progress.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useToast } from "@/hooks/use-toast.ts";

type ProviderKey = "google_drive" | "github";
type ProviderStatus = "not_configured" | "ready" | "connected" | "read_only" | "error";
type SyncMode = "drive_scan" | "drive_to_github_manifest" | "drive_to_github_files";
type TabKey = "providers" | "settings";

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
  source?: "oauth" | "service_account" | "server_token" | "public";
}

interface OAuthProviderStatus {
  settings: {
    configured: boolean;
    clientId: string;
    hasClientSecret: boolean;
    scopes: string[];
    redirectUri: string;
    updatedAt: string | null;
  };
  connection: {
    connected: boolean;
    accountId: string;
    accountLabel: string;
    status: string;
    scope: string;
    expiresAt: string | null;
    connectedAt: string | null;
    lastCheckedAt: string | null;
    lastSyncAt: string | null;
    metadata?: Record<string, unknown>;
  };
  defaultScopes: string[];
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
    syncBatchSize?: number;
  };
  providers: Record<ProviderKey, ProviderState>;
  oauth?: {
    redirectUri: string;
    providers: Record<ProviderKey, OAuthProviderStatus>;
  };
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
    syncedFiles?: number;
    skippedFiles?: number;
    pendingFiles?: number;
    failedFiles?: number;
    batchLimit?: number;
  };
  failures?: Array<{ path: string; message: string }>;
}

interface SyncHistoryEntry {
  sha: string;
  shortSha: string;
  message: string;
  date: string | null;
  author: string;
  url: string;
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

interface SettingsDraft {
  clientId: string;
  clientSecret: string;
  scopes: string;
  redirectUri: string;
}

const PROVIDER_META: Record<
  ProviderKey,
  { icon: typeof Cloud; title: string; description: string; appLabel: string; appUrl: string }
> = {
  google_drive: {
    icon: Cloud,
    title: "Google Drive",
    appLabel: "Google Cloud Console",
    appUrl: "https://console.cloud.google.com/apis/credentials",
    description: "Fonte principal dos arquivos EAD, apostilas HTML e videos pesados.",
  },
  github: {
    icon: Github,
    title: "GitHub",
    appLabel: "GitHub OAuth Apps",
    appUrl: "https://github.com/settings/developers",
    description: "Cache versionado dos arquivos leves e manifesto para o deploy no Coolify.",
  },
};

const STATUS_LABELS: Record<ProviderStatus, string> = {
  not_configured: "Configurar OAuth",
  ready: "Pronto para conectar",
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

const DEFAULT_SCOPES: Record<ProviderKey, string[]> = {
  google_drive: ["openid", "email", "profile", "https://www.googleapis.com/auth/drive"],
  github: ["repo"],
};

const DEFAULT_DRAFTS: Record<ProviderKey, SettingsDraft> = {
  google_drive: {
    clientId: "",
    clientSecret: "",
    scopes: DEFAULT_SCOPES.google_drive.join("\n"),
    redirectUri: "",
  },
  github: {
    clientId: "",
    clientSecret: "",
    scopes: DEFAULT_SCOPES.github.join("\n"),
    redirectUri: "",
  },
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
    syncBatchSize: 150,
  },
  providers: {
    google_drive: {
      provider: "google_drive",
      label: "Google Drive",
      status: "not_configured",
      message: "Cadastre o OAuth no painel para conectar a conta Google sem mexer no Coolify.",
      externalId: "1jYFYbdJdJHT-f7BpzFX9t1mQLD6xwgbd",
      capabilities: { read: false, write: false, scan: false },
      source: "oauth",
    },
    github: {
      provider: "github",
      label: "GitHub",
      status: "not_configured",
      message: "Cadastre o OAuth no painel para conectar a conta GitHub sem token manual.",
      externalId: "thenorm-br/faesde@main",
      capabilities: { read: false, write: false, scan: false },
      source: "oauth",
    },
  },
  oauth: {
    redirectUri: "",
    providers: {
      google_drive: {
        settings: {
          configured: false,
          clientId: "",
          hasClientSecret: false,
          scopes: DEFAULT_SCOPES.google_drive,
          redirectUri: "",
          updatedAt: null,
        },
        connection: {
          connected: false,
          accountId: "",
          accountLabel: "",
          status: "not_connected",
          scope: "",
          expiresAt: null,
          connectedAt: null,
          lastCheckedAt: null,
          lastSyncAt: null,
        },
        defaultScopes: DEFAULT_SCOPES.google_drive,
      },
      github: {
        settings: {
          configured: false,
          clientId: "",
          hasClientSecret: false,
          scopes: DEFAULT_SCOPES.github,
          redirectUri: "",
          updatedAt: null,
        },
        connection: {
          connected: false,
          accountId: "",
          accountLabel: "",
          status: "not_connected",
          scope: "",
          expiresAt: null,
          connectedAt: null,
          lastCheckedAt: null,
          lastSyncAt: null,
        },
        defaultScopes: DEFAULT_SCOPES.github,
      },
    },
  },
  sql: {
    enabled: true,
    message: "Tabelas OAuth usadas apenas para guardar conexoes admin.",
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

function draftFromStatus(
  status: ApiStatus,
  currentDrafts: Record<ProviderKey, SettingsDraft>,
): Record<ProviderKey, SettingsDraft> {
  const redirectUri =
    status.oauth?.redirectUri || `${window.location.origin}/admin/conexoes/oauth/callback`;

  return {
    google_drive: {
      clientId: status.oauth?.providers.google_drive.settings.clientId || currentDrafts.google_drive.clientId,
      clientSecret: currentDrafts.google_drive.clientSecret,
      scopes:
        status.oauth?.providers.google_drive.settings.scopes?.join("\n") ||
        currentDrafts.google_drive.scopes ||
        DEFAULT_SCOPES.google_drive.join("\n"),
      redirectUri:
        status.oauth?.providers.google_drive.settings.redirectUri ||
        currentDrafts.google_drive.redirectUri ||
        redirectUri,
    },
    github: {
      clientId: status.oauth?.providers.github.settings.clientId || currentDrafts.github.clientId,
      clientSecret: currentDrafts.github.clientSecret,
      scopes:
        status.oauth?.providers.github.settings.scopes?.join("\n") ||
        currentDrafts.github.scopes ||
        DEFAULT_SCOPES.github.join("\n"),
      redirectUri:
        status.oauth?.providers.github.settings.redirectUri ||
        currentDrafts.github.redirectUri ||
        redirectUri,
    },
  };
}

interface ConnectionsManagerProps {
  embedded?: boolean;
}

const ConnectionsManager = ({ embedded = false }: ConnectionsManagerProps) => {
  const [apiStatus, setApiStatus] = useState<ApiStatus | null>(null);
  const [indexData, setIndexData] = useState<IndexFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [runningProvider, setRunningProvider] = useState<ProviderKey | null>(null);
  const [savingProvider, setSavingProvider] = useState<ProviderKey | null>(null);
  const [disconnectingProvider, setDisconnectingProvider] = useState<ProviderKey | null>(null);
  const [runningMode, setRunningMode] = useState<SyncMode | null>(null);
  const [lastRun, setLastRun] = useState<RunResult | null>(null);
  const [syncHistory, setSyncHistory] = useState<SyncHistoryEntry[]>([]);
  const [activeTab, setActiveTab] = useState<TabKey>("providers");
  const [settingsDrafts, setSettingsDrafts] = useState<Record<ProviderKey, SettingsDraft>>(DEFAULT_DRAFTS);
  const [handlingCallback, setHandlingCallback] = useState(false);
  const [autoSyncMessage, setAutoSyncMessage] = useState("Aguardando conexoes.");
  const [autoSyncStarted, setAutoSyncStarted] = useState(false);
  const autoSyncRunsRef = useRef(0);
  const autoSyncTimerRef = useRef<number | null>(null);
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

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
    const status = await fetchWithSession<ApiStatus>("/api/oauth/status", { method: "GET" });
    setApiStatus(status);
    setSettingsDrafts((current) => draftFromStatus(status, current));
  };

  const loadSyncHistory = async () => {
    const result = await fetchWithSession<{ history: SyncHistoryEntry[] }>("/api/sync/history", { method: "GET" });
    setSyncHistory(result.history || []);
  };

  const refreshAll = async () => {
    setLoading(true);
    await loadIndex();
    try {
      await loadStatus();
      await loadSyncHistory().catch(() => setSyncHistory([]));
    } catch (error) {
      const fallback = {
        ...FALLBACK_STATUS,
        oauth: {
          ...FALLBACK_STATUS.oauth,
          redirectUri: `${window.location.origin}/admin/conexoes/oauth/callback`,
        },
      };
      setApiStatus(fallback);
      setSettingsDrafts((current) => draftFromStatus(fallback, current));
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

  useEffect(() => {
    return () => {
      if (autoSyncTimerRef.current) {
        window.clearTimeout(autoSyncTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const isCallback = location.pathname.endsWith("/oauth/callback");
    if (!isCallback || handlingCallback) return;

    const params = new URLSearchParams(location.search);
    const error = params.get("error");
    const code = params.get("code");
    const state = params.get("state");

    if (error) {
      toast({
        title: "Login cancelado",
        description: params.get("error_description") || error,
        variant: "destructive",
      });
      navigate("/admin/configuracoes?tab=conexoes", { replace: true });
      return;
    }

    if (!code || !state) return;

    const finishCallback = async () => {
      setHandlingCallback(true);
      try {
        const result = await fetchWithSession<{ provider: ProviderState; status: ApiStatus; returnTo?: string }>(
          "/api/oauth/callback",
          {
            method: "POST",
            body: JSON.stringify({ code, state }),
          },
        );
        setApiStatus(result.status);
        setSettingsDrafts((current) => draftFromStatus(result.status, current));
        toast({ title: "Conta conectada", description: result.provider.message });
        navigate(result.returnTo || "/admin/configuracoes?tab=conexoes", { replace: true });
      } catch (callbackError) {
        toast({
          title: "Erro ao concluir conexao",
          description: callbackError instanceof Error ? callbackError.message : "Falha inesperada.",
          variant: "destructive",
        });
        navigate("/admin/configuracoes?tab=conexoes", { replace: true });
      } finally {
        setHandlingCallback(false);
      }
    };

    finishCallback();
    // Callback should run only once for the received query string.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  const saveOAuthSettings = async (provider: ProviderKey) => {
    setSavingProvider(provider);
    try {
      const draft = settingsDrafts[provider];
      const result = await fetchWithSession<{ message: string; status: ApiStatus }>("/api/oauth/settings", {
        method: "POST",
        body: JSON.stringify({
          provider,
          clientId: draft.clientId,
          clientSecret: draft.clientSecret,
          scopes: draft.scopes,
          redirectUri: draft.redirectUri,
        }),
      });

      setApiStatus(result.status);
      setSettingsDrafts((current) => draftFromStatus(result.status, current));
      toast({ title: "OAuth salvo", description: result.message });
    } catch (error) {
      toast({
        title: "Erro ao salvar OAuth",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setSavingProvider(null);
    }
  };

  const startOAuthConnection = async (provider: ProviderKey) => {
    const providerOauth = apiStatus?.oauth?.providers[provider];
    if (!providerOauth?.settings.configured) {
      setActiveTab("settings");
      toast({
        title: "Cadastre o OAuth primeiro",
        description: "Salve Client ID e Client Secret antes de abrir o login.",
      });
      return;
    }

    setRunningProvider(provider);
    try {
      const result = await fetchWithSession<{ authorizationUrl: string }>("/api/oauth/start", {
        method: "POST",
        body: JSON.stringify({ provider, returnTo: "/admin/configuracoes?tab=conexoes" }),
      });
      window.location.assign(result.authorizationUrl);
    } catch (error) {
      toast({
        title: "Erro ao iniciar login",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
      setRunningProvider(null);
    }
  };

  const validateProvider = async (provider: ProviderKey) => {
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
        title:
          result.provider.status === "connected" || result.provider.status === "read_only"
            ? "Conexao validada"
            : "Configurar conexao",
        description: result.provider.message,
      });
    } catch (error) {
      await loadStatus().catch(() => null);
      toast({
        title: "Erro ao validar",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setRunningProvider(null);
    }
  };

  const disconnectProvider = async (provider: ProviderKey) => {
    setDisconnectingProvider(provider);
    try {
      const result = await fetchWithSession<{ message: string; status: ApiStatus }>("/api/oauth/disconnect", {
        method: "POST",
        body: JSON.stringify({ provider }),
      });
      setApiStatus(result.status);
      setSettingsDrafts((current) => draftFromStatus(result.status, current));
      toast({ title: "Conta desconectada", description: result.message });
    } catch (error) {
      toast({
        title: "Erro ao desconectar",
        description: error instanceof Error ? error.message : "Falha inesperada.",
        variant: "destructive",
      });
    } finally {
      setDisconnectingProvider(null);
    }
  };

  const runSync = async (mode: SyncMode, options: { automatic?: boolean } = {}) => {
    const isAutomatic = Boolean(options.automatic);
    setRunningMode(mode);
    try {
      const result = await fetchWithSession<RunResult>("/api/sync/run", {
        method: "POST",
        body: JSON.stringify({
          mode,
          batchSize: mode === "drive_to_github_files" ? apiStatus?.config.syncBatchSize : undefined,
        }),
      });
      setLastRun(result);

      if (isAutomatic) {
        const pendingFiles = result.stats?.pendingFiles || 0;
        const syncedFiles = result.stats?.syncedFiles || 0;
        setAutoSyncMessage(
          pendingFiles > 0
            ? `Sincronizacao automatica: ${syncedFiles} arquivo(s) enviados, ${pendingFiles} pendente(s).`
            : "Sincronizacao automatica em dia.",
        );

        if (pendingFiles > 0 && autoSyncRunsRef.current < 20) {
          autoSyncRunsRef.current += 1;
          autoSyncTimerRef.current = window.setTimeout(() => {
            runSync("drive_to_github_files", { automatic: true });
          }, 60000);
        }
      } else {
        toast({ title: "Acao concluida", description: result.message });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Falha inesperada.";
      if (isAutomatic) {
        setAutoSyncMessage(`Auto-sync pausado: ${message}`);
      } else {
        toast({
          title: "Erro na sincronizacao",
          description: message,
          variant: "destructive",
        });
      }
    } finally {
      setRunningMode(null);
      loadStatus().catch(() => null);
      loadSyncHistory().catch(() => null);
    }
  };

  const googleConnected = apiStatus?.providers.google_drive.status === "connected";
  const githubConnected = apiStatus?.providers.github.status === "connected";

  useEffect(() => {
    if (loading || handlingCallback) return;

    if (!googleConnected || !githubConnected) {
      setAutoSyncMessage("Aguardando Google Drive e GitHub conectados.");
      setAutoSyncStarted(false);
      autoSyncRunsRef.current = 0;
      return;
    }

    if (autoSyncStarted || runningMode) return;

    setAutoSyncStarted(true);
    autoSyncRunsRef.current = 1;
    setAutoSyncMessage("Sincronizacao automatica iniciada.");
    runSync("drive_to_github_files", { automatic: true });
    // runSync intentionally stays out of deps to avoid restarting the automation on each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoSyncStarted, githubConnected, googleConnected, handlingCallback, loading, runningMode]);

  const updateDraft = (provider: ProviderKey, field: keyof SettingsDraft, value: string) => {
    setSettingsDrafts((current) => ({
      ...current,
      [provider]: {
        ...current[provider],
        [field]: value,
      },
    }));
  };

  const copyRedirectUri = async () => {
    const redirectUri = apiStatus?.oauth?.redirectUri || `${window.location.origin}/admin/conexoes/oauth/callback`;
    await navigator.clipboard.writeText(redirectUri);
    toast({ title: "URL copiada", description: "Cole essa URL no app OAuth do Google e do GitHub." });
  };

  const connectedProviders = apiStatus
    ? Object.values(apiStatus.providers).filter((provider) => ["connected", "read_only"].includes(provider.status)).length
    : 0;
  const progress = apiStatus ? Math.round((connectedProviders / 2) * 100) : 0;
  const redirectUri = apiStatus?.oauth?.redirectUri || `${window.location.origin}/admin/conexoes/oauth/callback`;

  if (loading || handlingCallback) {
    return (
      <p className="text-center text-muted-foreground py-8">
        {handlingCallback ? "Concluindo conexao OAuth..." : "Carregando conexoes..."}
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          {!embedded && <h2 className="text-2xl font-bold text-foreground">Conexoes</h2>}
          <p className="text-sm text-muted-foreground mt-1">
            Conecte Google Drive e GitHub pelo painel para sincronizar a EADPlataforma.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={refreshAll}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={() => runSync("drive_to_github_files")} disabled={!!runningMode}>
            {runningMode === "drive_to_github_files" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Sincronizar EAD
          </Button>
        </div>
      </div>

      {apiError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            A API respondeu com alerta: {apiError}. Se isso aparecer apos o deploy, provavelmente a migration das
            tabelas OAuth ainda nao foi aplicada.
          </AlertDescription>
        </Alert>
      )}

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
              <p className="text-xs font-medium text-foreground">{autoSyncMessage}</p>
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
            <CardDescription>Tokens ficam no backend/Supabase.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>O navegador envia apenas o token de sessao admin.</p>
            <p>O callback OAuth volta para o painel admin.</p>
            <p>O servidor usa as conexoes salvas para escanear e publicar.</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabKey)} className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="providers">Conectar e sincronizar</TabsTrigger>
          <TabsTrigger value="settings">Configuracao</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Files className="h-5 w-5 text-primary" />
                  Escanear Google Drive
                </CardTitle>
                <CardDescription>
                  Confere a pasta do Drive e atualiza a contagem antes de enviar arquivos para o GitHub.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={() => runSync("drive_scan")} disabled={!!runningMode} className="w-full">
                  {runningMode === "drive_scan" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Cloud className="mr-2 h-4 w-4" />}
                  Escanear agora
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Github className="h-5 w-5 text-primary" />
                  Sincronizar arquivos EAD
                </CardTitle>
                <CardDescription>
                  Envia mais um lote de arquivos leves para `public/eadplataforma/` e atualiza o manifesto.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button
                  onClick={() => runSync("drive_to_github_files")}
                  disabled={!!runningMode}
                  className="w-full"
                >
                  {runningMode === "drive_to_github_files" ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Github className="mr-2 h-4 w-4" />
                  )}
                  Sincronizar proximo lote
                </Button>
                <p className="text-xs text-muted-foreground">
                  Lote atual: {apiStatus?.config.syncBatchSize || 150} arquivo(s). O Coolify publica depois que o GitHub recebe o commit.
                </p>
              </CardContent>
            </Card>
          </div>

          {(lastRun || syncHistory.length > 0) && (
            <Card>
              <CardHeader>
                <CardTitle>Historico de sincronizacao</CardTitle>
                <CardDescription>
                  Registro baseado na ultima acao do painel e nos commits EAD salvos no GitHub.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lastRun && (
                  <div className="rounded-lg border bg-muted/30 p-3 text-sm">
                    <p className="font-medium text-foreground">Ultima acao do painel</p>
                    <p className="text-muted-foreground">
                      {lastRun.message} Finalizado em {formatDate(lastRun.finishedAt)}.
                    </p>
                    {lastRun.stats?.syncedFiles !== undefined && (
                      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4">
                        <div className="rounded-md bg-background p-2">
                          <p className="text-xs text-muted-foreground">Enviados</p>
                          <p className="text-xl font-bold">{lastRun.stats.syncedFiles}</p>
                        </div>
                        <div className="rounded-md bg-background p-2">
                          <p className="text-xs text-muted-foreground">Pendentes</p>
                          <p className="text-xl font-bold">{lastRun.stats.pendingFiles || 0}</p>
                        </div>
                        <div className="rounded-md bg-background p-2">
                          <p className="text-xs text-muted-foreground">Ignorados</p>
                          <p className="text-xl font-bold">{lastRun.stats.skippedFiles || 0}</p>
                        </div>
                        <div className="rounded-md bg-background p-2">
                          <p className="text-xs text-muted-foreground">Falhas</p>
                          <p className="text-xl font-bold">{lastRun.stats.failedFiles || 0}</p>
                        </div>
                      </div>
                    )}
                    {lastRun.githubCommitSha && (
                      <p className="mt-2 font-mono text-xs text-muted-foreground">
                        Commit: {lastRun.githubCommitSha.slice(0, 7)}
                      </p>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  {syncHistory.map((entry) => (
                    <a
                      key={entry.sha}
                      href={entry.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col gap-1 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span>
                        <span className="font-medium text-foreground">{entry.message}</span>
                        <span className="ml-2 font-mono text-xs text-muted-foreground">{entry.shortSha}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(entry.date)} por {entry.author}
                      </span>
                    </a>
                  ))}
                  {syncHistory.length === 0 && (
                    <p className="rounded-lg border p-3 text-sm text-muted-foreground">
                      Nenhum commit de sincronizacao encontrado ainda.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(Object.keys(PROVIDER_META) as ProviderKey[]).map((providerKey) => {
              const meta = PROVIDER_META[providerKey];
              const Icon = meta.icon;
              const provider = apiStatus?.providers[providerKey];
              const oauth = apiStatus?.oauth?.providers[providerKey];
              const status = provider?.status || "not_configured";
              const isBusy = runningProvider === providerKey;
              const isDisconnecting = disconnectingProvider === providerKey;
              const isConnected = oauth?.connection.connected || status === "connected";

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
                        <p className="text-xs text-muted-foreground">Conta conectada</p>
                        <p>{oauth?.connection.accountLabel || "Nenhuma conta conectada"}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ultima checagem</p>
                        <p>{formatDate(oauth?.connection.lastCheckedAt || provider?.lastCheckedAt)}</p>
                      </div>
                      <p className="rounded-md bg-muted/50 p-3 text-sm">{provider?.message || "Aguardando API de sync."}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="rounded-md bg-muted/40 p-2">
                        <p>OAuth app</p>
                        <p className="font-semibold text-foreground">{oauth?.settings.configured ? "Salvo" : "Pendente"}</p>
                      </div>
                      <div className="rounded-md bg-muted/40 p-2">
                        <p>Permissao</p>
                        <p className="font-semibold text-foreground">{isConnected ? "Autorizada" : "Pendente"}</p>
                      </div>
                    </div>

                    <div className="grid gap-2 sm:grid-cols-2">
                      <Button onClick={() => startOAuthConnection(providerKey)} disabled={!!runningProvider}>
                        {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <KeyRound className="mr-2 h-4 w-4" />}
                        {isConnected ? "Reconectar" : "Conectar conta"}
                      </Button>
                      <Button variant="outline" onClick={() => validateProvider(providerKey)} disabled={!!runningProvider}>
                        {isBusy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                        Validar
                      </Button>
                    </div>

                    {isConnected && (
                      <Button
                        variant="destructive"
                        className="w-full"
                        onClick={() => disconnectProvider(providerKey)}
                        disabled={!!disconnectingProvider}
                      >
                        {isDisconnecting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
                        Desconectar
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-primary" />
                URL de callback
              </CardTitle>
              <CardDescription>
                Use exatamente esta URL nos apps OAuth do Google e do GitHub.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 md:flex-row md:items-center">
              <Input value={redirectUri} readOnly className="font-mono text-xs" />
              <Button variant="outline" onClick={copyRedirectUri}>
                <Copy className="mr-2 h-4 w-4" />
                Copiar
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {(Object.keys(PROVIDER_META) as ProviderKey[]).map((providerKey) => {
              const meta = PROVIDER_META[providerKey];
              const Icon = meta.icon;
              const draft = settingsDrafts[providerKey];
              const oauth = apiStatus?.oauth?.providers[providerKey];
              const isSaving = savingProvider === providerKey;

              return (
                <Card key={providerKey}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5 text-primary" />
                      OAuth {meta.title}
                    </CardTitle>
                    <CardDescription>
                      Cadastre o Client ID e Client Secret uma vez. Depois o botao Conectar abre o login.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={oauth?.settings.configured ? "default" : "secondary"}>
                        {oauth?.settings.configured ? "OAuth salvo" : "OAuth pendente"}
                      </Badge>
                      {oauth?.settings.hasClientSecret && <Badge variant="outline">Secret guardado</Badge>}
                      <Button variant="outline" size="sm" asChild>
                        <a href={meta.appUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Abrir {meta.appLabel}
                        </a>
                      </Button>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${providerKey}-client-id`}>Client ID</Label>
                      <Input
                        id={`${providerKey}-client-id`}
                        value={draft.clientId}
                        onChange={(event) => updateDraft(providerKey, "clientId", event.target.value)}
                        placeholder={providerKey === "google_drive" ? "xxxxx.apps.googleusercontent.com" : "GitHub Client ID"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${providerKey}-client-secret`}>Client Secret</Label>
                      <Input
                        id={`${providerKey}-client-secret`}
                        type="password"
                        value={draft.clientSecret}
                        onChange={(event) => updateDraft(providerKey, "clientSecret", event.target.value)}
                        placeholder={oauth?.settings.hasClientSecret ? "Ja salvo. Preencha so para trocar." : "Cole o secret aqui"}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${providerKey}-redirect-uri`}>Redirect URI</Label>
                      <Input
                        id={`${providerKey}-redirect-uri`}
                        value={draft.redirectUri}
                        onChange={(event) => updateDraft(providerKey, "redirectUri", event.target.value)}
                        placeholder={redirectUri}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`${providerKey}-scopes`}>Escopos</Label>
                      <Textarea
                        id={`${providerKey}-scopes`}
                        value={draft.scopes}
                        onChange={(event) => updateDraft(providerKey, "scopes", event.target.value)}
                        className="min-h-24 font-mono text-xs"
                      />
                    </div>

                    <Button onClick={() => saveOAuthSettings(providerKey)} disabled={!!savingProvider} className="w-full">
                      {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                      Salvar OAuth {meta.title}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Ambiente do servidor</CardTitle>
              <CardDescription>Valores lidos pelo backend. Tokens e secrets nao sao exibidos.</CardDescription>
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
                <p className="text-xs text-muted-foreground">Lote por sync</p>
                <p className="font-semibold">{apiStatus?.config.syncBatchSize || 150} arquivos</p>
              </div>
              <div className="rounded-lg border p-3 md:col-span-2">
                <p className="text-xs text-muted-foreground">API server time</p>
                <p className="font-mono text-xs">{apiStatus?.serverTime || "-"}</p>
              </div>
              <Alert className="md:col-span-2">
                <Database className="h-4 w-4" />
                <AlertDescription>{apiStatus?.sql.message || "Conexoes OAuth protegidas por RLS admin."}</AlertDescription>
              </Alert>
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
