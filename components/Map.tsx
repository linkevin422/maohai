"use client";

import { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Category, useLocations } from "@/lib/useLocations";
import { useText } from "@/lib/getText";

// Fix Leaflet icon bug with Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

type Props = {
  selectedCategory: Category;
};

// Fix rendering bug by forcing map to recalculate size
function ForceResize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 0);
  }, [map]);
  return null;
}

export default function Map({ selectedCategory }: Props) {
  const { getText } = useText();
  const { locations, loading, error } = useLocations(selectedCategory);

  function formatKey(key: string) {
    return getText(`map_key_${key}`);
  }

  return (
    <div className="w-full h-[500px] min-h-[300px] rounded-lg overflow-hidden shadow-lg">
      <MapContainer
        center={[25.034, 121.564]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <ForceResize />
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {loading && (
          <Popup position={[25.034, 121.564]}>
            {getText("map_loading")}
          </Popup>
        )}
        {error && (
          <Popup position={[25.034, 121.564]}>
            {getText("map_error_loading")}
          </Popup>
        )}
        {locations.map((pin) => (
          <Marker key={pin.id} position={[pin.lat, pin.lng]}>
            <Popup>
              <div className="font-semibold text-base mb-1">{pin.name}</div>
              {pin.address && (
                <div className="text-sm text-gray-700 mb-1">📍 {pin.address}</div>
              )}
              <div className="text-xs text-gray-500 mb-2">🍽️ {pin.category}</div>

              <ul className="text-sm text-gray-800 space-y-1">
                {Object.entries(pin.data || {}).map(([key, value]) => {
                  const val = value as string | number | boolean;

                  if (typeof val === "boolean") {
                    return (
                      <li key={key}>
                        {val ? "✅" : "❌"} {formatKey(key)}
                      </li>
                    );
                  }

                  return (
                    <li key={key}>
                      🔹 {formatKey(key)}: {val}
                    </li>
                  );
                })}
              </ul>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
