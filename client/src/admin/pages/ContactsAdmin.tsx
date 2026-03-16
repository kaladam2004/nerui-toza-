import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../hooks/useApi';
import type { Contact } from '../../types';
import { AdminStyles } from './NewsAdmin';

export default function ContactsAdmin() {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Contact | null>(null);

  const { data: contacts } = useQuery<Contact[]>({ queryKey: ['admin-contacts'], queryFn: () => api.get('/admin/contacts').then(r => r.data) });
  const markRead = useMutation({ mutationFn: (id: number) => api.put(`/admin/contacts/${id}/read`), onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-contacts'] }) });
  const del = useMutation({ mutationFn: (id: number) => api.delete(`/admin/contacts/${id}`), onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-contacts'] }); setSelected(null); } });

  const subjectLabels: Record<string, string> = { general: 'Умумӣ', project: 'Лоиҳа', service: 'Хидмат', partnership: 'Ҳамкорӣ', other: 'Дигар' };

  return (
    <div>
      <h1 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 25 }}>Тамосҳо</h1>
      <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ background: '#f5f5f6' }}>
            <tr>{['Ном','Email','Мавзӯъ','Вазъ','Санаи воридшавӣ','Амал'].map(h => <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#546e7a', fontSize: '0.85rem' }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {contacts?.map(c => (
              <tr key={c.id} style={{ borderTop: '1px solid #f0f0f0', background: c.is_read ? 'white' : '#fff8e1' }}>
                <td style={{ padding: '14px 16px', fontWeight: c.is_read ? 400 : 700 }}>{c.name}</td>
                <td style={{ padding: '14px 16px', color: '#546e7a' }}>{c.email}</td>
                <td style={{ padding: '14px 16px', color: '#546e7a' }}>{subjectLabels[c.subject] || c.subject}</td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.78rem', fontWeight: 600, background: c.is_read ? '#e8f5e9' : '#fff3e0', color: c.is_read ? '#2e7d32' : '#e65100' }}>
                    {c.is_read ? 'Хонда шуд' : 'Нав'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px', color: '#78909c', fontSize: '0.85rem' }}>{new Date(c.created_at).toLocaleString()}</td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => { setSelected(c); if (!c.is_read) markRead.mutate(c.id); }} className="admin-btn-sm" style={{ background: '#1565c0' }}>Хондан</button>
                    <button onClick={() => { if (confirm('Ҳазф?')) del.mutate(c.id); }} className="admin-btn-sm" style={{ background: '#c62828' }}>Ҳазф</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal-box" style={{ maxWidth: 560 }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', color: '#1b5e20', marginBottom: 20 }}>Паём</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
              <div><strong>Ном:</strong> {selected.name}</div>
              <div><strong>Email:</strong> <a href={`mailto:${selected.email}`}>{selected.email}</a></div>
              {selected.phone && <div><strong>Телефон:</strong> {selected.phone}</div>}
              <div><strong>Мавзӯъ:</strong> {subjectLabels[selected.subject] || selected.subject}</div>
              <div><strong>Санаи воридшавӣ:</strong> {new Date(selected.created_at).toLocaleString()}</div>
            </div>
            <div style={{ background: '#f5f5f6', borderRadius: 12, padding: 20, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{selected.message}</div>
            <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <a href={`mailto:${selected.email}`} className="admin-btn" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>Ҷавоб дод</a>
              <button className="admin-btn-cancel" onClick={() => setSelected(null)}>Бастан</button>
            </div>
          </div>
        </div>
      )}
      <AdminStyles />
    </div>
  );
}
