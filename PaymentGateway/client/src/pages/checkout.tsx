import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Provider } from "@shared/schema";

const sampleProduct = {
  id: 1,
  name: "Örnek Ürün",
  price: 9600,
  currency: "TL"
};

export default function Checkout() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const { data: providers } = useQuery<Provider[]>({ 
    queryKey: ["/api/providers"]
  });

  const { data: bankInstallments = [], error } = useQuery({
    queryKey: ["/api/payment/installments", sampleProduct.price],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/payment/installments?amount=${sampleProduct.price}`);
        if (!response.ok) {
          throw new Error("Taksit bilgileri alınamadı");
        }
        return response.json();
      } catch (err) {
        console.error("Taksit bilgisi alma hatası:", err);
        throw err;
      }
    }
  });

  const handlePayment = async (installment: number, bankName: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/payment/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: sampleProduct.price,
          currency: sampleProduct.currency,
          installment,
          bankName
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);
      if (result.redirectUrl) window.location.href = result.redirectUrl;

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

  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery({
    queryKey: ["/api/payments"],
    queryFn: async () => {
      const response = await fetch('/api/payments');
      if (!response.ok) {
        throw new Error('Ödemeler alınamadı');
      }
      return response.json();
    }
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Ödeme Detayları</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-lg font-semibold">Toplam Tutar: {sampleProduct.price} {sampleProduct.currency}</p>
            <Button onClick={() => handlePayment(1, "")}>Tek Çekim Ödeme Yap</Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bankInstallments.map((bank: any) => (
          <Card key={bank.bankName} className="overflow-hidden">
            <CardHeader className="bg-card border-b">
              <div className="flex items-center gap-4">
                {bank.bankLogo && (
                  <img src={bank.bankLogo} alt={bank.bankName} className="h-8 object-contain" />
                )}
                <CardTitle className="text-lg">{bank.bankName}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Taksit Sayısı</TableHead>
                    <TableHead>Taksit (TL)</TableHead>
                    <TableHead>Toplam (TL)</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bank.installments.map((inst: any) => (
                    <TableRow key={inst.count}>
                      <TableCell>{inst.count}</TableCell>
                      <TableCell>{inst.monthlyAmount.toLocaleString('tr-TR')}</TableCell>
                      <TableCell>{inst.totalAmount.toLocaleString('tr-TR')}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handlePayment(inst.count, bank.bankName)}
                          disabled={loading}
                        >
                          {loading ? "İşleniyor..." : "Ödeme Yap"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Ödeme Geçmişi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tarih</TableHead>
                <TableHead>Tutar</TableHead>
                <TableHead>Taksit</TableHead>
                <TableHead>Durum</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isPaymentsLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Yükleniyor...</TableCell>
                </TableRow>
              ) : payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center">Henüz ödeme bulunmuyor</TableCell>
                </TableRow>
              ) : (
                payments.map((payment: any) => (
                  <TableRow key={payment.id}>
                    <TableCell>{new Date(payment.createdAt).toLocaleString('tr-TR')}</TableCell>
                    <TableCell>{payment.amount} {payment.currency}</TableCell>
                    <TableCell>{payment.installment}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        payment.status === 'success' ? 'bg-green-100 text-green-800' :
                        payment.status === 'failed' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status === 'success' ? 'Başarılı' :
                         payment.status === 'failed' ? 'Başarısız' : 'Beklemede'}
                      </span>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}