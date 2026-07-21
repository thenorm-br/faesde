import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cloud,
  Database,
  ExternalLink,
  FileCode2,
  GitBranch,
  Github,
  Loader2,
  Play,
  RefreshCw,
  Save,
  Server,
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
import { Switch } from "@/components/ui/switch.tsx";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs.tsx";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";
import { useToast } from "@/hooks/use-toast.ts";

type Provider = "google_drive" | "github" | "sql";
type ConnectionStatus = "disconnected" | "pending" | "connected" | "error";
type RunStatus = "queued" | "running" | "success" | "partial" | "failed";

type EadNode =
  | { name: string; type: "folder"; path: string; children: EadNode[] }
  | { name: string; type: "file"; path: string; size: number; ext: string };

interface IndexFile {
  generatedAt: string;
  tree: EadNode[];
}

interface SyncSettings {
  id: string;
  drive_root_folder_id: string;
  github_repo: string;
  github_branch: string;
  public_base_path: string;
  local_public_path: string;
  max_github_file_mb: number;
  excluded_extensions: string[];
  include_extensions: string[];
  sync_enabled: boolean;
  auto_sync_interval_minutes: number;
  updated_at: string;
}

interface SyncConnection {
  id: string;
  provider: Provider;
  status: ConnectionStatus;
  display_name: string;
  external_id: string | null;
  metadata: Record<string, unknown> | null;
  connected_at: string | null;
  last_checked_at: string | null;
  error_message: string | null;
}

interface SyncRun {
  id: string;
  mode: string;
  status: RunStatus;
  started_at: string | null;
  finished_at: string | null;
  total_files: number;
  synced_files: number;
  skipped_files: number;
  failed_files: number;
  total_bytes: number;
  cached_bytes: number;
  large_files: number;
  folders: number;
  progress_percent: number;
  commit_sha: string | null;
  error_message: string | null;
}

interface SqlSnapshot {
  id: string;
  name: string;
  kind: string;
  status: string;
  table_names: string[] | null;
  file_path: string | null;
  drive_file_id: string | null;
  github_path: string | null;
  generated_at: string;
  applied_at: string | null;
  error_message: string | null;
}

interface LocalStats {
  folders: number;
  files: number;
  bytes: number;
  htmlFiles: number;
  videos: number;
  largeFiles: number;
  githubEligible: number;
}

const DEFAULT_SETTINGS = {
  drive_root_folder_id: "1jYFYbdJdJHT-f7BpzFX9t1mQLD6xwgbd",
  github_repo: "thenorm-br/faesde",
  github_branch: "main",
  public_base_path: "/eadplataforma",
  local_public_path: "public/eadplataforma",
  max_github_file_mb: 25,
  excluded_extensions: ["mp4", "mov", "avi", "mkv", "zip", "rar", "7z"],
  include_extensions: [
    "html",
    "htm",
    "css",
    "js",
    "json",
    "xml",
    "png",
    "jpg",
    "jpeg",
    "gif",
    "webp",
    "svg",
    "pdf",
    "woff",
    "woff2",
    "ttf",
  ],
  sync_enabled: false,
  auto_sync_interval_minutes: 60,
};

const STATUS_LABELS: Record<ConnectionStatus | RunStatus, string> = {
  disconnected: "Desconectado",
  pending: "Pendente",
  connected: "Conectado",
  error: "Erro",
  queued: "Na fila",
  running: "Rodando",
  success: "Sincronizado",
  partial: "Parcial",
  failed: "Falhou",
};

const STATUS_BADGES: Record<ConnectionStatus | RunStatus, string> = {
  disconnected: "bg-muted text-muted-foreground",
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  connected: "bg-green-100 text-green-800 border-green-200",
  error: "bg-red-100 text-red-800 border-red-200",
  queued: "bg-blue-100 text-blue-800 border-blue-200",
  running: "bg-cyan-100 text-cyan-800 border-cyan-200",
  success: "bg-green-100 text-green-800 border-green-200",
  partial: "bg-amber-100 text-amber-800 border-amber-200",
  failed: "bg-red-100 text-red-800 border-red-200",
};

