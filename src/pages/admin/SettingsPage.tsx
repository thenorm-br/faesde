import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Settings } from "lucide-react";

const SettingsPage = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleChangePassword = async () => {
    if (newPassword.length < 6) {
      toast({ title: "A senha deve ter pelo menos 6 caracteres.", variant: "destructive" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({ title: "As senhas não coincidem.", variant: "destructive" });
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Senha alterada com sucesso!" });
      setNewPassword("");
      setConfirmPassword("");
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Configurações</h2>

      <div className="max-w-md rounded-xl bg-card p-6 shadow-sm border border-border space-y-4">
        <div className="flex items-center gap-2 text-foreground">
          <Settings className="h-5 w-5" />
          <h3 className="text-lg font-semibold">Alterar Senha</h3>
        </div>

        <div className="space-y-2">
          <Label>Nova Senha</Label>
          <Input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div className="space-y-2">
          <Label>Confirmar Senha</Label>
          <Input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <Button onClick={handleChangePassword} disabled={loading} className="w-full">
          {loading ? "Salvando..." : "Alterar Senha"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
