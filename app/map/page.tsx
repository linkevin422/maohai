"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Category } from "@/lib/useLocations";

const Map = dynamic(() => import("@/components/Map"), { ssr: false });

export default function MapPage() {
  const [category, setCategory] = useState<Category>("restaurant");

  return (
    <>
      <Header />
      <div className="relative w-full h-screen pt-[64px] overflow-hidden">
        <Map selectedCategory={category} setSelectedCategory={setCategory} />
        <div className="absolute bottom-0 left-0 w-full z-50">
          <Footer />
        </div>
      </div>
    </>
  );
}
