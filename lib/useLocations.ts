"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Category = "restaurant" | "vet" | "hotel" | "human_hotel" | "park" | "shop" | "groomer";

export type Location = {
    id: string;
    name: string;
    lat: number;
    lng: number;
    address?: string;
    category: string;
    google_maps_url?: string;
    data?: Record<string, any>;
  };
  
export function useLocations(category: Category) {
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("locations")
        .select("*")
        .eq("category", category)
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setLocations([]);
      } else {
        setLocations(data || []);
      }

      setLoading(false);
    };

    fetch();
  }, [category]);

  return { locations, loading, error };
}
