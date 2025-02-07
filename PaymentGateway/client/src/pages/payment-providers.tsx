import { useQuery } from "@tanstack/react-query";
import { Provider } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ProviderForm } from "@/components/providers/provider-form";
import { ProviderCard } from "@/components/providers/provider-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SiVisa, SiMastercard, SiAmericanexpress, SiPaypal } from "react-icons/si";
import { IconType } from "react-icons";

const providerIcons: Record<string, IconType> = {
  iyzico: SiVisa,
  paytr: SiMastercard,
  paynkolay: SiAmericanexpress,
  paybull: SiPaypal
};

export default function PaymentProviders() {
  const [open, setOpen] = useState(false);
  const { data: providers } = useQuery<Provider[]>({ 
    queryKey: ["/api/providers"]
  });

  const activeProvider = providers?.find(p => p.isActive);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Payment Providers</h1>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Provider
        </Button>
      </div>

      {providers && providers.length > 0 ? (
        <Tabs defaultValue={activeProvider?.type ?? providers[0].type} className="w-full">
          <TabsList className="w-full justify-start">
            {providers.map((provider) => {
              const Icon = providerIcons[provider.type];
              return (
                <TabsTrigger 
                  key={provider.id} 
                  value={provider.type}
                  className="flex items-center gap-2"
                >
                  {Icon && <Icon className="h-4 w-4" />}
                  {provider.name}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {providers.map((provider) => (
            <TabsContent key={provider.id} value={provider.type}>
              <ProviderCard provider={provider} />
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          Henüz ödeme sağlayıcısı eklenmemiş
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ödeme Sağlayıcısı Ekle</DialogTitle>
          </DialogHeader>
          <ProviderForm onSuccess={() => setOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}