"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MapSelector from "@/components/MapSelector";
import { Category } from "@/lib/useLocations";
import { useText } from "@/lib/getText";

// Dynamically load Map only on client
const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapPage() {
  const [category, setCategory] = useState<Category>("restaurant");
  const { getText } = useText();

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto pt-28 pb-10 px-4">
      <h1 className="text-3xl font-bold mb-6">
          {getText("map_title")}
        </h1>
        <MapSelector selected={category} onChange={setCategory} />
        <Map selectedCategory={category} />
      </main>
      <Footer />
    </>
  );
}
