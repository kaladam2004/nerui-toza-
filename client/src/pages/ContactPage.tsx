import { useTranslation } from 'react-i18next';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faPhone, faEnvelope, faClock, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import api from '../hooks/useApi';
import type { Settings, ContactForm } from '../types';
import PageHero from '../components/common/PageHero';

export default function ContactPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language.substring(0, 2) as 'tg' | 'ru' | 'en';

  const { data: settings } = useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => api.get('/settings').then(r => r.data),
    staleTime: 1000 * 60 * 10,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ContactForm>();

  const mutation = useMutation({
    mutationFn: (data: ContactForm) => api.post('/contacts', data),
    onSuccess: () => { reset(); alert(t('contact.success')); },
    onError: () => alert(t('contact.error')),
  });

  const subjects = ['general', 'project', 'service', 'partnership', 'other'];

  return (
    <>
      <PageHero pageKey="contact_hero" fallbackImage="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=2000&q=80">
        <div className="container">
          <div className="hero-content">
            <h1>{t('contact.title')}</h1>
            <p>{t('contact.subtitle')}</p>
          </div>
        </div>
      </PageHero>

      <section className="section">
        <div className="container">
          <div className="contact-layout">
            {/* Info */}
            <div className="contact-info-block">
              <div className="info-card">
                <div className="info-icon"><FontAwesomeIcon icon={faMapMarkerAlt} /></div>
                <div><h4>{t('contact.address')}</h4><p>{settings?.[`address_${lang}`] || '734025, Душанбе, кӯчаи А. Сино, 29/2'}</p></div>
              </div>
              <div className="info-card">
                <div className="info-icon"><FontAwesomeIcon icon={faPhone} /></div>
                <div><h4>{t('contact.phone_label')}</h4><p>{settings?.phone_primary || '+992 93 564 20 20'}</p></div>
              </div>
              <div className="info-card">
                <div className="info-icon"><FontAwesomeIcon icon={faEnvelope} /></div>
                <div><h4>{t('contact.email_label')}</h4><p>{settings?.email_primary || 'neruitoza@gmail.com'}</p></div>
              </div>
              <div className="info-card">
                <div className="info-icon"><FontAwesomeIcon icon={faClock} /></div>
                <div><h4>{t('contact.hours')}</h4><p>{settings?.[`working_hours_${lang}`] || 'Душанбе-Ҷумъа: 8:00 - 18:00'}</p></div>
              </div>
            </div>

            {/* Form */}
            <form className="contact-form" onSubmit={handleSubmit(d => mutation.mutate(d))}>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('contact.name')} *</label>
                  <input {...register('name', { required: true })} placeholder={t('contact.name')} className={errors.name ? 'error' : ''} />
                </div>
                <div className="form-group">
                  <label>{t('contact.email')} *</label>
                  <input type="email" {...register('email', { required: true })} placeholder={t('contact.email')} className={errors.email ? 'error' : ''} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>{t('contact.phone')}</label>
                  <input type="tel" {...register('phone')} placeholder={t('contact.phone')} />
                </div>
                <div className="form-group">
                  <label>{t('contact.subject')} *</label>
                  <select {...register('subject', { required: true })} className={errors.subject ? 'error' : ''}>
                    <option value="">{t('contact.subject')}</option>
                    {subjects.map(s => <option key={s} value={s}>{t(`contact.subject_${s}`)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>{t('contact.message')} *</label>
                <textarea {...register('message', { required: true })} rows={6} placeholder={t('contact.message')} className={errors.message ? 'error' : ''} />
              </div>
              <button type="submit" className="btn" disabled={mutation.isPending}>
                {mutation.isPending ? t('common.loading') : <><FontAwesomeIcon icon={faPaperPlane} /> {t('contact.send')}</>}
              </button>
            </form>
          </div>
        </div>
      </section>

      <style>{`
        .contact-layout { display: grid; grid-template-columns: 1fr 1.6fr; gap: 60px; align-items: start; }
        .info-card { display: flex; gap: 20px; align-items: flex-start; margin-bottom: 30px; }
        .info-icon { width: 50px; height: 50px; background: linear-gradient(135deg, var(--primary), var(--accent)); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.2rem; flex-shrink: 0; }
        .info-card h4 { color: var(--primary-dark); margin-bottom: 5px; font-size: 1rem; }
        .info-card p { color: var(--text-light); }
        .contact-form { background: var(--white); border-radius: 20px; padding: 40px; box-shadow: var(--shadow); }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .form-group { display: flex; flex-direction: column; margin-bottom: 20px; }
        .form-group label { font-weight: 600; margin-bottom: 8px; color: var(--text); font-size: 0.95rem; }
        .form-group input, .form-group select, .form-group textarea {
          padding: 14px 18px; border: 2px solid #e0e0e0; border-radius: 10px;
          font-family: 'Montserrat', sans-serif; font-size: 0.95rem; transition: var(--transition); outline: none; color: var(--text);
        }
        .form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(46,125,50,.1); }
        .form-group input.error, .form-group select.error, .form-group textarea.error { border-color: #e53e3e; }
        .form-group textarea { resize: vertical; }
        @media (max-width: 900px) { .contact-layout { grid-template-columns: 1fr; } .form-row { grid-template-columns: 1fr; } }
      `}</style>
    </>
  );
}
