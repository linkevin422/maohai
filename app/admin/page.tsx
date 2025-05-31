'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useText } from "@/lib/getText";

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

const ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_PASS;

export default function AdminPage() {
  const { getText } = useText();
  const [accessGranted, setAccessGranted] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [loading, setLoading] = useState(false);

  const checkAccess = () => {
    if (input === ADMIN_PASS) {
      setAccessGranted(true);
      fetchSuggestions();
    } else {
      setError("Wrong password");
    }
  };

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

  if (!accessGranted) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm bg-white/10 p-6 rounded-2xl shadow-xl backdrop-blur">
          <h1 className="text-xl font-bold mb-4 text-center tracking-wide">
            Admin Login
          </h1>
          <input
            type="password"
            placeholder="Enter password"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              setError("");
            }}
            className="w-full p-3 rounded-lg text-white bg-black border border-white/20 placeholder-white/40 mb-3"
          />
          {error && (
            <p className="text-red-500 text-sm mb-3 text-center">{error}</p>
          )}
          <button
            onClick={checkAccess}
            className="w-full bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-semibold transition"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
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
  );
}
