'use client';

import { useState } from 'react';
import { useText } from '@/lib/getText';
import { Category } from '@/lib/useLocations';
import { X } from 'lucide-react';

type Props = {
    open: boolean;
    onClose: () => void;
    lat: number;
    lng: number;
    onSuccess: () => void; // ✅ THIS MUST BE HERE
  };
  
const categories: Category[] = [
  'restaurant',
  'vet',
  'hotel',
  'human_hotel',
  'park',
  'shop',
  'groomer',
];

const categoryFields: Record<Category, string[]> = {
  restaurant: ['petRoam', 'petBagOnly', 'indoorAllowed', 'outdoorSeating', 'petMenu', 'waterBowlProvided'],
  vet: ['open24hr', 'emergencyAvailable', 'exoticsOk', 'walkInOk', 'onlineBooking', 'hasParking', 'inHouseLab'],
  hotel: ['allowLargeDogs', 'petAmenities', 'petRoomService', 'separatePetRooms', 'canBeLeftAlone', 'petFeePerNight', 'maxPetsPerRoom', 'maxPetSize'],
  human_hotel: ['allowPets', 'hasDesignatedFloors', 'petFeePerNight', 'maxPetsPerRoom', 'maxPetSize'],
  park: ['offLeashArea', 'fenced', 'waterAvailable', 'shade', 'petPoopStations', 'smallDogZone', 'largeDogZone', 'catSafe'],
  shop: ['allowEntry', 'leashRequired', 'catFriendly', 'dogFriendly', 'noiseTolerant'],
  groomer: ['offersGrooming', 'hasPetCafe', 'hasVetInside', 'petEvents'],
};

export default function LocationSubmissionModal({ open, onClose, lat, lng, onSuccess }: Props) {
    const { getText } = useText();

  const [form, setForm] = useState({
    name: '',
    address: '',
    google_maps_url: '',
    category: 'restaurant' as Category,
    data: {} as Record<string, any>,
  });

  const handleToggle = (key: string) => {
    setForm((prev) => ({
      ...prev,
      data: { ...prev.data, [key]: !prev.data[key] },
    }));
  };

  const handleChange = (key: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      data: { ...prev.data, [key]: value },
    }));
  };

  const handleSubmit = async () => {
    const payload = {
      name: form.name,
      address: form.address || null,
      google_maps_url: form.google_maps_url || null,
      lat,
      lng,
      category: form.category,
      data: form.data,
    };
  
    const res = await fetch('/api/submit-location', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  
    if (res.ok) {
      onSuccess(); // ✅ this is what fixes the TypeScript error in Map.tsx
    } else {
      alert('Failed to submit');
    }
  };
  
  if (!open) return null;

  const fields = categoryFields[form.category];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="relative bg-white text-black w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-lg p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-black hover:text-gray-500"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold mb-6">{getText('map_popup_submission')}</h2>

        <div className="space-y-4">
          <input
            placeholder={getText('input_name')}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            placeholder={getText('input_address_optional')}
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <input
            placeholder={getText('input_google_maps_url')}
            value={form.google_maps_url}
            onChange={(e) => setForm({ ...form, google_maps_url: e.target.value })}
            className="w-full p-3 border border-gray-300 rounded-md"
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as Category })}
            className="w-full p-3 border border-gray-300 rounded-md"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getText(`map_category_${cat}`)}
              </option>
            ))}
          </select>
        </div>

        {fields.length > 0 && (
          <div className="mt-6 space-y-3">
            <h3 className="font-semibold text-sm text-gray-700">{getText('map_popup_features')}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {fields.map((key) => (
                <label key={key} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form.data[key] || false}
                    onChange={() => handleToggle(key)}
                    className="accent-green-600"
                  />
                  {getText(`map_key_${key}`)}
                </label>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4 mt-8">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300 text-sm"
          >
            {getText('button_cancel')}
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm"
          >
            {getText('button_submit')}
          </button>
        </div>
      </div>
    </div>
  );
}
