'use client';

import Image from 'next/image';

export default function PreviousCoversModal({
  open,
  covers,
  onPick,
  onClose,
}: {
  open: boolean;
  covers: { cover_image_url: string; image_public_id: string }[];
  onPick: (url: string, id: string) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center">
      <div className="bg-white rounded-xl p-6 max-w-3xl w-full shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-[#574964]">選擇先前上傳的封面</h2>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-black">關閉</button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
          {covers.map((c, i) => (
            <button
              key={i}
              onClick={() => onPick(c.cover_image_url, c.image_public_id)}
              className="rounded-lg overflow-hidden hover:ring-2 ring-pink-400 transition"
            >
              <img
                src={c.cover_image_url}
                alt="cover"
                className="w-full h-32 object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
