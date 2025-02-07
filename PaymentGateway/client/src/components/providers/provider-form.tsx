import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertProviderSchema, providerTypes, type Provider, API_ENDPOINTS } from "@shared/schema";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";

interface ProviderFormProps {
  provider?: Provider;
  onSuccess: () => void;
}

export function ProviderForm({ provider, onSuccess }: ProviderFormProps) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(insertProviderSchema),
    defaultValues: provider ? {
      name: provider.name,
      type: provider.type,
      isActive: provider.isActive,
      isTestMode: provider.isTestMode,
      config: provider.config,
    } : {
      name: "",
      type: "iyzico",
      isActive: false,
      isTestMode: true,
      config: {
        apiKey: "",
        secretKey: "",
        merchantId: "",
        endpoint: API_ENDPOINTS.iyzico.test,
      },
    },
  });

  // Test modu veya provider tipi değiştiğinde endpoint'i güncelle
  useEffect(() => {
    const type = form.watch("type") as keyof typeof API_ENDPOINTS;
    const isTestMode = form.watch("isTestMode");
    const endpoint = isTestMode ? API_ENDPOINTS[type].test : API_ENDPOINTS[type].production;
    form.setValue("config.endpoint", endpoint);
  }, [form.watch("type"), form.watch("isTestMode")]);

  const mutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        if (provider) {
          // Update existing provider
          const response = await apiRequest("PATCH", `/api/providers/${provider.id}`, data);
          return await response.json();
        } else {
          // Create new provider
          const response = await apiRequest("POST", "/api/providers", data);
          return await response.json();
        }
      } catch (error) {
        console.error("Form submission error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/providers"] });
      toast({ 
        title: provider 
          ? "Ödeme sağlayıcısı güncellendi" 
          : "Ödeme sağlayıcısı eklendi" 
      });
      if (!provider) {
        form.reset();
      }
      onSuccess();
    },
    onError: (error) => {
      toast({ 
        title: "Hata",
        description: error instanceof Error ? error.message : "İşlem sırasında bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>İsim</FormLabel>
              <FormControl>
                <Input placeholder="Ödeme sağlayıcı ismi" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sağlayıcı Tipi</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={!!provider} 
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sağlayıcı tipini seçin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {providerTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between items-center space-x-4">
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Aktif</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isTestMode"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Test Modu</FormLabel>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="config.apiKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Key</FormLabel>
              <FormControl>
                <Input placeholder="API anahtarı" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.secretKey"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Secret Key</FormLabel>
              <FormControl>
                <Input type="password" placeholder="Gizli anahtar" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.endpoint"
          render={({ field }) => (
            <FormItem>
              <FormLabel>API Endpoint</FormLabel>
              <FormControl>
                <Input 
                  placeholder="https://api.example.com" 
                  {...field}
                  disabled={true}
                  className="bg-muted"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={mutation.isPending}>
          {mutation.isPending ? "İşleniyor..." : (provider ? "Güncelle" : "Sağlayıcı Ekle")}
        </Button>
      </form>
    </Form>
  );
}