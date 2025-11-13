"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { CSVMapView } from "@/components/csv-map-view";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, Zap, Cloud } from "lucide-react";
import type { TransformerWithLoad, Household as CSVHousehold } from "@/lib/csv-data";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

export default function BarangayDashboard() {
  const [transformers, setTransformers] = useState<TransformerWithLoad[]>([]);
  const [households, setHouseholds] = useState<CSVHousehold[]>([]);
  const [selectedTransformer, setSelectedTransformer] = useState<TransformerWithLoad | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Barangay data - UP Diliman
  const barangay = "UP Diliman";
  const city = "UP Diliman";

  useEffect(() => {
    fetchBarangayData();
  }, []);

  const fetchBarangayData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/csv-transformers?city=${city}`);
      const result = await response.json();
      if (result.success) {
        setTransformers(result.data.transformers);
        setHouseholds(result.data.households);
      }
    } catch (error) {
      console.error("Error fetching barangay data:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadData = transformers
    .filter((t) => t.EntityType === "PolePadTransformer")
    .map((t) => ({
      name: t.ID,
      load: t.totalLoad,
      buildings: t.NumDownstreamBuildings,
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
              <CSVMapView
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
                  ? `Information for ${selectedTransformer.ID}`
                  : "Select a transformer on the map to view details"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTransformer ? (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Transformer ID</p>
                    <p className="text-xl font-bold">{selectedTransformer.ID}</p>
                    <p className="text-sm text-gray-500 mt-2">Type</p>
                    <p className="text-lg font-semibold">{selectedTransformer.EntityType}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Total Load</p>
                    <p className="text-2xl font-bold">
                      {selectedTransformer.totalLoad.toFixed(2)} kW
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Downstream Buildings</p>
                    <p className="text-xl font-bold">
                      {selectedTransformer.NumDownstreamBuildings}
                    </p>
                    {selectedTransformer.ParentID && (
                      <p className="text-sm text-gray-500 mt-2">
                        Parent: {selectedTransformer.ParentID}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  Click on a transformer marker to view details
                </p>
              )}
            </CardContent>
          </Card>

          {/* Transformer Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Barangay Summary</CardTitle>
              <CardDescription>Overview of {barangay} grid</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Total Transformers: {transformers.length}
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                    {transformers.filter((t) => t.EntityType === "SubstationTransformer").length} Substations
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    {transformers.filter((t) => t.EntityType === "PolePadTransformer").length} Pole Pad Transformers
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <p className="text-sm font-semibold text-green-700 dark:text-green-300">
                    Total Load: {transformers.reduce((sum, t) => sum + t.totalLoad, 0).toFixed(2)} kW
                  </p>
                </div>
              </div>
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
                    <Bar dataKey="load" fill="#f97316" name="Total Load (kW)" />
                    <Bar dataKey="buildings" fill="#93c5fd" name="Buildings" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}

