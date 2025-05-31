'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/LanguageProvider';
import { useText } from '@/lib/getText';
import { Category } from '@/lib/useLocations';
import { admins } from '@/lib/admins';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  hotel: ['allowLargeDogs', 'petAmenities', 'petRoomService', 'separatePetRooms', 'canBeLeftAlone'],
  human_hotel: ['petAllowed', 'limitByWeight', 'additionalFee', 'canBeLeftAlone', 'waterBowlProvided'],
  park: ['offLeashOk', 'fencedArea', 'waterBowlProvided'],
  shop: ['petRoam', 'petBagOnly', 'indoorAllowed', 'waterBowlProvided'],
  groomer: ['walkInOk', 'onlineBooking', 'hasParking'],
};

export default function MapSubmitPage() {
  const { lang, setLang } = useLanguage();
  const { getText } = useText();
  const searchParams = useSearchParams();
  const supabaseClient = createClientComponentClient();

  const [user, setUser] = useState<User | null>(null);
  const [url, setUrl] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Category>('restaurant');
  const [fieldData, setFieldData] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [locationId, setLocationId] = useState<string | null>(null);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => setUser(data.user ?? null));
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
          setLat(data.lat?.toString() || '');
          setLng(data.lng?.toString() || '');
          setUrl(data.google_maps_url || '');
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
    } catch (e) {
      alert('Invalid URL');
    }
  };

  const toggleField = (key: string) => {
    setFieldData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
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

    if (!error && user) {
      // refetch the location based on rounded lat/lng
      const { data: match } = await supabase
        .from('locations')
        .select('id')
        .eq('lat', parseFloat(lat).toFixed(5))
        .eq('lng', parseFloat(lng).toFixed(5))
        .single();
    
      if (match?.id) {
        await supabase.from('location_edits').insert({
          location_id: match.id,
          user_id: user.id,
          edited_fields: fieldData,
        });
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
      console.error('RPC error:', error);
      alert('Submit failed');
    }
  };

  if (!user || !admins.includes(user.user_metadata?.username || '')) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <p>
  {Math.random() < 0.5 ? getText('unauthorized_meow') : getText('unauthorized_woof')}
</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="pt-[64px] min-h-screen bg-black text-white p-6 max-w-2xl mx-auto pb-32 space-y-12">
        <h1 className="text-2xl font-bold mb-4">📍 {getText('mapsubmit_title')}</h1>

        <label className="block text-sm mb-1">{getText('mapsubmit_url')}</label>
        <div className="flex gap-2 mb-4">
          <input
            className="w-full px-3 py-2 text-black rounded"
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

        <label className="block text-sm mb-1">{getText('mapsubmit_name')}</label>
        <input
          className="w-full px-3 py-2 text-black rounded mb-4"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">{getText('mapsubmit_lat')}</label>
            <input
              className="w-full px-3 py-2 text-black rounded"
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">{getText('mapsubmit_lng')}</label>
            <input
              className="w-full px-3 py-2 text-black rounded"
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </div>
        </div>

        <label className="block text-sm mb-1">{getText('mapsubmit_category')}</label>
        <select
          className="w-full px-3 py-2 text-black rounded mb-4"
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
          <div className="mb-4">
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

        {success && <div className="text-green-400 mt-4">✅ {getText('mapsubmit_success')}</div>}
      </div>
      <Footer />
    </>
  );
}
