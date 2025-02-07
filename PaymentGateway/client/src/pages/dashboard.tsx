import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Provider } from "@shared/schema";

export default function Dashboard() {
  const { data: providers } = useQuery<Provider[]>({ 
    queryKey: ["/api/providers"]
  });

  const activeProviders = providers?.filter(p => p.isActive) ?? [];
  const testModeProviders = providers?.filter(p => p.isTestMode) ?? [];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{providers?.length ?? 0}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Active Providers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{activeProviders.length}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Test Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{testModeProviders.length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
