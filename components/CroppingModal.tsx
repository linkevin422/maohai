'use client';

import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Dialog } from '@headlessui/react';
import getCroppedImg from './getCroppedImg';
import { Area } from 'react-easy-crop';
type Props = {
  imageUrl: string;
  open: boolean;
  onClose: () => void;
  onCropComplete: (blob: Blob) => void;
  aspect?: number; // optional override, default is 16:9
};

export default function CroppingModal({
  imageUrl,
  open,
  onClose,
  onCropComplete,
  aspect = 16 / 9,
}: Props) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [processing, setProcessing] = useState(false);

  const onCropCompleteInternal = useCallback(
    (_: Area, croppedPixels: Area) => {
      setCroppedAreaPixels(croppedPixels);
    },
    []
  );
  
  const handleConfirm = async () => {
    setProcessing(true);
    try {
      const blob = await getCroppedImg(imageUrl, croppedAreaPixels);
      onCropComplete(blob);
      onClose();
    } catch (err) {
      console.error('Crop error:', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="fixed z-50 inset-0">
      <div className="fixed inset-0 bg-black/60" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-xl shadow-xl max-w-3xl w-full overflow-hidden">
          <div className="relative w-full h-[60vh] bg-black">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteInternal}
            />
          </div>
          <div className="flex justify-between items-center p-4 border-t">
            <div className="flex gap-2 items-center">
              <label className="text-sm text-gray-700">縮放：</label>
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-32"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                disabled={processing}
                className="px-4 py-2 rounded bg-pink-600 text-white hover:bg-pink-700"
              >
                {processing ? '處理中…' : '裁切並上傳'}
              </button>
            </div>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}