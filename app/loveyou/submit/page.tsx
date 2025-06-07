'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useText } from '@/lib/getText';
import CroppingModal from '@/components/CroppingModal';
import { uploadToCloudinary } from '@/lib/cloudinary';

// ⬅️ prevent build-time prerender
export const dynamic = 'force-dynamic';

function LoveYouSubmitInner() {
  const supabase = createClientComponentClient();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get('edit');
  const { getText } = useText();

  /* ---------- ⛔ redirect if NOT authenticated ---------- */
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.replace('/register');
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [croppingOpen, setCroppingOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [petName, setPetName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [birthYear, setBirthYear] = useState('');
  const [deathYear, setDeathYear] = useState('');
  const [note, setNote] = useState('');

  /* ------------------- load existing record when editing ------------------- */
  useEffect(() => {
    if (!editingId) return;

    (async () => {
      const { data } = await supabase
        .from('memorials')
        .select('*')
        .eq('id', editingId)
        .single();

      if (!data) return;
      setPetName(data.pet_name || '');
      setOwnerName(data.owner_name || '');
      setBirthYear(data.birth_year?.toString() || '');
      setDeathYear(data.death_year?.toString() || '');
      setNote(data.note || '');
      setImageUrl(data.photo_url || '');
    })();
  }, [editingId, supabase]);

  /* ------------------------------ handlers ------------------------------- */
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setCroppingOpen(true);
  };

  const handleCropped = async (blob: Blob) => {
    const file = new File([blob], 'memorial.webp', { type: 'image/webp' });
    setImageFile(file);
  };

  const handleSubmit = async () => {
    if (!petName || !ownerName || !deathYear) {
      alert(getText('form_error'));
      return;
    }

    setUploading(true);
    const user = (await supabase.auth.getUser()).data.user;

    if (!user) {
      alert(getText('auth_error'));
      setUploading(false);
      return;
    }

    let finalPhotoUrl = imageUrl || '';
    if (imageFile) {
      const result = await uploadToCloudinary(imageFile);
      if (!result) {
        alert(getText('upload_error'));
        setUploading(false);
        return;
      }
      finalPhotoUrl = result.url;
    }

    const payload = {
      user_id: user.id,
      pet_name: petName,
      owner_name: ownerName,
      birth_year: birthYear ? parseInt(birthYear) : null,
      death_year: parseInt(deathYear),
      note,
      photo_url: finalPhotoUrl,
      visible: true,
    };

    const { error } = editingId
      ? await supabase.from('memorials').update(payload).eq('id', editingId)
      : await supabase.from('memorials').insert(payload);

    if (error) {
      alert(getText('submit_error') + error.message);
    } else {
      router.push('/loveyou');
    }

    setUploading(false);
  };

  /* ------------------------------- UI ------------------------------- */
  return (
    <div className="max-w-screen-sm mx-auto px-6 py-10 text-[#574964]">
      <h1 className="text-2xl md:text-3xl font-semibold mb-6 text-center">
        {editingId ? getText('form_edit_title') : getText('form_title')}
      </h1>

      {/* photo uploader */}
      <label className="block mb-2 text-sm font-medium">{getText('form_image_label')}</label>
      <label className="block w-full border border-dashed border-[#C8AAAA] bg-[#F9F4F1] text-center py-6 rounded-lg cursor-pointer hover:bg-[#f1e7e4] mb-4">
        <span className="text-[#9F8383]">{getText('form_image_hint')}</span>
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>
      {imageFile && <p className="text-green-600 text-sm mb-4">{getText('form_ready')}</p>}

      {/* text inputs */}
      <label className="block mb-2 text-sm font-medium">{getText('form_pet_name')}</label>
      <input
        type="text"
        value={petName}
        onChange={(e) => setPetName(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <label className="block mb-2 text-sm font-medium">{getText('form_owner_name')}</label>
      <input
        type="text"
        value={ownerName}
        onChange={(e) => setOwnerName(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <label className="block mb-2 text-sm font-medium">{getText('form_birth_year')}</label>
      <input
        type="number"
        value={birthYear}
        onChange={(e) => setBirthYear(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <label className="block mb-2 text-sm font-medium">{getText('form_death_year')}</label>
      <input
        type="number"
        value={deathYear}
        onChange={(e) => setDeathYear(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-4"
      />

      <label className="block mb-2 text-sm font-medium">{getText('form_note')}</label>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full border px-3 py-2 rounded mb-6"
        rows={3}
      />

      <button
        onClick={handleSubmit}
        disabled={uploading}
        className="bg-[#C98C95] text-white px-4 py-2 rounded hover:bg-[#b87781] w-full transition"
      >
        {uploading
          ? getText('form_uploading')
          : editingId
          ? getText('form_update')
          : getText('form_submit')}
      </button>

      {editingId && (
  <button
  onClick={async () => {
    if (!confirm(getText('delete_confirm'))) return;
  
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) {
      alert(getText('auth_error'));
      return;
    }
  
    const { error } = await supabase
      .from('memorials')
      .update({ visible: false })
      .eq('id', editingId);
  
    if (error) {
      alert(getText('submit_error') + error.message);
      return;
    }
  
    router.push('/loveyou');
  }}

    className="mt-4 text-sm text-[#9F8383] underline underline-offset-2 hover:text-[#b87781] transition w-full text-center"
  >
    {getText('delete_button')}
  </button>
)}


      {/* cropping modal */}
      <CroppingModal
        imageUrl={imageUrl ?? ''}
        open={croppingOpen}
        onClose={() => setCroppingOpen(false)}
        onCropComplete={handleCropped}
        aspect={1}
      />
    </div>
  );
}

/* -------------------- page export wrapped in <Suspense> -------------------- */
export default function LoveYouSubmitPage() {
  return (
    <Suspense>
      <LoveYouSubmitInner />
    </Suspense>
  );
}
