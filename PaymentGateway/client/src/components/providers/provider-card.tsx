import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Provider } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Trash2, Globe, Key, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { SiVisa, SiMastercard, SiAmericanexpress, SiPaypal } from "react-icons/si";
import { IconType } from "react-icons";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";
import { ProviderForm } from "./provider-form";

const providerIcons: Record<string, IconType> = {
  iyzico: SiVisa,
  paytr: SiMastercard,
  paynkolay: SiAmericanexpress,
  paybull: SiPaypal
};

export function ProviderCard({ provider }: { provider: Provider }) {
  const { toast } = useToast();
  const Icon = providerIcons[provider.type];
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  const updateMutation = useMutation({
    mutationFn: async (update: Partial<Provider>) => {
      await apiRequest("PATCH", `/api/providers/${provider.id}`, update);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ title: "Sağlayıcı güncellendi" });
    },
    onError: (error) => {
      toast({ 
        title: "Hata",
        description: error instanceof Error ? error.message : "Güncelleme sırasında bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/providers/${provider.id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ title: "Sağlayıcı silindi" });
    },
    onError: (error) => {
      toast({ 
        title: "Hata",
        description: error instanceof Error ? error.message : "Silme sırasında bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  const config = provider.config as { apiKey: string; secretKey: string; endpoint?: string };

  return (
    <>
      <Card className="mt-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-2">
            {Icon && <Icon className="h-6 w-6" />}
            <CardTitle className="text-xl font-medium">
              {provider.name}
            </CardTitle>
            {provider.isTestMode && (
              <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                Test Modu
              </span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditDialogOpen(true)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => deleteMutation.mutate()}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Aktif</span>
              <Switch
                checked={provider.isActive}
                onCheckedChange={(checked) => 
                  updateMutation.mutate({ isActive: checked })
                }
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Test Modu</span>
              <Switch
                checked={provider.isTestMode}
                onCheckedChange={(checked) =>
                  updateMutation.mutate({ isTestMode: checked })
                }
              />
            </div>

            <div className="space-y-2 pt-4">
              <div className="flex items-center space-x-2 text-sm">
                <Key className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">API Key:</span>
                <span className="font-mono">•••••••••</span>
              </div>
              {config.endpoint && (
                <div className="flex items-center space-x-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Endpoint:</span>
                  <span className="truncate">{config.endpoint}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sağlayıcı Düzenle</DialogTitle>
          </DialogHeader>
          <ProviderForm 
            provider={provider}
            onSuccess={() => setEditDialogOpen(false)} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}