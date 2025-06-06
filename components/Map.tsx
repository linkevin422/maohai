'use client';

import { useEffect, useState, useRef } from 'react';
import SafeMapContainer from '@/components/SafeMapContainer';
import {
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Category, useLocations } from '@/lib/useLocations';
import { useText } from '@/lib/getText';
import { LocateIcon } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';

const taiwanBounds: L.LatLngBoundsExpression = [
  [20.5, 117.5], // southwest — push west & south to include Kinmen/Matsu
  [27.0, 123.5], // northeast — slightly expanded
];

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
  restaurant_roam: L.icon({
    iconUrl: '/pins/pin_res.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
  restaurant_bagged: L.icon({
    iconUrl: '/pins/pin_resbagged.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
  vet: L.icon({
    iconUrl: '/pins/pin_hospital.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
  hotel: L.icon({
    iconUrl: '/pins/pin_pethotel.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
  human_hotel: L.icon({
    iconUrl: '/pins/pin_humanhotel.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
  park: L.icon({
    iconUrl: '/pins/pin_park.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
  shop: L.icon({
    iconUrl: '/pins/pin_shop.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
  groomer: L.icon({
    iconUrl: '/pins/pin_groomer.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
  reg: L.icon({
    iconUrl: '/pins/pin_reg.png',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  }),
};

const cities = [
  { key: 'Taipei', coords: [25.033, 121.5654] },
  { key: 'NewTaipei', coords: [25.0169, 121.4628] },
  { key: 'Taoyuan', coords: [24.9937, 121.3009] },
  { key: 'Hsinchu', coords: [24.8138, 120.9675] },
  { key: 'Miaoli', coords: [24.5602, 120.8204] },
  { key: 'Taichung', coords: [24.1477, 120.6736] },
  { key: 'Changhua', coords: [24.072, 120.543] },
  { key: 'Nantou', coords: [23.913, 120.685] },
  { key: 'Yunlin', coords: [23.707, 120.431] },
  { key: 'Chiayi', coords: [23.4801, 120.4491] },
  { key: 'Tainan', coords: [22.9999, 120.2269] },
  { key: 'Kaohsiung', coords: [22.6273, 120.3014] },
  { key: 'Pingtung', coords: [22.551, 120.548] },
  { key: 'Yilan', coords: [24.7021, 121.7378] },
  { key: 'Hualien', coords: [23.9872, 121.6015] },
  { key: 'Taitung', coords: [22.7583, 121.1444] },
  { key: 'Keelung', coords: [25.1283, 121.7419] },
  { key: 'Penghu', coords: [23.5715, 119.5797] },
  { key: 'Kinmen', coords: [24.4321, 118.3171] },
  { key: 'Matsu', coords: [26.1608, 119.9519] },
];

const categories: Category[] = [
  'restaurant',
  'vet',
  'hotel',
  'human_hotel',
  'park',
  'shop',
  'groomer',
  'reg',
];

function ForceResize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 0);
  }, [map]);
  return null;
}

function GPSMarker({
  gpsEnabled,
  setMapCenter,
}: {
  gpsEnabled: boolean;
  setMapCenter: (coords: [number, number]) => void;
}) {
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
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(coords);
        setMapCenter(coords);
        map.flyTo(coords, 16, { animate: true, duration: 1.5 });
        setTimeout(() => setVisible(true), 500);
      },
      () => {}
    );
  }, [gpsEnabled, map, setMapCenter]);

  if (!position || !visible) return null;

  return (
    <Marker
      position={position}
      icon={L.icon({
        iconUrl: '/pins/pin_here.png',
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      })}
    />
  );
}

export default function Map({
  selectedCategory,
  setSelectedCategory,
}: {
  selectedCategory: Category;
  setSelectedCategory: (cat: Category) => void;
}) {
  const { getText } = useText();
  const { locations, loading, error } = useLocations(selectedCategory);

  const router = useRouter();
  const supabaseClient = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);

  const [showPins, setShowPins] = useState(false);
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([23.7, 120.9]);
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
    });
  }, []);

  useEffect(() => setShowPins(false), [selectedCategory]);
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setShowPins(true), 50);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <div className="relative w-full h-full">
      <div className="absolute top-0 z-20 w-full px-4 py-3 bg-white/90 backdrop-blur-md shadow-md flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide sm:flex-wrap sm:justify-start">
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

        <select
          className="text-sm text-gray-700 border border-gray-300 rounded-full px-3 py-1.5 bg-white shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          onChange={(e) => {
            const coords = JSON.parse(e.target.value);
            mapInstance?.flyTo(coords, 13, { duration: 1.2 });
          }}
          defaultValue=""
        >
          <option value="" disabled className="text-gray-400">
            {getText('map_jump_city')}
          </option>
          {cities.map((c) => (
            <option key={c.key} value={JSON.stringify(c.coords)}>
              {getText(`city_${c.key}`)}
            </option>
          ))}
        </select>

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

      <SafeMapContainer
  center={mapCenter}
  zoom={8}
  scrollWheelZoom={true}
  dragging={true}
  className="w-full h-full z-0"
  maxBounds={taiwanBounds}
  maxBoundsViscosity={0.3} // make bounds looser
  minZoom={6}              // allow zooming out more
  maxZoom={19}             // allow zooming in more
