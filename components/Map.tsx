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
import { LocateIcon } from 'lucide-react';

function SetMapInstance({ onMapReady }: { onMapReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    onMapReady(map);
  }, [map, onMapReady]);
  return null;
}


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

const cities = [
  { key: 'Taipei', coords: [25.0330, 121.5654] },
  { key: 'NewTaipei', coords: [25.0169, 121.4628] },
  { key: 'Taoyuan', coords: [24.9937, 121.3009] },
  { key: 'Hsinchu', coords: [24.8138, 120.9675] },
  { key: 'Taichung', coords: [24.1477, 120.6736] },
  { key: 'Chiayi', coords: [23.4801, 120.4491] },
  { key: 'Tainan', coords: [22.9999, 120.2269] },
  { key: 'Kaohsiung', coords: [22.6273, 120.3014] },
  { key: 'Hualien', coords: [23.9872, 121.6015] },
  { key: 'Taitung', coords: [22.7583, 121.1444] },
];

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
  const { locations, loading, error } = useLocations(selectedCategory);

  const [showPins, setShowPins] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.7, 120.9]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ id: string; name: string; category: string } | null>(null);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);


  useEffect(() => setShowPins(false), [selectedCategory]);
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
      {/* Top Control Bar */}
      <div className="absolute top-0 z-20 w-full px-4 py-3 bg-white/90 backdrop-blur-md shadow-md flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto scroll-smooth scrollbar-hide sm:flex-wrap sm:justify-start">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                selectedCategory === cat
                  ? 'bg-green-600 text-white border-green-700'
                  : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
              }`}
            >
              {getText(`map_category_${cat}`)}
            </button>
          ))}
        </div>

        {/* City Selector */}
        <select
  className="text-sm text-gray-700 border border-gray-300 rounded-full px-3 py-1.5 bg-white shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
  onChange={(e) => {
    const coords = JSON.parse(e.target.value);
    if (mapInstance) {
      mapInstance.flyTo(coords, 13, { duration: 1.2 });
    }
  }}
  defaultValue=""
>
  <option value="" disabled className="text-gray-400">
    {getText('map_jump_city')}
  </option>
  {cities.map((city) => (
    <option key={city.key} value={JSON.stringify(city.coords)}>
      {getText(`city_${city.key}`)}
    </option>
  ))}
</select>
        {/* GPS Toggle */}
        <button
          onClick={() => setGpsEnabled(!gpsEnabled)}
          className={`ml-auto sm:ml-0 px-3 py-1.5 rounded-full border text-sm font-medium flex items-center gap-1 transition ${
            gpsEnabled
              ? 'bg-blue-600 text-white border-blue-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-100'
          }`}
        >
          <LocateIcon size={16} />
          {getText('map_toggle_gps')}
        </button>
      </div>

      {/* Map Display */}
      <MapContainer
  center={mapCenter}
  zoom={8}
  scrollWheelZoom
  className="w-full h-full z-0"
>
  <ForceResize />
  <SetMapInstance onMapReady={(map) => setMapInstance(map)} />
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
                <div className="text-xs text-gray-500 mb-2">{getText(`map_category_${pin.category}`)}</div>
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

      {/* Suggest Modal */}
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
