import { type Component, createSignal, Show } from 'solid-js';
import { Upload, X } from 'lucide-solid';

const API_BASE = '/api';

interface ImageUploadProps {
  onUpload: (urls: string[]) => void;
  existingUrls?: string[];
}

const ImageUpload: Component<ImageUploadProps> = (props) => {
  const [uploading, setUploading] = createSignal(false);
  const [previews, setPreviews] = createSignal<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = createSignal<string[]>(props.existingUrls || []);

  const handleFileChange = async (e: Event) => {
    const input = e.currentTarget as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const newUrls: string[] = [];
    const newPreviews: string[] = [];

    for (const file of Array.from(files)) {
      newPreviews.push(URL.createObjectURL(file));

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await fetch(`${API_BASE}/files/upload`, {
          method: 'POST',
          body: formData,
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          newUrls.push(data.url || data.fileUrl || '');
        }
      } catch { /* ignore */ }
    }

    setPreviews(prev => [...prev, ...newPreviews]);
    const allUrls = [...uploadedUrls(), ...newUrls.filter(Boolean)];
    setUploadedUrls(allUrls);
    props.onUpload(allUrls);
    setUploading(false);
  };

  return (
    <div class="w-full">
      <div class="flex flex-wrap gap-2 mb-2">
        <Show when={uploadedUrls().length > 0}>
          {uploadedUrls().map((url, i) => (
            <div class="relative w-16 h-16 rounded overflow-hidden bg-[var(--color-surface-alt)]">
              <img src={url} alt="" class="w-full h-full object-cover" />
              <button
                onClick={() => {
                  const filtered = uploadedUrls().filter((_, j) => j !== i);
                  setUploadedUrls(filtered);
                  props.onUpload(filtered);
                }}
                class="absolute top-0 right-0 p-0.5 bg-black/60 rounded-bl"
              >
                <X size={10} class="text-white" />
              </button>
            </div>
          ))}
        </Show>
        <label class="w-16 h-16 rounded border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors" style={{ 'border-color': 'var(--color-border)' }}>
          <input type="file" accept="image/*" multiple onChange={handleFileChange} class="hidden" disabled={uploading()} />
          <Show when={!uploading()} fallback={<div class="eq-spinner w-4 h-4" />}>
            <Upload size={16} style={{ color: 'var(--color-text-muted)' }} />
          </Show>
        </label>
      </div>
      <p class="text-xs eq-text-muted">Formatos: JPG, PNG, GIF. Máx 5MB cada.</p>
    </div>
  );
};

export default ImageUpload;
