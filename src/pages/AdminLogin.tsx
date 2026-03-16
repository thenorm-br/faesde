import { useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Lock, User } from "lucide-react";

const AdminLogin = () => {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const resolveEmail = async (input: string): Promise<string> => {
    // Se o input contém @, assume que é email
    if (input.includes("@")) {
      return input;
    }
    
    // Caso contrário, busca o email pelo username
    const { data, error } = await supabase
      .rpc("get_email_by_username", { _username: input });
    
    if (error || !data) {
      // Fallback: se username for "admin", retorna o email conhecido
      if (input.toLowerCase() === "admin") {
        return "marketing@faesde.com";
      }
      throw new Error("Usuário não encontrado.");
    }
    
    return data;
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const email = await resolveEmail(identifier);
      
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      // Check if user has admin role
      const { data: roles, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id)
        .eq("role", "admin");

      if (roleError || !roles || roles.length === 0) {
        await supabase.auth.signOut();
        throw new Error("Acesso negado. Você não tem permissão de administrador.");
      }

      toast({ title: "Login realizado com sucesso!" });
      navigate("/admin");
    } catch (error: any) {
      toast({
        title: "Erro no login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-lg">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
            <Lock className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="mt-2 text-sm text-muted-foreground">FAESDE - Acesso restrito</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="identifier">Usuário ou E-mail</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Usuário ou e-mail"
                className="pl-10"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
