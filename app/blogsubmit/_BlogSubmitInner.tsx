'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { optimizeImage } from '@/lib/optimizeImage';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import CroppingModal from '@/components/CroppingModal';

const supabase = createClientComponentClient();
import slugify from 'slugify';
import { admins } from '@/lib/admins';

export default function BlogSubmitPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editingId = searchParams.get('edit');

  const [userName, setUserName] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState<string | null>(null);
  const [coverPublicId, setCoverPublicId] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tagList, setTagList] = useState<string[]>([]);
  const [thumbnailAlt, setThumbnailAlt] = useState('');
  const [pinned, setPinned] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [rawImageForCrop, setRawImageForCrop] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [StarterKit, Image],
    content: '',
    immediatelyRender: false,
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      const username = data.user?.user_metadata?.username || null;
      setUserName(username);
      setAuthChecked(true);

      if (!admins.includes(username || '')) {
        router.push('/');
      }
    };

    checkUser();
  }, []);

  useEffect(() => {
    if (!editingId || !editor) {
      setLoading(false);
      return;
    }

    const fetchBlog = async () => {
      const { data, error } = await supabase
        .from('blogs')
        .select('*')
        .eq('id', editingId)
        .single();

      if (error) {
        console.error(error);
        return;
      }

      setTitle(data.title);
      setCoverUrl(data.cover_image_url);
      setCoverPublicId(data.image_public_id);
      setCategory(data.category || '');
      setTagList(data.tags || []);
      setThumbnailAlt(data.thumbnail_alt || '');
      setPinned(data.pinned || false);
      editor.commands.setContent(data.content || '');
      setLoading(false);
    };

    fetchBlog();
  }, [editingId, editor]);

  const handleCoverUpload = async (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        setRawImageForCrop(reader.result);
        setCropModalOpen(true);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCroppedImage = async (blob: Blob) => {
    const file = new File([blob], 'cropped-image.webp', { type: 'image/webp', lastModified: Date.now() });
    const result = await uploadToCloudinary(file);
        if (result) {
      setCoverUrl(result.url);
      setCoverPublicId(result.public_id);
    }
  };

  const handleInsertImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      const result = await uploadToCloudinary(file);
      if (result) editor?.commands.setImage({ src: result.url });
    };
    input.click();
  };

  const removeTag = (index: number) => {
    setTagList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title || !editor?.getHTML() || !coverUrl || !coverPublicId) {
      alert('缺少欄位');
      return;
    }

    setSubmitting(true);

    const content = editor.getHTML();
    const slug = slugify(title, { lower: true });

    const { data: userData } = await supabase.auth.getUser();
    const user_id = userData.user?.id || null;
    const username = userData.user?.user_metadata?.username || '';

    const readingTime = Math.ceil(
      content.replace(/<[^>]+>/g, '').split(/\s+/).length / 200
    );

    const postData = {
      title,
      content,
      cover_image_url: coverUrl,
      image_public_id: coverPublicId,
      slug,
      category,
      tags: tagList,
      excerpt: content.replace(/<[^>]+>/g, '').slice(0, 160),
      user_id,
      username,
      pinned,
      reading_time: readingTime,
      thumbnail_alt: thumbnailAlt,
    };

    let result;
    if (editingId) {
      result = await supabase.from('blogs').update(postData).eq('id', editingId);
    } else {
      result = await supabase.from('blogs').insert({ ...postData, likes: 0 });
    }

    setSubmitting(false);

    if (result.error) {
      console.error(result.error);
      alert('儲存失敗');
    } else {
      alert('已儲存！');
      router.push('/blogadmin');
    }
  };

  if (!authChecked) return <p className="p-6 text-center text-gray-700">正在驗證身份…</p>;
  if (!admins.includes(userName || '')) return <p className="p-6 text-center text-red-600">你沒有權限喔</p>;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10 bg-white rounded-xl shadow-xl space-y-8 border border-gray-200">
      <h1 className="text-3xl font-extrabold text-center text-gray-900 tracking-tight">
        {editingId ? '編輯文章' : '寫一篇新文章'}
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">載入中…</p>
      ) : (
        <div className="space-y-6 animate-fadein">
<div className="flex justify-center">
  <input
    type="text"
    placeholder="文章標題"
    className="text-center w-full max-w-2xl px-6 py-4 text-2xl font-semibold border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition text-gray-900"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
</div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">封面上傳</label>
            <input
              type="file"
              className="block w-full text-sm text-gray-500"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleCoverUpload(file);
              }}
            />
            {coverUrl && (
              <img
                src={optimizeImage(coverUrl)}
                alt="封面"
                className="mt-4 w-full object-cover rounded-lg shadow"
              />
            )}
          </div>

          <select
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-pink-400 transition text-gray-900 bg-white"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">請選擇分類</option>
            <option value="好健康">好健康</option>
            <option value="好旅遊">好旅遊</option>
            <option value="好餐廳">好餐廳</option>
            <option value="好獸醫">好獸醫</option>
            <option value="好地點">好地點</option>
            <option value="好書">好書</option>
            <option value="好用品">好用品</option>
          </select>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">標籤（按 Enter 鍵新增）</label>
            <div className="flex flex-wrap gap-2 border border-gray-300 rounded-lg p-3 bg-white min-h-[56px]">
              {tagList.map((tag, index) => (
                <div
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(index)}
                    className="ml-2 text-green-600 hover:text-red-500 focus:outline-none"
                  >
                    ×
                  </button>
                </div>
              ))}
              <input
                type="text"
                className="flex-grow min-w-[100px] text-gray-900 outline-none"
                placeholder="輸入後按 Enter"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (
                    (e.key === 'Enter' || e.key === ',' || e.key === '，') &&
                    tagInput.trim()
                  ) {
                    e.preventDefault();
                    const newTag = tagInput.trim();
                    if (!tagList.includes(newTag)) {
                      setTagList([...tagList, newTag]);
                    }
                    setTagInput('');
                  } else if (e.key === 'Backspace' && tagInput === '') {
                    setTagList((prev) => prev.slice(0, -1));
                  }
                }}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">封面圖敘述文字（助於 SEO）</label>
            <input
              type="text"
              placeholder="例如：一隻博美坐在咖啡廳門口看著鏡頭"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={thumbnailAlt}
              onChange={(e) => setThumbnailAlt(e.target.value)}
            />
          </div>

          <label className="inline-flex items-center space-x-2">
            <input
              type="checkbox"
              checked={pinned}
              onChange={(e) => setPinned(e.target.checked)}
              className="rounded border-gray-300 text-pink-600 focus:ring-pink-500"
            />
            <span className="text-gray-700 text-sm">置頂文章</span>
          </label>

          <div className="bg-gray-50 border border-gray-300 rounded-lg p-4 shadow-sm space-y-2">
            <div className="flex justify-between items-center">
              <label className="font-medium text-gray-700">文章內容</label>
              <button
                onClick={handleInsertImage}
                className="text-sm text-blue-600 hover:underline"
              >
                插入圖片
              </button>
            </div>
            <div className="bg-white rounded-lg border border-gray-300 shadow-sm">
              <EditorContent editor={editor} className="ProseMirror text-gray-800" />
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="w-full py-3 text-lg font-bold bg-gradient-to-r from-yellow-400 via-pink-400 to-red-400 text-white rounded-xl shadow-lg hover:opacity-90 transition"
          >
            {submitting ? '儲存中…' : editingId ? '更新文章' : '發佈文章'}
          </button>
        </div>
      )}
      {rawImageForCrop && (
        <CroppingModal
          imageUrl={rawImageForCrop}
          open={cropModalOpen}
          onClose={() => setCropModalOpen(false)}
          onCropComplete={handleCroppedImage}
          aspect={16 / 9}
        />
      )}
    </div>
  );
}
