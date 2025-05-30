"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useLanguage } from "@/lib/LanguageProvider";
import { useText } from "@/lib/getText";
import { Category } from "@/lib/useLocations";

const password = "dogcat";

const categories: Category[] = [
  "restaurant",
  "vet",
  "hotel",
  "human_hotel",
  "park",
  "shop",
  "groomer",
];

const categoryFields: Record<Category, string[]> = {
  restaurant: ["petRoam", "petBagOnly", "indoorAllowed", "outdoorSeating", "petMenu", "waterBowlProvided"],
  vet: ["open24hr", "emergencyAvailable", "exoticsOk", "walkInOk", "onlineBooking", "hasParking", "inHouseLab"],
  hotel: ["allowLargeDogs", "petAmenities", "petRoomService", "separatePetRooms", "canBeLeftAlone"],
  human_hotel: ["petAllowed", "limitByWeight", "additionalFee", "canBeLeftAlone", "waterBowlProvided"],
  park: ["offLeashOk", "fencedArea", "waterBowlProvided"],
  shop: ["petRoam", "petBagOnly", "indoorAllowed", "waterBowlProvided"],
  groomer: ["walkInOk", "onlineBooking", "hasParking"]
};

type ParsedItem = {
  name: string;
  lat: number;
  lng: number;
  url: string;
};