const PROVIDER_INFO: Record<Provider, { label: string; description: string; icon: typeof Cloud }> = {
  google_drive: {
    label: "Google Drive",
    description: "Fonte principal da pasta EAD, videos e arquivos pesados.",
    icon: Cloud,
  },
  github: {
    label: "GitHub",
    description: "Cache versionado dos arquivos pequenos para deploy no Coolify.",
    icon: Github,
  },
  sql: {
    label: "SQL",
    description: "Historico de migrations, exports e imports do banco do site.",
    icon: Database,
  },
};

const SQL_TEMPLATE = `-- FAESDE sync SQL
-- Use este bloco para registrar migrations, seeds ou exports ligados ao site.
-- Nunca coloque chaves privadas, tokens do GitHub ou credenciais do Drive aqui.

select
  now() as generated_at,
  'faesde' as project,
  'eadplataforma' as scope;`;

interface SyncQueryResponse<T = unknown> {
  data: T | null;
  error: { message: string } | null;
}

interface SyncQueryBuilder {
  select: (columns?: string) => SyncQueryBuilder;
  maybeSingle: <T = unknown>() => PromiseLike<SyncQueryResponse<T>>;
  single: <T = unknown>() => PromiseLike<SyncQueryResponse<T>>;
  order: (column: string, options?: { ascending?: boolean }) => SyncQueryBuilder;
  limit: (count: number) => SyncQueryBuilder;
  insert: (values: unknown) => SyncQueryBuilder;
  update: (values: unknown) => SyncQueryBuilder;
  eq: (column: string, value: unknown) => SyncQueryBuilder;
}

const syncDb = supabase as unknown as {
  from: (table: string) => SyncQueryBuilder;
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

function extensionListToText(value: string[]) {
  return value.join(", ");
}

function textToExtensionList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim().replace(/^\./, "").toLowerCase())
    .filter(Boolean);
}

function collectLocalStats(nodes: EadNode[], maxGithubBytes: number): LocalStats {
  const stats: LocalStats = {
    folders: 0,
    files: 0,
    bytes: 0,
    htmlFiles: 0,
    videos: 0,
    largeFiles: 0,
    githubEligible: 0,
  };

  const visit = (node: EadNode) => {
    if (node.type === "folder") {
      stats.folders += 1;
      node.children.forEach(visit);
      return;
    }

    const ext = node.ext.toLowerCase();
    const isVideo = ["mp4", "webm", "mov", "avi", "mkv"].includes(ext);
    stats.files += 1;
    stats.bytes += node.size;
    stats.htmlFiles += ["html", "htm"].includes(ext) ? 1 : 0;
    stats.videos += isVideo ? 1 : 0;
    stats.largeFiles += node.size > maxGithubBytes ? 1 : 0;
    stats.githubEligible += !isVideo && node.size <= maxGithubBytes ? 1 : 0;
  };

  nodes.forEach(visit);
  return stats;
}

function badgeClass(status: ConnectionStatus | RunStatus) {
  return `border ${STATUS_BADGES[status] || STATUS_BADGES.pending}`;
}