>
        <ForceResize />
        <SetMapInstance onMapReady={setMapInstance} />

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
                  : pin.category === 'vet' && pin.data?.open24hr
                    ? L.icon({
                        iconUrl: '/pins/pin_24vet.png',
                        iconSize: [36, 36],
                        iconAnchor: [18, 36],
                        popupAnchor: [0, -36],
                      })
                    : customIcons[pin.category as keyof typeof customIcons]
              }
                          >
<Popup autoPan={true} autoPanPadding={[20, 100]}>
  <div className="min-w-[220px] max-w-[300px] space-y-2 text-[13px] text-gray-800">
    <div className="font-semibold text-[15px] leading-tight">
      {pin.google_maps_url ? (
        <a
          href={pin.google_maps_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline hover:opacity-80"
          onClick={() => {
            supabase
              .from('locations')
              .update({ click_count: (pin.click_count || 0) + 1 })
              .eq('id', pin.id);
          }}
        >
          {pin.name}
        </a>
      ) : (
        <span>{pin.name}</span>
      )}
    </div>

    {pin.address && (
      <div className="text-gray-600 text-[13px]">{pin.address}</div>
    )}

    <div className="text-gray-500 text-xs italic">
      {getText(`map_category_${pin.category}`)}
    </div>

    <ul className="space-y-1 mt-2">
      {Object.entries(pin.data || {}).map(([k, v]) => {
        const val = v as string | number | boolean;
        const isPetSizeKey = k === 'maxPetSize' && typeof val === 'string';
        const translated = isPetSizeKey ? getText(`map_size_${val}`) : val;

        return (
          <li
            key={k}
            className="flex justify-between items-center border-b border-gray-100 pb-1"
          >
            <span className="text-gray-500">{getText(`map_key_${k}`)}</span>
            <span className="font-medium">
              {typeof val === 'boolean' ? (
                <span
                  className={`inline-block w-2 h-2 rounded-full ${
                    val ? 'bg-green-500' : 'bg-red-400'
                  }`}
                />
              ) : (
                translated
              )}
            </span>
          </li>
        );
      })}
    </ul>

    {pin.category !== 'reg' && (
      <div className="pt-2">
        <button
          onClick={() => {
            if (user) {
              const params = new URLSearchParams({
                id: pin.id,
                name: pin.name,
                category: pin.category,
              }).toString();
              router.push(`/mapsubmit?${params}`);
            } else {
              supabaseClient.auth.getUser().then(({ data }) => {
                if (data.user) {
                  const params = new URLSearchParams({
                    id: pin.id,
                    name: pin.name,
                    category: pin.category,
                  }).toString();
                  router.push(`/mapsubmit?${params}`);
                } else {
                  router.push('/register');
                }
              });
            }
          }}
          className="text-blue-600 underline text-xs hover:opacity-80"
        >
          {getText('map_popup_suggest_edit')}
        </button>
      </div>
    )}
  </div>
</Popup>
            </Marker>
          ))}
      </SafeMapContainer>
    </div>
  );
}
