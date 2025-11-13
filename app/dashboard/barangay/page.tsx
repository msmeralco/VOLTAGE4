"use client";

import { useEffect, useMemo, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CSVMapView } from "@/components/csv-map-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Zap, Activity } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, AreaChart, Area } from "recharts";
import type { DashboardDataResponse, TransformerRealtimeMetrics } from "@/types/dashboard";

const BARANGAY = "UP Diliman";

export default function BarangayDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardDataResponse | null>(null);
  const [selectedTransformerId, setSelectedTransformerId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshIntervalSeconds, setRefreshIntervalSeconds] = useState<number>(15);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      try {
        const response = await fetch(`/api/dashboard-data?city=${encodeURIComponent(BARANGAY)}`);
        const result = await response.json();
        if (result.success) {
          setDashboardData(result.data);
          setRefreshIntervalSeconds(result.data.refreshIntervalSeconds ?? 15);
          if (!selectedTransformerId && result.data.transformers.length) {
            // Select the first PolePadTransformer instead of SubTransmission
            const polePadTransformer = result.data.transformers.find(
              (t: TransformerRealtimeMetrics) => t.transformer.EntityType === "PolePadTransformer"
            );
            setSelectedTransformerId(
              polePadTransformer?.transformer.ID || result.data.transformers[0].transformer.ID
            );
          }
        }
      } catch (error) {
        console.error("Error fetching barangay data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
    intervalId = setInterval(fetchData, refreshIntervalSeconds * 1000);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [selectedTransformerId, refreshIntervalSeconds]);

  const selectedTransformer: TransformerRealtimeMetrics | undefined = useMemo(() => {
    if (!dashboardData || !selectedTransformerId) return undefined;
    return dashboardData.transformers.find((item) => item.transformer.ID === selectedTransformerId);
  }, [dashboardData, selectedTransformerId]);

  const loadData = useMemo(() => {
    if (!dashboardData) return [];
    return dashboardData.transformers
      .filter((t) => t.transformer.EntityType === "PolePadTransformer")
      .map((metric) => ({
        name: metric.transformer.ID,
        load: metric.currentLoadKw,
        buildings: metric.transformer.NumDownstreamBuildings,
      }));
  }, [dashboardData]);

  const summary = dashboardData?.summary;

  const forecastChartData = selectedTransformer?.forecast.points.map((point) => ({
    ...point,
    label: `+${point.offsetHours}h`,
  })) ?? [];

  return (
    <DashboardLayout title="Barangay Dashboard">
      <div className="space-y-6">
        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Barangay Grid Health Index</CardTitle>
            <CardDescription className="text-orange-100">Barangay {BARANGAY}</CardDescription>
          </CardHeader>
          <CardContent className="flex items-end justify-between">
            <div>
              <p className="text-4xl font-semibold">{summary ? summary.bghiScore.toFixed(1) : "--"}</p>
              <p className="text-xs uppercase tracking-wide mt-1">
                {summary ? summary.status : "Loading"}
              </p>
            </div>
            <Activity className="h-10 w-10 text-white/80" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Barangay Grid Map</CardTitle>
            <CardDescription>Transformers and connected households within {BARANGAY}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading || !dashboardData ? (
              <div className="h-[600px] flex items-center justify-center">
                <p className="text-gray-500">Loading barangay data...</p>
              </div>
            ) : (
              <CSVMapView
                transformers={dashboardData.transformers}
                selectedTransformerId={selectedTransformerId}
                onTransformerSelect={setSelectedTransformerId}
              />
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Transformer Details</CardTitle>
              <CardDescription>
                {selectedTransformer ? selectedTransformer.transformer.ID : "Select a transformer for details"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedTransformer ? (
                <>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Current Load</p>
                      <p className="text-xl font-semibold">
                        {selectedTransformer.currentLoadKw.toFixed(2)} kW ({selectedTransformer.loadPercentage.toFixed(1)}%)
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Status</p>
                      <p className={`text-xl font-semibold ${selectedTransformer.loadPercentage >= 95
                        ? "text-red-500"
                        : selectedTransformer.loadPercentage >= 80
                        ? "text-orange-500"
                        : selectedTransformer.loadPercentage >= 65
                        ? "text-amber-500"
                        : "text-green-600"}`}>
                        {selectedTransformer.loadPercentage >= 95
                          ? "Critical"
                          : selectedTransformer.loadPercentage >= 80
                          ? "High"
                          : selectedTransformer.loadPercentage >= 65
                          ? "Elevated"
                          : "Normal"}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Outage (24h)</p>
                      <p className="text-xl font-semibold">{selectedTransformer.outageMinutes24h.toFixed(1)} min</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Spike Events</p>
                      <p className="text-xl font-semibold">{selectedTransformer.spikeEvents24h}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Forecast (24h)</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <AreaChart data={forecastChartData}>
                        <defs>
                          <linearGradient id="barangayRiskGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#22c55e" stopOpacity={0.6} />
                            <stop offset="70%" stopColor="#f97316" stopOpacity={0.6} />
                            <stop offset="100%" stopColor="#ef4444" stopOpacity={0.7} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="label" hide />
                        <YAxis hide />
                        <Tooltip contentStyle={{ fontSize: "0.75rem" }} />
                        <Area type="monotone" dataKey="predictedLoadKw" stroke="#f97316" strokeWidth={2} fill="url(#barangayRiskGradient)" />
                      </AreaChart>
                    </ResponsiveContainer>
                    {selectedTransformer.forecast.overloadAlert ? (
                      <div className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                        <p className="font-semibold flex items-center space-x-2">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Predictive Overload Risk</span>
                        </p>
                        <p className="mt-1">{selectedTransformer.forecast.overloadAlert.recommendedAction}</p>
                      </div>
                    ) : null}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-2">Recent anomalies</p>
                    {selectedTransformer.recentAnomalies.length ? (
                      <ul className="space-y-2 text-xs text-gray-600">
                        {selectedTransformer.recentAnomalies.map((anomaly, index) => (
                          <li key={`${anomaly.anomalyType}-${anomaly.timestamp}-${index}`} className="rounded-md border border-gray-100 dark:border-gray-800 p-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-gray-700 dark:text-gray-200">{anomaly.anomalyType}</span>
                              <span className="text-[10px] uppercase tracking-wide text-gray-400">{new Date(anomaly.timestamp).toLocaleTimeString()}</span>
                            </div>
                            <p className="text-[11px] text-gray-500 mt-1">Severity: {anomaly.severity} · Confidence: {(anomaly.confidence * 100).toFixed(0)}%</p>
                            <p className="text-[11px] text-gray-500">{anomaly.recommendedAction}</p>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-xs text-gray-400">No anomalies in the last 24 hours.</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-400">Select a transformer on the map to view metrics.</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Barangay Summary</CardTitle>
              <CardDescription>Overall performance metrics</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Total Transformers</p>
                <p className="text-xl font-semibold">{summary?.totalTransformers ?? "--"}</p>
              </div>
              <div>
                <p className="text-gray-500">Critical</p>
                <p className="text-xl font-semibold text-red-500">{summary?.criticalTransformers ?? "--"}</p>
              </div>
              <div>
                <p className="text-gray-500">Warnings</p>
                <p className="text-xl font-semibold text-amber-500">{summary?.warningTransformers ?? "--"}</p>
              </div>
              <div>
                <p className="text-gray-500">Avg Load</p>
                <p className="text-xl font-semibold">{summary ? `${summary.averageLoadPct.toFixed(1)}%` : "--"}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Barangay Analytics</CardTitle>
            <CardDescription>Transformer load versus connected households</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="load" className="w-full">
              <TabsList>
                <TabsTrigger value="load">Transformer Load</TabsTrigger>
                <TabsTrigger value="households">Forecast</TabsTrigger>
              </TabsList>
              <TabsContent value="load" className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={loadData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="load" fill="#f97316" name="Current Load (kW)" />
                    <Bar dataKey="buildings" fill="#93c5fd" name="Downstream Buildings" />
                  </BarChart>
                </ResponsiveContainer>
              </TabsContent>
              <TabsContent value="households" className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={forecastChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="label" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="predictedLoadKw" stroke="#f97316" fill="#f97316" fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

