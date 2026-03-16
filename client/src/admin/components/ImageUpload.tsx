import { useRef, useState } from 'react';
import api from '../../hooks/useApi';

interface Props {
  value: string;
  onChange: (url: string) => void;
  placeholder?: string;
}

export default function ImageUpload({ value, onChange, placeholder = 'https://...' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const { data } = await api.post('/admin/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      onChange(data.url);
    } catch {
      alert('Хатогӣ ҳангоми бор кардани акс');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ flex: 1, padding: '11px 14px', border: '2px solid #e0e0e0', borderRadius: 8, fontFamily: 'Montserrat, sans-serif', fontSize: '0.9rem', outline: 'none', color: '#263238' }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          style={{ padding: '11px 16px', background: uploading ? '#ccc' : '#1565c0', color: 'white', border: 'none', borderRadius: 8, cursor: uploading ? 'not-allowed' : 'pointer', fontFamily: 'Montserrat, sans-serif', fontWeight: 600, fontSize: '0.85rem', whiteSpace: 'nowrap' }}
        >
          {uploading ? '⏳' : '📁 Бор кун'}
        </button>
      </div>
      <input ref={inputRef} type="file" accept="image/*,video/*" style={{ display: 'none' }} onChange={handleFile} />
      {value && (
        <img src={value} alt="" style={{ height: 60, width: 100, objectFit: 'cover', borderRadius: 6, border: '1px solid #e0e0e0' }} />
      )}
    </div>
  );
}
