"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useText } from "@/lib/getText";

type Props = {
  locationId: string;
  locationName: string;
  locationCategory: string;
  open: boolean;
  onClose: () => void;
};

export default function SuggestionModal({
  locationId,
  locationName,
  locationCategory,
  open,
  onClose,
}: Props) {
  const { getText } = useText();
  const [reason, setReason] = useState("other");
  const [details, setDetails] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const submit = async () => {
    setError("");
    if (details.trim().length < 5) {
      setError(getText("suggestion_error_empty"));
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("map_suggestions").insert([
      {
        location_id: locationId,
        location_name: locationName,
        location_category: locationCategory,
        reason,
        details: details.trim(),
        email: email.trim() || null,
        ip_address: null,
      },
    ]);

    setLoading(false);

    if (error) {
      setError(getText("suggestion_error_submit"));
    } else {
      setSuccess(true);
      setTimeout(() => {
        setReason("other");
        setDetails("");
        setEmail("");
        setSuccess(false);
        onClose();
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-white text-black w-full max-w-md p-6 rounded-xl shadow-xl relative">
        <h2 className="text-xl font-bold mb-4">{getText("suggestion_title")}</h2>

        <label className="block text-sm font-medium mb-1">
          {getText("suggestion_reason_label")}
        </label>
        <select
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="w-full mb-3 border border-gray-300 rounded-md p-2 text-sm bg-white text-black focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="not_exist">{getText("suggestion_reason_not_exist")}</option>
          <option value="wrong_location">{getText("suggestion_reason_wrong_location")}</option>
          <option value="pet_info">{getText("suggestion_reason_pet_info")}</option>
          <option value="broken_link">{getText("suggestion_reason_broken_link")}</option>
          <option value="other">{getText("suggestion_reason_other")}</option>
        </select>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          placeholder={getText("suggestion_details_placeholder")}
          className="w-full h-28 border border-gray-300 rounded-md p-2 mb-3 text-sm resize-none text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={getText("suggestion_email_placeholder")}
          className="w-full border border-gray-300 rounded-md p-2 mb-3 text-sm text-black bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
        />

        {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
        {success && <p className="text-green-600 text-sm mb-2">{getText("suggestion_success")}</p>}

        <div className="flex justify-end gap-3 mt-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-sm rounded-md bg-gray-200 hover:bg-gray-300 text-black font-medium"
            disabled={loading}
          >
            {getText("button_cancel")}
          </button>
          <button
            onClick={submit}
            className="px-4 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 font-medium"
            disabled={loading}
          >
            {loading ? getText("button_submitting") : getText("button_submit")}
          </button>
        </div>
      </div>
    </div>
  );
}
