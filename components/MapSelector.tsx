"use client";

import { Category } from "@/lib/useLocations";
import { useText } from "@/lib/getText";

type Props = {
  selected: Category;
  onChange: (category: Category) => void;
};

// Include human_hotel category
const categories: Category[] = ["restaurant", "vet", "hotel", "human_hotel", "park", "shop"];

export default function MapSelector({ selected, onChange }: Props) {
  const { getText } = useText();

  return (
    <div className="flex gap-3 flex-wrap justify-center mb-4">
      {categories.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium border transition
            ${selected === cat
              ? "bg-green-600 text-white border-green-700"
              : "bg-white text-gray-800 border-gray-300 hover:bg-gray-100"}`}
        >
          <span>
            {{
              restaurant: "🍽️",
              vet: "🏥",
              hotel: "🏨",
              human_hotel: "🛏️",
              park: "🌳",
              shop: "🛒",
            }[cat]}
          </span>
          <span>{getText(`map_category_${cat}`)}</span>
        </button>
      ))}
    </div>
  );
}
