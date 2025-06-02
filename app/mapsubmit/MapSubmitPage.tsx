'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { useLanguage } from '@/lib/LanguageProvider';
import { useText } from '@/lib/getText';
import { Category } from '@/lib/useLocations';
import { admins } from '@/lib/admins';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import EditHistoryModal from '@/components/EditHistoryModal';

const categories: Category[] = ['restaurant', 'vet', 'hotel', 'human_hotel', 'park', 'shop', 'groomer'];

const categoryFields: Record<Category, string[]> = {
  restaurant: ['petRoam', 'petBagOnly', 'indoorAllowed', 'outdoorSeating', 'petMenu', 'waterBowlProvided'],
  vet: ['open24hr', 'emergencyAvailable', 'exoticsOk', 'walkInOk', 'onlineBooking', 'hasParking', 'inHouseLab'],
  hotel: ['allowLargeDogs', 'petAmenities', 'petRoomService', 'separatePetRooms', 'canBeLeftAlone'],
  human_hotel: ['petAllowed', 'limitByWeight', 'additionalFee', 'canBeLeftAlone', 'waterBowlProvided'],
  park: ['offLeashOk', 'fencedArea', 'waterBowlProvided'],
  shop: ['petRoam', 'petBagOnly', 'indoorAllowed', 'waterBowlProvided'],
  groomer: ['walkInOk', 'onlineBooking', 'hasParking'],
};

function isValidGoogleMapsUrl(url: string): boolean {
  const patterns = [
    /^https?:\/\/www\.google\.com\/maps\//,
    /^https?:\/\/maps\.google\.com\//,
    /^https?:\/\/goo\.gl\/maps\//,
  ];
  return patterns.some((regex) => regex.test(url.trim()));
}

