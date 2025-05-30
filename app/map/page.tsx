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
      <div className="relative w-full" style={{ minHeight: "100vh" }}>
        <div className="pt-[64px] pb-[96px] w-full h-full absolute top-0 left-0">
          <Map selectedCategory={category} setSelectedCategory={setCategory} />
        </div>
      </div>
      <Footer />
    </>
  );
}
