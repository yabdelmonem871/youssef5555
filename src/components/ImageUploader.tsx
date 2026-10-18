import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { LoadingSpinner } from './States';
import { supabase } from '@/lib/supabase';

export function ImageUploader({
  url,
  onUpload,
}: {
  url: string | null;
  onUpload: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(url);

  useEffect(() => setPreview(url), [url]);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${Date.now()}.${ext}`;
      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      onUpload(urlData.publicUrl);
      setPreview(urlData.publicUrl);
    } catch (err) {
      alert('فشل رفع الصورة: ' + (err as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-secondary-100 border border-secondary-200 shrink-0">
        {preview ? (
          <>
            <img src={preview} alt="معاينة" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setPreview(null);
                onUpload('');
              }}
              className="absolute top-1 left-1 w-6 h-6 rounded-full bg-error-500 text-white flex items-center justify-center"
            >
              <X className="w-3 h-3" />
            </button>
          </>
        ) : uploading ? (
          <LoadingSpinner />
        ) : null}
      </div>
      <div>
        <label className="btn-secondary cursor-pointer text-sm">
          اختيار صورة
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </label>
        <p className="text-xs text-secondary-400 mt-1">PNG أو JPG</p>
      </div>
    </div>
  );
}
