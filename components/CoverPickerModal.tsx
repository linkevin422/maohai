// components/CoverPickerModal.tsx
'use client';

import { Dialog } from '@headlessui/react';
import { useEffect, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (url: string, id: string) => void;
}

export default function CoverPickerModal({ open, onClose, onSelect }: Props) {
  const [images, setImages] = useState<{ url: string; id: string }[]>([]);

  useEffect(() => {
    // Replace with your own fetch logic if needed
    fetch('/api/blogcoverimages')
      .then((res) => res.json())
      .then((data) => setImages(data))
      .catch(console.error);
  }, []);

  return (
    <Dialog open={open} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
      <Dialog.Panel className="bg-white rounded-lg shadow-xl p-6 max-h-[90vh] overflow-y-auto w-full max-w-2xl">
        <Dialog.Title className="text-xl font-bold mb-4">選擇現有封面</Dialog.Title>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {images.map((img, i) => (
            <img
              key={i}
              src={img.url}
              alt={`封面 ${i}`}
              className="w-full h-40 object-cover rounded-lg cursor-pointer hover:opacity-80"
              onClick={() => {
                onSelect(img.url, img.id);
                onClose();
              }}
            />
          ))}
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}
