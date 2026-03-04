import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2 } from "lucide-react";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function Dashboard() {
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading, refetch: refetchDashboard } = trpc.logistics.kpis.dashboard.useQuery({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  // Fetch deliveries for charts
  const { data: deliveries, isLoading: deliveriesLoading, refetch: refetchDeliveries } = trpc.logistics.deliveries.list.useQuery();

  // Fetch vehicles
  const { data: vehicles, isLoading: vehiclesLoading } = trpc.logistics.vehicles.list.useQuery();

  // Auto-refresh every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      refetchDashboard();
      refetchDeliveries();
    }, 5000);

    return () => clearInterval(interval);
  }, [refetchDashboard, refetchDeliveries]);

  if (dashboardLoading || deliveriesLoading || vehiclesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  // Prepare data for charts
  const deliveryStatusData = dashboardData
    ? [
        { name: "Pendente", value: dashboardData.deliveryStatusCount.pending, fill: "#3b82f6" },
        { name: "Coletado", value: dashboardData.deliveryStatusCount.collected, fill: "#60a5fa" },
        { name: "Em Trânsito", value: dashboardData.deliveryStatusCount.in_transit, fill: "#f59e0b" },
        { name: "Entregue", value: dashboardData.deliveryStatusCount.delivered, fill: "#10b981" },
        { name: "Atrasado", value: dashboardData.deliveryStatusCount.delayed, fill: "#ef4444" },
        { name: "Cancelado", value: dashboardData.deliveryStatusCount.cancelled, fill: "#8b5cf6" },
      ]
    : [];

  const vehicleStatusData = dashboardData
    ? [
        { name: "Disponível", value: dashboardData.vehicleStatusCount.available, fill: "#10b981" },
        { name: "Em Trânsito", value: dashboardData.vehicleStatusCount.in_transit, fill: "#f59e0b" },
        { name: "Manutenção", value: dashboardData.vehicleStatusCount.maintenance, fill: "#ef4444" },
      ]
    : [];

  // Group deliveries by region for bar chart
  const deliveriesByRegion = deliveries
    ? Object.entries(
        deliveries.reduce(
          (acc, d) => {
            acc[d.region] = (acc[d.region] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        )
      )
        .map(([region, count]) => ({ region, count }))
        .sort((a, b) => b.count - a.count)
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Logistics Command Center</h1>
          <p className="text-slate-600">Dashboard em tempo real de operações logísticas</p>
        </div>

        {/* Date Range Filter */}
        <div className="mb-6 flex gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data Inicial</label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Data Final</label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">OTD (On-Time Delivery)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{dashboardData?.otd.toFixed(1)}%</div>
              <p className="text-xs text-slate-500 mt-1">Taxa de entregas no prazo</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Tempo Médio</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">{dashboardData?.avgTime.toFixed(1)}h</div>
              <p className="text-xs text-slate-500 mt-1">Horas para entrega</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Faturamento</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">R$ {(dashboardData?.revenue || 0).toFixed(0)}</div>
              <p className="text-xs text-slate-500 mt-1">Total de receitas</p>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Lucro</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${(dashboardData?.profit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                R$ {(dashboardData?.profit || 0).toFixed(0)}
              </div>
              <p className="text-xs text-slate-500 mt-1">Receita - Custos</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Delivery Status Pie Chart */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Status das Entregas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={deliveryStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {deliveryStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Vehicle Status Pie Chart */}
          <Card className="bg-white shadow-lg">
            <CardHeader>
              <CardTitle>Status dos Veículos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={vehicleStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {vehicleStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Deliveries by Region Bar Chart */}
        <Card className="bg-white shadow-lg">
          <CardHeader>
            <CardTitle>Entregas por Região</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={deliveriesByRegion}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="region" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3b82f6" name="Quantidade de Entregas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total de Entregas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{dashboardData?.totalDeliveries || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Total de Veículos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">{dashboardData?.totalVehicles || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">Custos Operacionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-900">R$ {(dashboardData?.costs || 0).toFixed(0)}</div>
            </CardContent>
          </Card>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Atualizado em tempo real • Próxima atualização em 5 segundos</p>
        </div>
      </div>
    </div>
  );
}
