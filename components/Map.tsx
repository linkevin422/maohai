'use client';

import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Category, useLocations } from '@/lib/useLocations';
import { useText } from '@/lib/getText';
import SuggestionModal from '@/components/SuggestionModal';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const customIcons = {
  restaurant_roam: L.icon({ iconUrl: '/pins/pin_res.png', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] }),
  restaurant_bagged: L.icon({ iconUrl: '/pins/pin_resbagged.png', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] }),
  vet: L.icon({ iconUrl: '/pins/pin_hospital.png', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] }),
  hotel: L.icon({ iconUrl: '/pins/pin_pethotel.png', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] }),
  human_hotel: L.icon({ iconUrl: '/pins/pin_humanhotel.png', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] }),
  park: L.icon({ iconUrl: '/pins/pin_park.png', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] }),
  shop: L.icon({ iconUrl: '/pins/pin_shop.png', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] }),
  groomer: L.icon({ iconUrl: '/pins/pin_groomer.png', iconSize: [36, 36], iconAnchor: [18, 36], popupAnchor: [0, -36] }),
};

const categories: Category[] = ['restaurant', 'vet', 'hotel', 'human_hotel', 'park', 'shop', 'groomer'];

function ForceResize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
  }, [map]);
  return null;
}

function GPSMarker({ gpsEnabled, setMapCenter }: { gpsEnabled: boolean; setMapCenter: (coords: [number, number]) => void }) {
  const map = useMap();
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!gpsEnabled) {
      setVisible(false);
      setPosition(null);
      return;
    }
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setPosition(coords);
        setMapCenter(coords);
        map.flyTo(coords, 16, { animate: true, duration: 1.5 });
        setTimeout(() => setVisible(true), 500);
      },
      (err) => {
        console.error('GPS error:', err);
      }
    );
  }, [gpsEnabled, map, setMapCenter]);

  if (!position || !visible) return null;

  return (
    <Marker
      position={position}
      icon={L.icon({ iconUrl: '/pins/pin_here.png', iconSize: [32, 32], iconAnchor: [16, 32], popupAnchor: [0, -32] })}
    />
  );
}

export default function Map({ selectedCategory, setSelectedCategory }: { selectedCategory: Category; setSelectedCategory: (cat: Category) => void }) {
  const { getText } = useText();
  const { locations, loading, error, refetch } = useLocations(selectedCategory);

  const [showPins, setShowPins] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([25.034, 121.564]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ id: string; name: string; category: string } | null>(null);

  useEffect(() => {
    setShowPins(false);
  }, [selectedCategory]);

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setShowPins(true), 50);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  const openModalWithLocation = (pin: { id: string; name: string; category: string }) => {
    setSelectedLocation(pin);
    setModalOpen(true);
  };

  return (
    <div className="relative w-full h-full">
      <div className="absolute z-10 top-3 left-1/2 -translate-x-1/2 w-full max-w-[95%] px-2 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap justify-center sm:justify-start gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white border-green-700'
                  : 'bg-white text-gray-800 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {getText(`map_category_${cat}`)}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-2">
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={gpsEnabled} onChange={() => setGpsEnabled(!gpsEnabled)} />
            <div className="w-11 h-6 bg-gray-400 peer-checked:bg-blue-500 rounded-full transition-colors duration-300" />
            <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 peer-checked:translate-x-5" />
          </label>
          <span className="text-sm text-black">{getText('map_toggle_gps')}</span>
        </div>
      </div>

      <MapContainer center={mapCenter} zoom={15} scrollWheelZoom className="w-full h-full z-0">
        <ForceResize />
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          attribution="© OpenStreetMap contributors © CARTO"
        />
        <GPSMarker gpsEnabled={gpsEnabled} setMapCenter={setMapCenter} />

        {loading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div className="bg-black/60 text-white px-6 py-3 rounded-xl text-sm font-medium backdrop-blur-md animate-pulse">
              {getText('map_loading')}
            </div>
          </div>
        )}

        {error && <Popup position={mapCenter}>{getText('map_error_loading')}</Popup>}

        {showPins &&
          locations.map((pin) => (
            <Marker
              key={pin.id}
              position={[pin.lat, pin.lng]}
              icon={
                pin.category === 'restaurant'
                  ? pin.data?.petBagged
                    ? customIcons.restaurant_bagged
                    : customIcons.restaurant_roam
                  : customIcons[pin.category as keyof typeof customIcons]
              }
            >
              <Popup>
                <div className="font-semibold text-base mb-1">
                  {pin.google_maps_url ? (
                    <a href={pin.google_maps_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:opacity-80">
                      {pin.name}
                    </a>
                  ) : (
                    <span>{pin.name}</span>
                  )}
                </div>
                {pin.address && <div className="text-sm text-gray-700 mb-1">📍 {pin.address}</div>}
                <div className="text-xs text-gray-500 mb-2">🍽️ {getText(`map_category_${pin.category}`)}</div>
                <ul className="text-sm text-gray-800 space-y-1">
                  {Object.entries(pin.data || {}).map(([key, value]) => {
                    const val = value as string | number | boolean;
                    const isPetSizeKey = key === 'maxPetSize' && typeof val === 'string';
                    const translatedValue = isPetSizeKey ? getText(`map_size_${val}`) : val;

                    return (
                      <li key={key}>
                        {typeof val === 'boolean'
                          ? `${val ? '✅' : '❌'} ${getText(`map_key_${key}`)}`
                          : `🔹 ${getText(`map_key_${key}`)}: ${translatedValue}`}
                      </li>
                    );
                  })}
                </ul>
                <button
                  onClick={() => openModalWithLocation({ id: pin.id, name: pin.name, category: pin.category })}
                  className="mt-2 inline-block text-blue-600 underline text-sm hover:opacity-80"
                >
                  {getText('map_popup_suggest_edit')}
                </button>
              </Popup>
            </Marker>
          ))}
      </MapContainer>

      {modalOpen && selectedLocation && (
        <SuggestionModal
          open={modalOpen}
          locationId={selectedLocation.id}
          locationName={selectedLocation.name}
          locationCategory={selectedLocation.category}
          onClose={() => {
            setModalOpen(false);
            setSelectedLocation(null);
          }}
        />
      )}
    </div>
  );
}
