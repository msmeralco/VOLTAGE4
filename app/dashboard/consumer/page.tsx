"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Zap, TrendingUp, TrendingDown } from "lucide-react";
import type { SmartMeterData } from "@/lib/mock-data";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

export default function ConsumerDashboard() {
  const [smartMeterData, setSmartMeterData] = useState<SmartMeterData | null>(null);
  const [loading, setLoading] = useState(true);
  const consumerId = "consumer-1"; // In real app, this would come from auth

  useEffect(() => {
    fetchSmartMeterData();
  }, []);

  const fetchSmartMeterData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/smartmeter?consumerId=${consumerId}`);
      const result = await response.json();
      if (result.success) {
        setSmartMeterData(result.data);
      }
    } catch (error) {
      console.error("Error fetching smart meter data:", error);
    } finally {
      setLoading(false);
    }
  };

  const averageDaily = smartMeterData
    ? smartMeterData.daily.reduce((sum, d) => sum + d.consumption, 0) / smartMeterData.daily.length
    : 0;

  const averageWeekly = smartMeterData
    ? smartMeterData.weekly.reduce((sum, w) => sum + w.consumption, 0) / smartMeterData.weekly.length
    : 0;

  const averageMonthly = smartMeterData
    ? smartMeterData.monthly.reduce((sum, m) => sum + m.consumption, 0) / smartMeterData.monthly.length
    : 0;

  const comparisonToAverage = smartMeterData
    ? ((smartMeterData.currentConsumption / averageDaily) - 1) * 100
    : 0;

  return (
    <DashboardLayout title="Consumer Dashboard">
      <div className="space-y-6">
        {/* Current Consumption */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Consumption</CardTitle>
              <Zap className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {smartMeterData?.currentConsumption.toFixed(2) || 0} kWh
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Real-time consumption
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <>
                  <div className="text-2xl font-bold">
                    {averageDaily.toFixed(2)} kWh
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last 30 days average
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">vs Average</CardTitle>
              {comparisonToAverage >= 0 ? (
                <TrendingUp className="h-4 w-4 text-red-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-green-500" />
              )}
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : (
                <>
                  <div
                    className={`text-2xl font-bold ${
                      comparisonToAverage >= 0 ? "text-red-500" : "text-green-500"
                    }`}
                  >
                    {comparisonToAverage >= 0 ? "+" : ""}
                    {comparisonToAverage.toFixed(1)}%
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Compared to daily average
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Consumption Trends */}
        <Card>
          <CardHeader>
            <CardTitle>Consumption Trends</CardTitle>
            <CardDescription>
              Track your energy consumption over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[400px] flex items-center justify-center">
                <p className="text-gray-500">Loading data...</p>
              </div>
            ) : (
              <Tabs defaultValue="daily" className="w-full">
                <TabsList>
                  <TabsTrigger value="daily">Daily</TabsTrigger>
                  <TabsTrigger value="weekly">Weekly</TabsTrigger>
                  <TabsTrigger value="monthly">Monthly</TabsTrigger>
                </TabsList>
                <TabsContent value="daily" className="mt-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={smartMeterData?.daily || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="consumption"
                        stroke="#f97316"
                        strokeWidth={2}
                        name="Consumption (kWh)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="weekly" className="mt-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={smartMeterData?.weekly || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="week" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="consumption" fill="#f97316" name="Consumption (kWh)" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                <TabsContent value="monthly" className="mt-4">
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={smartMeterData?.monthly || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="consumption" fill="#f97316" name="Consumption (kWh)" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        {/* Usage Statistics */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageWeekly.toFixed(2)} kWh</div>
              <p className="text-sm text-muted-foreground mt-2">
                Average consumption per week
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Monthly Average</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{averageMonthly.toFixed(2)} kWh</div>
              <p className="text-sm text-muted-foreground mt-2">
                Average consumption per month
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