const ConnectionsManager = () => {
  const [settings, setSettings] = useState<SyncSettings | null>(null);
  const [connections, setConnections] = useState<SyncConnection[]>([]);
  const [runs, setRuns] = useState<SyncRun[]>([]);
  const [sqlSnapshots, setSqlSnapshots] = useState<SqlSnapshot[]>([]);
  const [indexData, setIndexData] = useState<IndexFile | null>(null);
  const [databaseReady, setDatabaseReady] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningMode, setRunningMode] = useState<string | null>(null);
  const [sqlName, setSqlName] = useState("Snapshot SQL FAESDE");
  const [sqlTables, setSqlTables] = useState("courses, certificates, sync_settings, sync_items");
  const [sqlContent, setSqlContent] = useState(SQL_TEMPLATE);
  const { toast } = useToast();

  const maxGithubBytes = (settings?.max_github_file_mb || DEFAULT_SETTINGS.max_github_file_mb) * 1024 * 1024;

  const localStats = useMemo(() => {
    if (!indexData) {
      return {
        folders: 0,
        files: 0,
        bytes: 0,
        htmlFiles: 0,
        videos: 0,
        largeFiles: 0,
        githubEligible: 0,
      };
    }
    return collectLocalStats(indexData.tree, maxGithubBytes);
  }, [indexData, maxGithubBytes]);

  const latestRun = runs[0] || null;
  const connectedCount = connections.filter((item) => item.status === "connected").length;
  const syncProgress = latestRun?.progress_percent ?? 0;

  const loadData = async () => {
    setLoading(true);

    try {
      const response = await fetch("/eadplataforma-index.json", { cache: "no-cache" });
      if (response.ok) {
        setIndexData(await response.json());
      }
    } catch {
      setIndexData(null);
    }

    const { data: settingsData, error: settingsError } = await syncDb
      .from("sync_settings")
      .select("*")
      .maybeSingle<SyncSettings>();

    if (settingsError) {
      setDatabaseReady(false);
      setSettings(null);
      setLoading(false);
      return;
    }

    setDatabaseReady(true);
    if (settingsData) setSettings(settingsData);

    const [connectionResult, runResult, snapshotResult] = await Promise.all([
      syncDb.from("sync_connections").select("*").order("provider") as unknown as PromiseLike<
        SyncQueryResponse<SyncConnection[]>
      >,
      syncDb.from("sync_runs").select("*").order("started_at", { ascending: false }).limit(12) as unknown as PromiseLike<
        SyncQueryResponse<SyncRun[]>
      >,
      syncDb
        .from("sync_sql_snapshots")
        .select("*")
        .order("generated_at", { ascending: false })
        .limit(12) as unknown as PromiseLike<SyncQueryResponse<SqlSnapshot[]>>,
    ]);

    setConnections(connectionResult.data || []);
    setRuns(runResult.data || []);
    setSqlSnapshots(snapshotResult.data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const saveSettings = async () => {
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    const payload = {
      drive_root_folder_id: settings?.drive_root_folder_id || DEFAULT_SETTINGS.drive_root_folder_id,
      github_repo: settings?.github_repo || DEFAULT_SETTINGS.github_repo,
      github_branch: settings?.github_branch || DEFAULT_SETTINGS.github_branch,
      public_base_path: settings?.public_base_path || DEFAULT_SETTINGS.public_base_path,
      local_public_path: settings?.local_public_path || DEFAULT_SETTINGS.local_public_path,
      max_github_file_mb: Number(settings?.max_github_file_mb || DEFAULT_SETTINGS.max_github_file_mb),
      excluded_extensions: settings?.excluded_extensions || DEFAULT_SETTINGS.excluded_extensions,
      include_extensions: settings?.include_extensions || DEFAULT_SETTINGS.include_extensions,
      sync_enabled: Boolean(settings?.sync_enabled),
      auto_sync_interval_minutes: Number(
        settings?.auto_sync_interval_minutes || DEFAULT_SETTINGS.auto_sync_interval_minutes,
      ),
      updated_by: userData.user?.id,
    };

    const request = settings?.id
      ? syncDb.from("sync_settings").update(payload).eq("id", settings.id).select().single<SyncSettings>()
      : syncDb.from("sync_settings").insert(payload).select().single<SyncSettings>();

    const { data, error } = await request;
    setSaving(false);

    if (error) {
      toast({ title: "Erro ao salvar conexoes", description: error.message, variant: "destructive" });
      return;
    }

    setSettings(data);
    toast({ title: "Configuracao salva", description: "As regras de sincronizacao foram atualizadas." });
    loadData();
  };

  const updateConnection = async (provider: Provider, values: Partial<SyncConnection>) => {
    const { data: userData } = await supabase.auth.getUser();
    const info = PROVIDER_INFO[provider];
    const existing = connections.find((item) => item.provider === provider);
    const payload = {
      provider,
      display_name: values.display_name || info.label,
      status: values.status || "pending",
      external_id: values.external_id ?? existing?.external_id ?? null,
      metadata: values.metadata ?? existing?.metadata ?? {},
      connected_by: userData.user?.id,
      connected_by_email: userData.user?.email,
      connected_at: values.status === "connected" ? new Date().toISOString() : existing?.connected_at,
      last_checked_at: new Date().toISOString(),
      error_message: values.error_message ?? null,
    };

    if (existing) {
      return syncDb.from("sync_connections").update(payload).eq("id", existing.id).select().single<SyncConnection>();
    }

    return syncDb.from("sync_connections").insert(payload).select().single<SyncConnection>();
  };

  const connectProvider = async (provider: Provider) => {
    if (!databaseReady) {
      toast({ title: "Execute a migration SQL primeiro", variant: "destructive" });
      return;
    }

    setRunningMode(`connect-${provider}`);
    await updateConnection(provider, {
      status: "pending",
      external_id:
        provider === "google_drive"
          ? settings?.drive_root_folder_id
          : provider === "github"
            ? settings?.github_repo
            : "supabase",
      metadata: {
        publicBasePath: settings?.public_base_path,
        secretsRequired:
          provider === "google_drive"
            ? ["GOOGLE_SERVICE_ACCOUNT_JSON", "GOOGLE_DRIVE_ROOT_FOLDER_ID"]
            : provider === "github"
              ? ["GITHUB_TOKEN", "GITHUB_REPO", "GITHUB_BRANCH"]
              : ["SUPABASE_SERVICE_ROLE_KEY"],
      },
    });

    try {
      const response = await fetch("/api/sync/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      await updateConnection(provider, {
        status: "connected",
        external_id: json.externalId,
        metadata: json,
      });
      toast({ title: `${PROVIDER_INFO[provider].label} conectado` });
    } catch {
      await updateConnection(provider, {
        status: "pending",
        error_message:
          "A interface esta pronta. Falta ativar o endpoint /api/sync/connect no backend do Coolify.",
      });
      toast({
        title: "Conexao preparada",
        description: "O painel foi atualizado. A validacao real depende do backend com secrets.",
      });
    } finally {
      setRunningMode(null);
      loadData();
    }
  };

  const runSync = async (mode: string) => {
    if (!databaseReady) {
      toast({ title: "Execute a migration SQL primeiro", variant: "destructive" });
      return;
    }

    setRunningMode(mode);
    const { data: userData } = await supabase.auth.getUser();
    const { data: run, error } = await syncDb
      .from("sync_runs")
      .insert({
        mode,
        status: "queued",
        requested_by: userData.user?.id,
        requested_by_email: userData.user?.email,
        source_provider: mode === "github_to_drive" ? "github" : mode === "sql_export" ? "supabase" : "google_drive",
        target_provider: mode === "drive_to_github" ? "github" : mode === "sql_export" ? "drive_github" : "google_drive",
        total_files: localStats.files,
        folders: localStats.folders,
        total_bytes: localStats.bytes,
        large_files: localStats.largeFiles,
        details: {
          publicBasePath: settings?.public_base_path,
          githubEligible: localStats.githubEligible,
          htmlFiles: localStats.htmlFiles,
          videos: localStats.videos,
        },
      })
      .select()
      .single<SyncRun>();

    if (error) {
      setRunningMode(null);
      toast({ title: "Erro ao criar fila de sync", description: error.message, variant: "destructive" });
      return;
    }

    try {
      const response = await fetch("/api/sync/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, runId: run.id }),
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const json = await response.json();
      await syncDb
        .from("sync_runs")
        .update({
          status: json.status || "running",
          progress_percent: json.progressPercent ?? 10,
          details: json,
        })
        .eq("id", run.id);
      toast({ title: "Sincronizacao iniciada", description: "Acompanhe o progresso no historico." });
    } catch {
      await syncDb
        .from("sync_runs")
        .update({
          status: "queued",
          progress_percent: 0,
          error_message: "Fila criada. Falta ativar o endpoint /api/sync/run no backend do Coolify.",
        })
        .eq("id", run.id);
      toast({
        title: "Fila criada",
        description: "O backend de sincronizacao ainda precisa ser ativado para executar automaticamente.",
      });
    } finally {
      setRunningMode(null);
      loadData();
    }
  };

  const saveSqlSnapshot = async () => {
    if (!databaseReady) {
      toast({ title: "Execute a migration SQL primeiro", variant: "destructive" });
      return;
    }

    const trimmedSql = sqlContent.trim();
    if (!trimmedSql) {
      toast({ title: "Informe o conteudo SQL", variant: "destructive" });
      return;
    }

    setRunningMode("sql_snapshot");
    const { data: userData } = await supabase.auth.getUser();
    const { error } = await syncDb.from("sync_sql_snapshots").insert({
      name: sqlName || "Snapshot SQL FAESDE",
      kind: "migration",
      status: "queued",
      table_names: textToExtensionList(sqlTables),
      file_path: `supabase/migrations/${new Date().toISOString().slice(0, 10)}_faesde_sync.sql`,
      github_path: `supabase/migrations/${new Date().toISOString().slice(0, 10)}_faesde_sync.sql`,
      sql_content: trimmedSql,
      generated_by: userData.user?.id,
      generated_by_email: userData.user?.email,
      metadata: {
        source: "admin-conexoes",
        publicBasePath: settings?.public_base_path,
      },
    });

    setRunningMode(null);

    if (error) {
      toast({ title: "Erro ao registrar SQL", description: error.message, variant: "destructive" });
      return;
    }

    toast({ title: "SQL registrado", description: "O snapshot entrou no historico de sincronizacao." });
    loadData();
  };

  const settingsDraft: SyncSettings = settings || {
    id: "",
    ...DEFAULT_SETTINGS,
    updated_at: new Date().toISOString(),
  };

  if (loading) {
    return <p className="text-center text-muted-foreground py-8">Carregando conexoes...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Conexoes e Sync</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Controle separado para Google Drive, GitHub, SQL e automacao da pasta EAD.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar status
          </Button>
          <Button onClick={() => runSync("full")} disabled={!!runningMode || !databaseReady}>
            {runningMode === "full" ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />}
            Sincronizar tudo
          </Button>
        </div>
      </div>

      {!databaseReady && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            As tabelas de sincronizacao ainda nao existem no banco. A migration SQL foi adicionada ao projeto; depois
            que ela for aplicada, esta tela passa a salvar configuracoes e historico.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-primary" />
              Resumo da sincronizacao
            </CardTitle>
            <CardDescription>Estado geral entre Drive, GitHub, banco e o site publicado.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">Conexoes</p>
                <p className="text-2xl font-bold">{connectedCount}/3</p>
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
                <p className="text-xs text-muted-foreground">Videos/Drive</p>
                <p className="text-2xl font-bold">{localStats.videos}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Ultima execucao</span>
                <span className="font-medium">{latestRun ? STATUS_LABELS[latestRun.status] : "Sem historico"}</span>
              </div>
              <Progress value={syncProgress} />
              <p className="text-xs text-muted-foreground">
                Ultimo indice local: {formatDate(indexData?.generatedAt)}. Volume atual: {formatSize(localStats.bytes)}.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Server className="h-5 w-5 text-primary" />
              Publicacao
            </CardTitle>
            <CardDescription>Caminhos usados pelo site.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">URL publica</p>
              <p className="font-mono text-xs break-all">{settingsDraft.public_base_path}/</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pasta no projeto</p>
              <p className="font-mono text-xs break-all">{settingsDraft.local_public_path}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Arquivos acima do limite</p>
              <p className="font-semibold">{localStats.largeFiles} ficam para proxy/Drive</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldCheck className="h-5 w-5 text-primary" />
              Seguranca
            </CardTitle>
            <CardDescription>Tokens ficam fora do navegador.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>Drive: service account no backend.</p>
            <p>GitHub: token em variavel secreta.</p>
            <p>SQL: executado apenas por migration/API segura.</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList className="flex h-auto flex-wrap justify-start">
          <TabsTrigger value="connections">Conexoes</TabsTrigger>
          <TabsTrigger value="settings">Regras EAD</TabsTrigger>
          <TabsTrigger value="history">Historico</TabsTrigger>
          <TabsTrigger value="sql">SQL</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {(Object.keys(PROVIDER_INFO) as Provider[]).map((provider) => {
              const info = PROVIDER_INFO[provider];
              const Icon = info.icon;
              const connection = connections.find((item) => item.provider === provider);
              const status = connection?.status || "disconnected";
              const busy = runningMode === `connect-${provider}`;

              return (
                <Card key={provider}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 text-lg">
                      <span className="flex items-center gap-2">
                        <Icon className="h-5 w-5 text-primary" />
                        {info.label}
                      </span>
                      <Badge variant="outline" className={badgeClass(status)}>
                        {STATUS_LABELS[status]}
                      </Badge>
                    </CardTitle>
                    <CardDescription>{info.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Identificador</p>
                        <p className="font-mono text-xs break-all">
                          {connection?.external_id ||
                            (provider === "google_drive"
                              ? settingsDraft.drive_root_folder_id
                              : provider === "github"
                                ? `${settingsDraft.github_repo}:${settingsDraft.github_branch}`
                                : "Supabase SQL")}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Ultima checagem</p>
                        <p>{formatDate(connection?.last_checked_at)}</p>
                      </div>
                      {connection?.error_message && (
                        <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">{connection.error_message}</p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      variant={status === "connected" ? "outline" : "default"}
                      disabled={!!runningMode || !databaseReady}
                      onClick={() => connectProvider(provider)}
                    >
                      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
                      {status === "connected" ? "Revalidar conexao" : "Conectar"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regras de sincronizacao da EADPlataforma</CardTitle>
              <CardDescription>
                Arquivos pequenos podem ir para o GitHub. Videos e arquivos pesados ficam no Drive e sao servidos por
                proxy quando o backend estiver ativo.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2">
                <Label>ID da pasta raiz no Drive</Label>
                <Input
                  value={settingsDraft.drive_root_folder_id}
                  onChange={(event) => setSettings({ ...settingsDraft, drive_root_folder_id: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Repositorio GitHub</Label>
                <Input
                  value={settingsDraft.github_repo}
                  onChange={(event) => setSettings({ ...settingsDraft, github_repo: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Branch</Label>
                <Input
                  value={settingsDraft.github_branch}
                  onChange={(event) => setSettings({ ...settingsDraft, github_branch: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Limite para cache no GitHub (MB)</Label>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={settingsDraft.max_github_file_mb}
                  onChange={(event) =>
                    setSettings({ ...settingsDraft, max_github_file_mb: Number(event.target.value) || 25 })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Caminho publico</Label>
                <Input
                  value={settingsDraft.public_base_path}
                  onChange={(event) => setSettings({ ...settingsDraft, public_base_path: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Pasta local no projeto</Label>
                <Input
                  value={settingsDraft.local_public_path}
                  onChange={(event) => setSettings({ ...settingsDraft, local_public_path: event.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Extensoes sempre fora do GitHub</Label>
                <Textarea
                  value={extensionListToText(settingsDraft.excluded_extensions)}
                  onChange={(event) =>
                    setSettings({ ...settingsDraft, excluded_extensions: textToExtensionList(event.target.value) })
                  }
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Extensoes preferidas para cache</Label>
                <Textarea
                  value={extensionListToText(settingsDraft.include_extensions)}
                  onChange={(event) =>
                    setSettings({ ...settingsDraft, include_extensions: textToExtensionList(event.target.value) })
                  }
                  rows={3}
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border p-4 lg:col-span-2">
                <div>
                  <p className="font-medium">Sincronizacao automatica</p>
                  <p className="text-sm text-muted-foreground">
                    Quando o backend estiver ativo, roda a cada {settingsDraft.auto_sync_interval_minutes} minutos.
                  </p>
                </div>
                <Switch
                  checked={settingsDraft.sync_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settingsDraft, sync_enabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Intervalo automatico (minutos)</Label>
                <Input
                  type="number"
                  min={5}
                  value={settingsDraft.auto_sync_interval_minutes}
                  onChange={(event) =>
                    setSettings({
                      ...settingsDraft,
                      auto_sync_interval_minutes: Number(event.target.value) || 60,
                    })
                  }
                />
              </div>
              <div className="flex items-end">
                <Button className="w-full" onClick={saveSettings} disabled={saving || !databaseReady}>
                  {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Salvar regras
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Historico de execucoes</CardTitle>
              <CardDescription>Ultimas tentativas de sync entre Drive, GitHub, site e SQL.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-wrap gap-2">
                <Button variant="outline" onClick={() => runSync("drive_to_github")} disabled={!!runningMode || !databaseReady}>
                  <Cloud className="mr-2 h-4 w-4" />
                  Drive para GitHub
                </Button>
                <Button variant="outline" onClick={() => runSync("github_to_drive")} disabled={!!runningMode || !databaseReady}>
                  <Github className="mr-2 h-4 w-4" />
                  GitHub para Drive
                </Button>
                <Button variant="outline" onClick={() => runSync("sql_export")} disabled={!!runningMode || !databaseReady}>
                  <Database className="mr-2 h-4 w-4" />
                  Sincronizar SQL
                </Button>
              </div>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Arquivos</TableHead>
                      <TableHead className="hidden md:table-cell">Volume</TableHead>
                      <TableHead className="hidden md:table-cell">Inicio</TableHead>
                      <TableHead className="hidden lg:table-cell">Commit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {runs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                          Nenhuma execucao registrada.
                        </TableCell>
                      </TableRow>
                    ) : (
                      runs.map((run) => (
                        <TableRow key={run.id}>
                          <TableCell className="font-medium">{run.mode}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className={badgeClass(run.status)}>
                              {STATUS_LABELS[run.status]}
                            </Badge>
                            {run.error_message && <p className="mt-1 max-w-xs text-xs text-amber-700">{run.error_message}</p>}
                          </TableCell>
                          <TableCell>
                            {run.synced_files}/{run.total_files} sincronizados
                            <p className="text-xs text-muted-foreground">
                              {run.skipped_files} ignorados, {run.failed_files} falhas
                            </p>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {formatSize(run.cached_bytes)} / {formatSize(run.total_bytes)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">{formatDate(run.started_at)}</TableCell>
                          <TableCell className="hidden lg:table-cell font-mono text-xs">
                            {run.commit_sha ? run.commit_sha.slice(0, 10) : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sql" className="space-y-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileCode2 className="h-5 w-5 text-primary" />
                  Registrar SQL para sincronizacao
                </CardTitle>
                <CardDescription>
                  Use para salvar uma migration, seed ou export no formato SQL que o projeto ja usa em
                  supabase/migrations.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Nome</Label>
                    <Input value={sqlName} onChange={(event) => setSqlName(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tabelas envolvidas</Label>
                    <Input value={sqlTables} onChange={(event) => setSqlTables(event.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Conteudo SQL</Label>
                  <Textarea
                    className="min-h-[220px] font-mono text-xs"
                    value={sqlContent}
                    onChange={(event) => setSqlContent(event.target.value)}
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button onClick={saveSqlSnapshot} disabled={!!runningMode || !databaseReady}>
                    {runningMode === "sql_snapshot" ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Salvar SQL no historico
                  </Button>
                  <Button variant="outline" onClick={() => runSync("sql_export")} disabled={!!runningMode || !databaseReady}>
                    <Database className="mr-2 h-4 w-4" />
                    Sincronizar SQL
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GitBranch className="h-5 w-5 text-primary" />
                  Destino do SQL
                </CardTitle>
                <CardDescription>Como o pacote sera publicado.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">GitHub</p>
                  <p className="font-mono text-xs break-all">
                    {settingsDraft.github_repo}@{settingsDraft.github_branch}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Pasta padrao</p>
                  <p className="font-mono text-xs">supabase/migrations</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Drive</p>
                  <p className="font-mono text-xs break-all">{settingsDraft.drive_root_folder_id}</p>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={`https://github.com/${settingsDraft.github_repo}/tree/${settingsDraft.github_branch}/supabase/migrations`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir migrations
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historico SQL</CardTitle>
              <CardDescription>Snapshots, exports e migrations registrados pelo painel.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden md:table-cell">Tabelas</TableHead>
                      <TableHead className="hidden md:table-cell">Arquivo</TableHead>
                      <TableHead>Gerado em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sqlSnapshots.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                          Nenhum SQL registrado.
                        </TableCell>
                      </TableRow>
                    ) : (
                      sqlSnapshots.map((snapshot) => (
                        <TableRow key={snapshot.id}>
                          <TableCell>
                            <p className="font-medium">{snapshot.name}</p>
                            <p className="text-xs text-muted-foreground">{snapshot.kind}</p>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={badgeClass(snapshot.status as RunStatus)}>
                              {STATUS_LABELS[snapshot.status as RunStatus] || snapshot.status}
                            </Badge>
                            {snapshot.error_message && (
                              <p className="mt-1 max-w-xs text-xs text-amber-700">{snapshot.error_message}</p>
                            )}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-xs">
                            {(snapshot.table_names || []).join(", ") || "-"}
                          </TableCell>
                          <TableCell className="hidden md:table-cell font-mono text-xs">
                            {snapshot.github_path || snapshot.file_path || "-"}
                          </TableCell>
                          <TableCell>{formatDate(snapshot.generated_at)}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Alert>
        <Clock className="h-4 w-4" />
        <AlertDescription>
          Proxima etapa tecnica: criar o backend /api/sync no Coolify com GOOGLE_SERVICE_ACCOUNT_JSON, GITHUB_TOKEN e
          SUPABASE_SERVICE_ROLE_KEY. Esta tela ja deixa o painel preparado para acionar e acompanhar esse processo.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ConnectionsManager;
