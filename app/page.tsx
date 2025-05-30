"use client";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useText } from "@/lib/getText";
import { motion } from "framer-motion";

export default function HomePage() {
  const { getText } = useText();

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />

      <main className="flex flex-1 items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            {getText("home_hero_title")}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto">
            {getText("home_hero_subtitle")}
          </p>
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}
