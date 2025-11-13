"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MapView } from "@/components/map-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Zap, Cloud } from "lucide-react";
import type { Transformer, Household, WeatherData } from "@/lib/mock-data";
import { calculateGridHealth, generatePredictiveInsights, barangaysByCity } from "@/lib/mock-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function BarangayDashboard() {
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [selectedTransformer, setSelectedTransformer] = useState<Transformer | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mock barangay data - in real app, this would come from auth
  const barangay = "Barangay 1";
  const city = "Manila";

  useEffect(() => {
    fetchBarangayData();
    fetchWeather();
  }, []);

  const fetchBarangayData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/transformers?city=${city}&barangay=${barangay}`);
      const result = await response.json();
      if (result.success) {
        setTransformers(result.data);
        // Generate households for these transformers
        const allHouseholds: Household[] = [];
        result.data.forEach((transformer: Transformer) => {
          for (let i = 0; i < transformer.households.length; i++) {
            allHouseholds.push({
              id: transformer.households[i],
              transformerId: transformer.id,
              latitude: transformer.latitude + (Math.random() - 0.5) * 0.01,
              longitude: transformer.longitude + (Math.random() - 0.5) * 0.01,
            });
          }
        });
        setHouseholds(allHouseholds);
      }
    } catch (error) {
      console.error("Error fetching barangay data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const response = await fetch(`/api/weather?city=${city}`);
      const result = await response.json();
      if (result.success) {
        setWeather(result.data);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    }
  };

  const gridHealth = selectedTransformer && weather
    ? calculateGridHealth(
        selectedTransformer.currentLoad,
        selectedTransformer.capacity,
        weather.temperature,
        weather.humidity,
        weather.pressure
      )
    : null;

  const insights = selectedTransformer && weather
    ? generatePredictiveInsights(selectedTransformer, weather)
    : [];

  const loadData = transformers.map((t) => ({
    name: t.name,
    load: t.currentLoad,
    capacity: t.capacity,
    percentage: (t.currentLoad / t.capacity) * 100,
  }));

  return (
    <DashboardLayout title="Barangay Dashboard">
      <div className="space-y-6">
        {/* Barangay Info */}
        <Card>
          <CardHeader>
            <CardTitle>{barangay} - {city}</CardTitle>
            <CardDescription>Grid health and transformer monitoring for your barangay</CardDescription>
          </CardHeader>
        </Card>

        {/* Map View */}
        <Card>
          <CardHeader>
            <CardTitle>Barangay Grid Map</CardTitle>
            <CardDescription>
              Interactive map showing transformers and households in {barangay}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-[600px] flex items-center justify-center">
                <p className="text-gray-500">Loading map data...</p>
              </div>
            ) : (
              <MapView
                transformers={transformers}
                households={households}
                selectedTransformer={selectedTransformer}
                onTransformerSelect={setSelectedTransformer}
              />
            )}
          </CardContent>
        </Card>

        {/* Transformer Details and Insights */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Selected Transformer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transformer Details</CardTitle>
              <CardDescription>
                {selectedTransformer
                  ? `Information for ${selectedTransformer.name}`
                  : "Select a transformer on the map to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTransformer ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Current Load</p>
                    <p className="text-2xl font-bold">
                      {selectedTransformer.currentLoad.toFixed(1)} kW
                    </p>
                    <p className="text-sm text-gray-500">
                      Capacity: {selectedTransformer.capacity} kW
                    </p>
                    <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-orange-500 h-2.5 rounded-full"
                        style={{
                          width: `${(selectedTransformer.currentLoad / selectedTransformer.capacity) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {weather && (
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Weather Parameters</p>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <Cloud className="h-4 w-4 inline mr-1" />
                          <span className="text-gray-500">Temperature: </span>
                          <span className="font-semibold">{weather.temperature.toFixed(1)}°C</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Humidity: </span>
                          <span className="font-semibold">{weather.humidity.toFixed(1)}%</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Condition: </span>
                          <span className="font-semibold">{weather.condition}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {gridHealth !== null && (
                    <div>
                      <p className="text-sm text-gray-500">Grid Health</p>
                      <p className="text-2xl font-bold">
                        {gridHealth.toFixed(1)}%
                      </p>
                      <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${
                            gridHealth > 70
                              ? "bg-green-500"
                              : gridHealth > 40
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${gridHealth}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Click on a transformer marker to view details
                </p>
              )}
            </CardContent>
          </Card>

          {/* Predictive Insights */}
          <Card>
            <CardHeader>
              <CardTitle>Predictive Insights</CardTitle>
              <CardDescription>AI-powered predictions for your barangay</CardDescription>
            </CardHeader>
            <CardContent>
              {insights.length > 0 ? (
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800"
                    >
                      <AlertTriangle className="h-5 w-5 text-orange-500 mt-0.5" />
                      <p className="text-sm text-gray-700 dark:text-gray-300">{insight}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Select a transformer to see predictive insights
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Analytics */}
        <Card>
          <CardHeader>
            <CardTitle>Barangay Analytics</CardTitle>
            <CardDescription>Transformer load distribution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={loadData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="load" fill="#f97316" name="Current Load (kW)" />
                <Bar dataKey="capacity" fill="#e5e7eb" name="Capacity (kW)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

