import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import LanguageSwitcher from '../common/LanguageSwitcher';
import PartnersCarousel from '../PartnersCarousel';

export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <PartnersCarousel />
      <Footer />
      <LanguageSwitcher />
    </>
  );
}