export default function MapSubmitPage() {
  const { getText } = useText();
  const { lang } = useLanguage();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [url, setUrl] = useState('');
  const [urlError, setUrlError] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('restaurant');
  const [fieldData, setFieldData] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [originalName, setOriginalName] = useState('');
  const [originalUrl, setOriginalUrl] = useState('');
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    const rawName = searchParams.get('name');
    const rawCat = searchParams.get('category');
    const rawUrl = searchParams.get('url');

    if (id) {
      setLocationId(id);
      supabase
        .from('locations')
        .select('*')
        .eq('id', id)
        .single()
        .then(({ data, error }) => {
          if (error || !data) return;
          setName(data.name || '');
          setOriginalName(data.name || '');
          setLat(data.lat?.toString() || '');
          setLng(data.lng?.toString() || '');
          setUrl(data.google_maps_url || '');
          setOriginalUrl(data.google_maps_url || '');
          setCategory(data.category || 'restaurant');
          setFieldData(data.data || {});
        });
    } else {
      if (rawName) setName(decodeURIComponent(rawName));
      if (rawCat && categories.includes(rawCat as Category)) {
        setCategory(rawCat as Category);
      }
      if (rawUrl) setUrl(decodeURIComponent(rawUrl));
    }
  }, [searchParams]);

  const extractFromUrl = () => {
    try {
      const decoded = decodeURIComponent(url);
      const latLngMatch = decoded.match(/!3d([\d.-]+)!4d([\d.-]+)/);
      if (latLngMatch) {
        setLat(latLngMatch[1]);
        setLng(latLngMatch[2]);
      } else {
        const fallbackMatch = decoded.match(/@([\d.\-]+),([\d.\-]+)/);
        if (fallbackMatch) {
          setLat(fallbackMatch[1]);
          setLng(fallbackMatch[2]);
        }
      }
      const nameMatch = decoded.match(/\/place\/(.*?)\//);
      if (nameMatch) {
        setName(nameMatch[1].replace(/\+/g, ' '));
      }
    } catch {
      alert('Invalid URL');
    }
  };

  const toggleField = (key: string) => {
    setFieldData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    if (!isValidGoogleMapsUrl(url)) {
      setUrlError(getText('mapsubmit_invalid_url'));
      return;
    } else {
      setUrlError('');
    }

    setSubmitting(true);

    const payload = {
      pname: name,
      plat: parseFloat(lat),
      plng: parseFloat(lng),
      pcategory: category,
      purl: url,
      pdata: fieldData,
    };

    const { error } = await supabase.rpc('upsert_location', payload);

    const { data: fetch } = await supabase
      .from('locations')
      .select('id')
      .eq('name', name)
      .eq('lat', parseFloat(lat))
      .eq('lng', parseFloat(lng))
      .maybeSingle();

    const resolvedId = locationId || fetch?.id;
    if (!locationId && fetch?.id) setLocationId(fetch.id);

    if (!error && user && resolvedId) {
      const editLog: Record<string, any> = { ...fieldData };

      if (originalName !== name) {
        editLog.name = { before: originalName, after: name };
      }

      if (originalUrl !== url) {
        editLog.url = { before: originalUrl, after: url };
      }

      const { error: insertError } = await supabase.from('location_edits').insert({
        location_id: resolvedId,
        user_id: user.id,
        username: user.user_metadata?.username || user.email || 'unknown',
        edited_fields: editLog,
        name,
        url,
      });
      
      if (insertError) {
        alert('❌ Failed to log edit:\n' + insertError.message);
      } else {
        alert('✅ Edit log inserted');
      }
    }

    setSubmitting(false);

    if (!error) {
      setSuccess(true);
      setUrl('');
      setName('');
      setLat('');
      setLng('');
      setFieldData({});
    } else {
      alert('Submit failed');
    }
  };

  if (!user || !admins.includes(user.user_metadata?.username || '')) {
    return (
      <>
        <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 pt-24">
          <p>{getText('unauthorized_meow')}</p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-black text-white px-4 sm:px-6 md:px-8 pt-24 pb-32 max-w-2xl mx-auto space-y-10">
        <h1 className="text-xl sm:text-2xl font-bold">{getText('mapsubmit_title')}</h1>

        <div className="space-y-4">
          <label className="block text-sm">{getText('mapsubmit_url')}</label>
          <div className="flex gap-2">
            <input
              className="flex-1 px-3 py-2 text-black rounded"
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <button
              onClick={extractFromUrl}
              type="button"
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-white"
            >
              {getText('mapsubmit_parse')}
            </button>
          </div>
          {urlError && <div className="text-red-500 text-sm">{urlError}</div>}

          <label className="block text-sm">{getText('mapsubmit_name')}</label>
          <input
            className="w-full px-3 py-2 text-black rounded"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm">{getText('mapsubmit_lat')}</label>
              <input
  className="w-full px-3 py-2 text-black rounded bg-gray-100"
  type="text"
  value={lat}
  onChange={(e) => setLat(e.target.value)}
  readOnly={!!locationId}
/>
            </div>
            <div className="flex-1">
              <label className="block text-sm">{getText('mapsubmit_lng')}</label>
              <input
  className="w-full px-3 py-2 text-black rounded bg-gray-100"
  type="text"
  value={lng}
  onChange={(e) => setLng(e.target.value)}
  readOnly={!!locationId}
/>
            </div>
          </div>

          <label className="block text-sm">{getText('mapsubmit_category')}</label>
          <select
            className="w-full px-3 py-2 text-black rounded"
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {getText(`map_category_${cat}`)}
              </option>
            ))}
          </select>

          {categoryFields[category]?.length > 0 && (
            <div>
              <label className="block text-sm mb-2">{getText('mapsubmit_fields')}</label>
              <div className="grid grid-cols-2 gap-2">
                {categoryFields[category].map((key) => (
                  <label key={key} className="inline-flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={fieldData[key] || false}
                      onChange={() => toggleField(key)}
                    />
                    <span>{getText(`map_key_${key}`)}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 py-2 rounded font-bold"
          >
            {submitting ? getText('mapsubmit_submitting') : getText('mapsubmit_submit')}
          </button>

          {success && <div className="text-green-400 mt-2">✅ {getText('mapsubmit_success')}</div>}

          {locationId && (
            <div className="text-center pt-6">
              <button
                onClick={() => setHistoryOpen(true)}
                className="text-xs text-gray-400 underline hover:text-white"
              >
                {getText('mapsubmit_change_log')}
              </button>

              <EditHistoryModal
                locationId={locationId}
                open={historyOpen}
                onClose={() => setHistoryOpen(false)}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}