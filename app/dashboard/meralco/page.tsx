"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { MapView } from "@/components/map-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, TrendingUp, Zap, Cloud } from "lucide-react";
import type { Transformer, Household, WeatherData } from "@/lib/mock-data";
import { cities } from "@/lib/mock-data";
import { calculateGridHealth, generatePredictiveInsights } from "@/lib/mock-data";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function MeralcoDashboard() {
  const [selectedCity, setSelectedCity] = useState<string>("Manila");
  const [transformers, setTransformers] = useState<Transformer[]>([]);
  const [households, setHouseholds] = useState<Household[]>([]);
  const [selectedTransformer, setSelectedTransformer] = useState<Transformer | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGridData();
    fetchWeather();
  }, [selectedCity]);

  const fetchGridData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/grid?city=${selectedCity}`);
      const result = await response.json();
      if (result.success) {
        setTransformers(result.data.transformers);
        setHouseholds(result.data.households);
      }
    } catch (error) {
      console.error("Error fetching grid data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchWeather = async () => {
    try {
      const response = await fetch(`/api/weather?city=${selectedCity}`);
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

  // Prepare chart data
  const loadData = transformers.map((t) => ({
    name: t.name.split(" - ")[1] || t.name,
    load: t.currentLoad,
    capacity: t.capacity,
    percentage: (t.currentLoad / t.capacity) * 100,
  }));

  const timeSeriesData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    load: Math.random() * 100 + 200,
  }));

  return (
    <DashboardLayout title="Meralco Dashboard">
      <div className="space-y-6">
        {/* City Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Select City</CardTitle>
            <CardDescription>Choose a city to view grid data</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedCity} onValueChange={setSelectedCity}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Map View */}
        <Card>
          <CardHeader>
            <CardTitle>Grid Map</CardTitle>
            <CardDescription>
              Interactive map showing transformers and households in {selectedCity}
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

        {/* Transformer Details and Analytics */}
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
                          <span className="text-gray-500">Pressure: </span>
                          <span className="font-semibold">{weather.pressure.toFixed(1)} hPa</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Wind: </span>
                          <span className="font-semibold">{weather.windSpeed.toFixed(1)} m/s</span>
                        </div>
                        <div className="col-span-2">
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
              <CardDescription>AI-powered predictions and recommendations</CardDescription>
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

        {/* Analytics Charts */}
        <Card>
          <CardHeader>
            <CardTitle>Analytics</CardTitle>
            <CardDescription>Grid load and consumption trends</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="load" className="w-full">
              <TabsList>
                <TabsTrigger value="load">Transformer Load</TabsTrigger>
                <TabsTrigger value="trends">24-Hour Trends</TabsTrigger>
              </TabsList>
              <TabsContent value="load" className="mt-4">
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
              </TabsContent>
              <TabsContent value="trends" className="mt-4">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={timeSeriesData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="load"
                      stroke="#f97316"
                      strokeWidth={2}
                      name="Load (kW)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

