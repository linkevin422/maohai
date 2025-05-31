"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export type Category = "restaurant" | "vet" | "hotel" | "human_hotel" | "park" | "shop" | "groomer";

export type Location = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  address?: string;
  data?: Record<string, any>;
  google_maps_url?: string;
  click_count?: number; // 👈 add this
};
  
  export function useLocations(category: Category) {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
  
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
  
    useEffect(() => {
      fetch();
    }, [category]);
  
    return { locations, loading, error, refetch: fetch }; // 👈 expose it here
  }
