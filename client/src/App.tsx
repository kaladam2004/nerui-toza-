import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/layout/Layout';
import './i18n';
import './styles/globals.css';

// Public pages (lazy-loaded)
const HomePage       = lazy(() => import('./pages/HomePage'));
const AboutPage      = lazy(() => import('./pages/AboutPage'));
const ProjectsPage   = lazy(() => import('./pages/ProjectsPage'));
const ServicesPage   = lazy(() => import('./pages/ServicesPage'));
const ContactPage    = lazy(() => import('./pages/ContactPage'));
const NewsPage       = lazy(() => import('./pages/NewsPage'));
const CalculatorPage = lazy(() => import('./pages/CalculatorPage'));

// Admin (lazy-loaded)
const AdminLogin    = lazy(() => import('./admin/AdminLogin'));
const AdminLayout   = lazy(() => import('./admin/AdminLayout'));
const Dashboard     = lazy(() => import('./admin/pages/Dashboard'));
const NewsAdmin     = lazy(() => import('./admin/pages/NewsAdmin'));
const ProjectsAdmin = lazy(() => import('./admin/pages/ProjectsAdmin'));
const ContactsAdmin = lazy(() => import('./admin/pages/ContactsAdmin'));
const SettingsAdmin = lazy(() => import('./admin/pages/SettingsAdmin'));
const ServicesAdmin = lazy(() => import('./admin/pages/ServicesAdmin'));
const TeamAdmin     = lazy(() => import('./admin/pages/TeamAdmin'));
const MarkersAdmin  = lazy(() => import('./admin/pages/MarkersAdmin'));
const PartnersAdmin    = lazy(() => import('./admin/pages/PartnersAdmin'));
const TimelineAdmin    = lazy(() => import('./admin/pages/TimelineAdmin'));
const CalculatorAdmin  = lazy(() => import('./admin/pages/CalculatorAdmin'));
const BackgroundsAdmin = lazy(() => import('./admin/pages/BackgroundsAdmin'));
const ProfileAdmin     = lazy(() => import('./admin/pages/ProfileAdmin'));

const qc = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 1000 * 60 * 5 } },
});

function RequireAuth({ children }: { children: React.ReactNode }) {
  const token = sessionStorage.getItem('accessToken');
  if (!token) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

const Loading = () => (
  <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center', color: '#78909c' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🌿</div>
      <p style={{ fontFamily: 'Montserrat, sans-serif' }}>Бор мешавад...</p>
    </div>
  </div>
);

export default function App() {
  return (
    <QueryClientProvider client={qc}>
      <BrowserRouter>
        <Suspense fallback={<Loading />}>
          <Routes>
            {/* ── Public routes ── */}
            <Route element={<Layout />}>
              <Route path="/"           element={<HomePage />} />
              <Route path="/about"      element={<AboutPage />} />
              <Route path="/projects"   element={<ProjectsPage />} />
              <Route path="/services"   element={<ServicesPage />} />
              <Route path="/news"       element={<NewsPage />} />
              <Route path="/calculator" element={<CalculatorPage />} />
              <Route path="/contact"    element={<ContactPage />} />
            </Route>

            {/* ── Admin routes ── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
              <Route index             element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard"  element={<Dashboard />} />
              <Route path="news"       element={<NewsAdmin />} />
              <Route path="projects"   element={<ProjectsAdmin />} />
              <Route path="contacts"   element={<ContactsAdmin />} />
              <Route path="services"   element={<ServicesAdmin />} />
              <Route path="team"       element={<TeamAdmin />} />
              <Route path="partners"     element={<PartnersAdmin />} />
              <Route path="timeline"     element={<TimelineAdmin />} />
              <Route path="calculator"   element={<CalculatorAdmin />} />
              <Route path="backgrounds"  element={<BackgroundsAdmin />} />
              <Route path="markers"      element={<MarkersAdmin />} />
              <Route path="settings"     element={<SettingsAdmin />} />
              <Route path="profile"      element={<ProfileAdmin />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
