import { useQuery } from "@tanstack/react-query";
import { Provider } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Örnek ürün bilgisi
const sampleProduct = {
  id: 1,
  name: "Test Ürünü",
  price: 99.99,
  currency: "TRY"
};

const paymentFormSchema = z.object({
  cardNumber: z.string().min(16, "Kart numarası 16 haneli olmalıdır").max(16),
  expiryMonth: z.string().min(2, "Ay 2 haneli olmalıdır").max(2),
  expiryYear: z.string().min(2, "Yıl 2 haneli olmalıdır").max(2),
  cvv: z.string().min(3, "CVV 3 haneli olmalıdır").max(3),
  cardHolderName: z.string().min(1, "Kart sahibinin adını giriniz")
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

export default function Checkout() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardHolderName: ""
    }
  });

  const { data: providers } = useQuery<Provider[]>({ 
    queryKey: ["/api/providers"]
  });

  const activeProvider = providers?.find(p => p.isActive);

  const handlePayment = async (formData: PaymentFormData) => {
    setLoading(true);
    try {
      const response = await apiRequest("POST", "/api/payment/process", {
        amount: sampleProduct.price,
        currency: sampleProduct.currency,
        productId: sampleProduct.id,
        productName: sampleProduct.name,
        cardDetails: {
          number: formData.cardNumber,
          expiryMonth: formData.expiryMonth,
          expiryYear: formData.expiryYear,
          cvv: formData.cvv,
          holderName: formData.cardHolderName
        }
      });
      const result = await response.json();
      toast({
        title: "Ödeme başarılı",
        description: `İşlem ID: ${result.transactionId}`
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Ödeme başarısız",
        description: error instanceof Error ? error.message : "Bir hata oluştu",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8">
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Sayfası</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span>Ürün:</span>
            <span>{sampleProduct.name}</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>Tutar:</span>
            <span>{sampleProduct.price} {sampleProduct.currency}</span>
          </div>
          {activeProvider && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Ödeme yöntemi:</span>
              <span>{activeProvider.name} {activeProvider.isTestMode ? "(Test Modu)" : ""}</span>
            </div>
          )}

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kart Numarası</FormLabel>
                    <FormControl>
                      <Input placeholder="1234 5678 9012 3456" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ay</FormLabel>
                      <FormControl>
                        <Input placeholder="MM" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Yıl</FormLabel>
                      <FormControl>
                        <Input placeholder="YY" maxLength={2} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input placeholder="123" maxLength={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="cardHolderName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kart Sahibinin Adı</FormLabel>
                    <FormControl>
                      <Input placeholder="Ad Soyad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit"
                className="w-full" 
                disabled={loading || !activeProvider}
              >
                {!activeProvider 
                  ? "Aktif ödeme yöntemi bulunamadı" 
                  : loading 
                    ? "İşleniyor..." 
                    : "Ödemeyi Tamamla"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter></CardFooter>
      </Card>
    </div>
  );
}