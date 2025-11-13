"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { TransformerWithLoad, Household } from "@/lib/csv-data";
import { useEffect, useRef } from "react";

// Fix for default marker icons in Next.js
const iconRetinaUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const shadowUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

interface CSVMapViewProps {
  transformers: TransformerWithLoad[];
  households: Household[];
  selectedTransformer?: TransformerWithLoad | null;
  onTransformerSelect?: (transformer: TransformerWithLoad) => void;
}

function MapController({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14);
  }, [map, center]);
  return null;
}

export function CSVMapViewComponent({
  transformers,
  households,
  selectedTransformer,
  onTransformerSelect,
}: CSVMapViewProps) {
  const mapRef = useRef<L.Map | null>(null);

  // Calculate center point
  const center: [number, number] =
    transformers.length > 0
      ? [
          transformers.reduce((sum, t) => sum + t.Latitude, 0) / transformers.length,
          transformers.reduce((sum, t) => sum + t.Longitude, 0) / transformers.length,
        ]
      : [14.6760, 121.0437]; // Default to Quezon City

  // Convert meters to degrees (approximate: 1 degree ≈ 111,000 meters)
  const metersToDegrees = (meters: number) => meters / 111000;

  // Get color based on load (normalize to 0-100 for visualization)
  const getLoadColor = (load: number) => {
    // Assuming max load of 100kW for visualization
    const maxLoad = 100;
    const loadPercentage = Math.min((load / maxLoad) * 100, 100);
    
    if (loadPercentage > 80) return "red";
    if (loadPercentage > 60) return "orange";
    if (loadPercentage > 40) return "yellow";
    return "green";
  };

  // Get circle radius based on load (10m base, scaled by load)
  const getCircleRadius = (load: number) => {
    const baseRadius = 10; // 10 meters
    const maxLoad = 100;
    const loadFactor = Math.min(load / maxLoad, 1);
    return baseRadius + (loadFactor * 5); // 10-15 meters
  };

  // Create transformer icon
  const getTransformerIcon = (transformer: TransformerWithLoad) => {
    const isSubstation = transformer.EntityType === "SubstationTransformer";
    const color = getLoadColor(transformer.totalLoad);
    const size = isSubstation ? 40 : 30;

    return L.divIcon({
      className: "custom-transformer-icon",
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${isSubstation ? "#4A5568" : color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${isSubstation ? "14px" : "12px"};
        box-shadow: 0 2px 6px rgba(0,0,0,0.4);
      ">${isSubstation ? "SUB" : transformer.totalLoad.toFixed(1)}</div>`,
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });
  };

  return (
    <div className="w-full h-[600px] rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <MapContainer
        center={center}
        zoom={14}
        style={{ height: "100%", width: "100%" }}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapController center={center} />
        
        {/* Draw circles and lines for each transformer */}
        {transformers.map((transformer) => {
          const transformerHouseholds = households.filter(
            (h) => h.transformerId === transformer.ID
          );
          const circleRadius = metersToDegrees(getCircleRadius(transformer.totalLoad));
          const circleColor = getLoadColor(transformer.totalLoad);

          return (
            <div key={transformer.ID}>
              {/* 10m radius circle around transformer */}
              <Circle
                center={[transformer.Latitude, transformer.Longitude]}
                radius={circleRadius * 111000} // Convert back to meters for Leaflet
                pathOptions={{
                  color: circleColor,
                  fillColor: circleColor,
                  fillOpacity: 0.2,
                  weight: 2,
                }}
              />

              {/* Lines connecting transformer to households */}
              {transformerHouseholds.map((household) => (
                <Polyline
                  key={`line-${transformer.ID}-${household.id}`}
                  positions={[
                    [transformer.Latitude, transformer.Longitude],
                    [household.latitude, household.longitude],
                  ]}
                  pathOptions={{
                    color: "#6B7280",
                    weight: 1,
                    opacity: 0.5,
                    dashArray: "5, 5",
                  }}
                />
              ))}

              {/* Transformer marker */}
              <Marker
                position={[transformer.Latitude, transformer.Longitude]}
                icon={getTransformerIcon(transformer)}
                eventHandlers={{
                  click: () => {
                    onTransformerSelect?.(transformer);
                  },
                }}
              >
                <Popup>
                  <div className="p-2 min-w-[200px]">
                    <h3 className="font-semibold text-sm mb-2">{transformer.ID}</h3>
                    <div className="space-y-1 text-xs">
                      <p>
                        <span className="font-medium">Type:</span> {transformer.EntityType}
                      </p>
                      <p>
                        <span className="font-medium">Total Load:</span>{" "}
                        {transformer.totalLoad.toFixed(2)} kW
                      </p>
                      <p>
                        <span className="font-medium">Buildings:</span>{" "}
                        {transformer.NumDownstreamBuildings}
                      </p>
                      {transformer.ParentID && (
                        <p>
                          <span className="font-medium">Parent:</span> {transformer.ParentID}
                        </p>
                      )}
                      <p className="text-gray-500 mt-2">
                        Lat: {transformer.Latitude.toFixed(6)}, Lng:{" "}
                        {transformer.Longitude.toFixed(6)}
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>

              {/* Household markers */}
              {transformerHouseholds.map((household) => (
                <Marker
                  key={household.id}
                  position={[household.latitude, household.longitude]}
                  icon={L.icon({
                    iconUrl: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIiIGhlaWdodD0iMTIiIHZpZXdCb3g9IjAgMCAxMiAxMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iNiIgY3k9IjYiIHI9IjMiIGZpbGw9IiM2QjcyODAiLz4KPC9zdmc+",
                    iconSize: [12, 12],
                    iconAnchor: [6, 6],
                  })}
                >
                  <Popup>
                    <div className="p-2">
                      <p className="text-xs font-medium">{household.id}</p>
                      <p className="text-xs text-gray-600">
                        Load: {household.load.toFixed(2)} kW
                      </p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </div>
          );
        })}
      </MapContainer>
    </div>
  );
}

