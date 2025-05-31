'use client';

import { useEffect, useState } from "react";
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User } from '@supabase/supabase-js';
import { supabase } from "@/lib/supabase";
import { useText } from "@/lib/getText";
import { admins } from "@/lib/admins";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

type Suggestion = {
  id: string;
  location_id: string | null;
  location_name: string;
  location_category: string;
  reason: string;
  details: string;
  email: string | null;
  created_at: string;
};

export default function AdminPage() {
  const { getText } = useText();
  const supabaseClient = createClientComponentClient();
  const [user, setUser] = useState<User | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabaseClient.auth.getUser().then(({ data }) => {
      setUser(data.user ?? null);
      if (data.user && admins.includes(data.user.user_metadata?.username || "")) {
        fetchSuggestions();
      }
    });
  }, []);

  const fetchSuggestions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("map_suggestions")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) {
      setSuggestions(data as Suggestion[]);
    }
    setLoading(false);
  };

  if (!user || !admins.includes(user.user_metadata?.username || "")) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <p>🚫 Not authorized</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-black text-white p-6">
        <h1 className="text-3xl font-bold mb-8 text-center">🛠️ Map Suggestions</h1>

        {loading ? (
          <p className="text-sm text-center">Loading...</p>
        ) : suggestions.length === 0 ? (
          <p className="text-sm text-center">No suggestions found.</p>
        ) : (
          <div className="overflow-x-auto bg-white/5 rounded-xl shadow-md backdrop-blur border border-white/10">
            <table className="min-w-full text-sm">
              <thead className="bg-white/10 text-left text-white uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Details</th>
                  <th className="px-4 py-3">Email / Delete</th>
                </tr>
              </thead>
              <tbody>
                {suggestions.map((s) => (
                  <tr
                    key={s.id}
                    className="border-t border-white/10 hover:bg-white/5 transition"
                  >
                    <td className="px-4 py-3 whitespace-nowrap text-white/80">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-white">{s.location_name}</td>
                    <td className="px-4 py-3 text-white">
                      {getText(`map_category_${s.location_category}`)}
                    </td>
                    <td className="px-4 py-3 text-white">
                      {getText(`suggestion_reason_${s.reason}`)}
                    </td>
                    <td className="px-4 py-3 max-w-lg whitespace-pre-wrap text-white/90">
                      {s.details}
                    </td>
                    <td className="px-4 py-3 flex items-center gap-3 text-white/70">
                      <span className="truncate max-w-[160px]">{s.email || "-"}</span>
                      <button
                        onClick={async () => {
                          const confirmed = window.confirm("Are you sure you want to delete this suggestion?");
                          if (!confirmed) return;
                          const { error } = await supabase
                            .from("map_suggestions")
                            .delete()
                            .eq("id", s.id);
                          if (!error) {
                            setSuggestions((prev) => prev.filter((x) => x.id !== s.id));
                          } else {
                            alert("Failed to delete. Check console.");
                            console.error(error);
                          }
                        }}
                        className="text-red-500 text-lg font-bold hover:text-red-700 transition"
                        title="Delete"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