export default function MapSubmitPage() {
  const router = useRouter();
  const { lang, setLang } = useLanguage();
  const { getText } = useText();

  const [auth, setAuth] = useState("");
  const [url, setUrl] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<Category>("restaurant");
  const [fieldData, setFieldData] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const [batchInput, setBatchInput] = useState("");
  const [batchList, setBatchList] = useState<ParsedItem[]>([]);
  const [batchCategory, setBatchCategory] = useState<Category>("restaurant");
  const [batchSubmitting, setBatchSubmitting] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState(false);

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
        setName(nameMatch[1].replace(/\+/g, " "));
      }
    } catch (e) {
      alert("Invalid URL");
    }
  };

  const toggleField = (key: string) => {
    setFieldData((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    const { error } = await supabase.rpc("upsert_location", {
        pname: name,
        plat: parseFloat(lat),
        plng: parseFloat(lng),
        pcategory: category,
        purl: url,
        pdata: fieldData,
      });
      
      setSubmitting(false);
      
      if (!error) {
        setSuccess(true);
        setUrl("");
        setName("");
        setLat("");
        setLng("");
        setFieldData({});
      } else {
        console.error("RPC error:", error); // ← ADD THIS
        alert("Submit failed");
      }
        };

  const parseBatchInput = () => {
    const lines = batchInput.trim().split("\n");
    const parsed: ParsedItem[] = [];

    lines.forEach((line) => {
      try {
        const decoded = decodeURIComponent(line);
        const latLngMatch = decoded.match(/!3d([\d.-]+)!4d([\d.-]+)/);
        const fallbackMatch = decoded.match(/@([\d.\-]+),([\d.\-]+)/);
        const nameMatch = decoded.match(/\/place\/(.*?)\//);

        let lat = 0;
        let lng = 0;
        if (latLngMatch) {
          lat = parseFloat(latLngMatch[1]);
          lng = parseFloat(latLngMatch[2]);
        } else if (fallbackMatch) {
          lat = parseFloat(fallbackMatch[1]);
          lng = parseFloat(fallbackMatch[2]);
        }

        const name = nameMatch ? nameMatch[1].replace(/\+/g, " ") : "Unknown";

        if (lat && lng && name) {
          parsed.push({ name, lat, lng, url: line.trim() });
        }
      } catch (e) {
        // skip invalid
      }
    });

    setBatchList(parsed);
    setBatchSuccess(false);
  };

  const submitBatch = async () => {
    if (batchList.length === 0) return;
    setBatchSubmitting(true);
    for (const item of batchList) {
        const { error } = await supabase.rpc("upsert_location", {
          pname: item.name,
          plat: item.lat,
          plng: item.lng,
          pcategory: batchCategory,
          purl: item.url,
          pdata: {},
        });
        if (error) console.error("Upsert error:", error);
      }
          setBatchSubmitting(false);
          setBatchSuccess(true);
          setBatchList([]);
          setBatchInput("");
          
  };

  if (auth !== password) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4">
        <input
          className="bg-white text-black px-4 py-2 rounded"
          type="password"
          placeholder="Enter password"
          value={auth}
          onChange={(e) => setAuth(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-2xl mx-auto pb-32 space-y-12">
      {/* --- SINGLE SUBMIT --- */}
      <div>
        <div className="flex justify-between mb-4">
          <h1 className="text-2xl font-bold">📍 {getText("mapsubmit_title")}</h1>
          <select
            className="bg-white text-black px-2 py-1 rounded"
            value={lang}
            onChange={(e) => setLang(e.target.value as "en" | "zh-Hant")}
          >
            <option value="en">English</option>
            <option value="zh-Hant">中文</option>
          </select>
        </div>

        <label className="block text-sm mb-1">{getText("mapsubmit_url")}</label>
        <div className="flex gap-2 mb-4">
          <input
            className="w-full px-3 py-2 text-black rounded"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <button onClick={extractFromUrl} className="bg-green-600 px-4 py-2 rounded">
            {getText("mapsubmit_parse")}
          </button>
        </div>

        <label className="block text-sm mb-1">{getText("mapsubmit_name")}</label>
        <input
          className="w-full px-3 py-2 text-black rounded mb-4"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <label className="block text-sm mb-1">{getText("mapsubmit_lat")}</label>
            <input
              className="w-full px-3 py-2 text-black rounded"
              type="text"
              value={lat}
              onChange={(e) => setLat(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm mb-1">{getText("mapsubmit_lng")}</label>
            <input
              className="w-full px-3 py-2 text-black rounded"
              type="text"
              value={lng}
              onChange={(e) => setLng(e.target.value)}
            />
          </div>
        </div>

        <label className="block text-sm mb-1">{getText("mapsubmit_category")}</label>
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
            <label className="block text-sm mb-2">{getText("mapsubmit_fields")}</label>
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
          {submitting ? getText("mapsubmit_submitting") : getText("mapsubmit_submit")}
        </button>

        {success && <div className="text-green-400 mt-4">✅ {getText("mapsubmit_success")}</div>}
      </div>

      {/* --- BATCH SUBMIT --- */}
      <div>
        <h2 className="text-xl font-bold mb-4">{getText("mapsubmit_batch_title")}</h2>

        <label className="block text-sm mb-1">{getText("mapsubmit_batch_category")}</label>
        <select
          className="w-full px-3 py-2 text-black rounded mb-4"
          value={batchCategory}
          onChange={(e) => setBatchCategory(e.target.value as Category)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {getText(`map_category_${cat}`)}
            </option>
          ))}
        </select>

        <label className="block text-sm mb-1">{getText("mapsubmit_batch_input")}</label>
        <textarea
          rows={6}
          className="w-full px-3 py-2 text-black rounded mb-4"
          placeholder={getText("mapsubmit_batch_placeholder")}
          value={batchInput}
          onChange={(e) => setBatchInput(e.target.value)}
        />

        <button onClick={parseBatchInput} className="w-full bg-yellow-600 hover:bg-yellow-700 py-2 rounded font-bold mb-4">
          {getText("mapsubmit_batch_parse")}
        </button>

        {batchList.length > 0 && (
          <>
            <div className="text-sm mb-2">
              {batchList.length} parsed:
              <ul className="list-disc pl-6 mt-2">
                {batchList.map((item, idx) => (
                  <li key={idx}>{item.name} ({item.lat.toFixed(5)}, {item.lng.toFixed(5)})</li>
                ))}
              </ul>
            </div>
            <button
              onClick={submitBatch}
              disabled={batchSubmitting}
              className="w-full bg-green-600 hover:bg-green-700 py-2 rounded font-bold"
            >
              {batchSubmitting ? getText("mapsubmit_batch_submitting") : getText("mapsubmit_batch_submit")}
            </button>
            {batchSuccess && <div className="text-green-400 mt-4">{getText("mapsubmit_batch_success")}</div>}
          </>
        )}
      </div>
    </div>
  );
}
