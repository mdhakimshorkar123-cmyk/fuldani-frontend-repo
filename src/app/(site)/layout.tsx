import { Navbar } from '@/components/site/Navbar';
import { Footer } from '@/components/site/Footer';
import { QuickCheckoutModal } from '@/components/site/QuickCheckoutModal';
import { SearchDialog } from '@/components/site/SearchDialog';

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="skip-link">
        প্রধান কনটেন্টে যান (Skip to content)
      </a>
      <Navbar />
      <main>{children}</main>
      <Footer />
      <QuickCheckoutModal />
      <SearchDialog />
    </>
  );
}
