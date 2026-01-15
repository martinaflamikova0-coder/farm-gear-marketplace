import { useEffect } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Index from '@/pages/Index';
import Annonces from '@/pages/Annonces';
import AnnonceDetail from '@/pages/AnnonceDetail';
import About from '@/pages/About';
import HowItWorks from '@/pages/HowItWorks';
import FAQ from '@/pages/FAQ';
import Contact from '@/pages/Contact';
import Terms from '@/pages/Terms';
import Privacy from '@/pages/Privacy';
import Cookies from '@/pages/Cookies';
import NotFound from '@/pages/NotFound';
import Auth from '@/pages/Auth';
import Cart from '@/pages/Cart';
import Checkout from '@/pages/Checkout';
import Account from '@/pages/Account';
import AdminLogin from '@/pages/admin/AdminLogin';
import AdminResetPassword from '@/pages/admin/AdminResetPassword';
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProducts from '@/pages/admin/AdminProducts';
import AdminProductForm from '@/pages/admin/AdminProductForm';
import AdminCategories from '@/pages/admin/AdminCategories';
import { SUPPORTED_LANGUAGES, getLocalizedSlug, type SupportedLanguage } from '@/i18n';

// Wrapper component that syncs URL language with i18n
const LanguageWrapper = ({ children }: { children: React.ReactNode }) => {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (lang && SUPPORTED_LANGUAGES.includes(lang as SupportedLanguage)) {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
      }
    }
  }, [lang, i18n]);

  return <>{children}</>;
};

// Component to handle dynamic slug routes for listings
const ListingsRoute = () => {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  
  // Check if URL matches any localized slug for 'listings'
  const pathParts = location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    const urlSlug = pathParts[1];
    const expectedSlug = getLocalizedSlug('listings', lang as SupportedLanguage);
    
    if (urlSlug !== expectedSlug) {
      // Redirect to correct slug for this language
      return <Navigate to={`/${lang}/${expectedSlug}${location.search}`} replace />;
    }
  }
  
  return <Annonces />;
};

const ListingDetailRoute = () => {
  const { lang } = useParams<{ lang: string }>();
  const location = useLocation();
  
  const pathParts = location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    const urlSlug = pathParts[1];
    const expectedSlug = getLocalizedSlug('listing', lang as SupportedLanguage);
    
    if (urlSlug !== expectedSlug) {
      const id = pathParts[2] || '';
      return <Navigate to={`/${lang}/${expectedSlug}/${id}${location.search}`} replace />;
    }
  }
  
  return <AnnonceDetail />;
};

const LocalizedRoutes = () => {
  const { i18n } = useTranslation();
  
  // Get default language (browser detection or fallback to 'en')
  const getDefaultLanguage = (): SupportedLanguage => {
    const stored = localStorage.getItem('i18nextLng');
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
    
    const browserLang = navigator.language.split('-')[0];
    if (SUPPORTED_LANGUAGES.includes(browserLang as SupportedLanguage)) {
      return browserLang as SupportedLanguage;
    }
    
    return 'en';
  };

  const defaultLang = getDefaultLanguage();

  return (
    <Routes>
      {/* Redirect root to default language */}
      <Route path="/" element={<Navigate to={`/${defaultLang}`} replace />} />
      
      {/* Language-prefixed routes */}
      <Route path="/:lang" element={<LanguageWrapper><Index /></LanguageWrapper>} />
      
      {/* Static pages */}
      <Route path="/:lang/about" element={<LanguageWrapper><About /></LanguageWrapper>} />
      <Route path="/:lang/how-it-works" element={<LanguageWrapper><HowItWorks /></LanguageWrapper>} />
      <Route path="/:lang/faq" element={<LanguageWrapper><FAQ /></LanguageWrapper>} />
      <Route path="/:lang/contact" element={<LanguageWrapper><Contact /></LanguageWrapper>} />
      <Route path="/:lang/terms" element={<LanguageWrapper><Terms /></LanguageWrapper>} />
      <Route path="/:lang/privacy" element={<LanguageWrapper><Privacy /></LanguageWrapper>} />
      <Route path="/:lang/cookies" element={<LanguageWrapper><Cookies /></LanguageWrapper>} />
      
      {/* Auth & Cart routes */}
      <Route path="/:lang/auth" element={<LanguageWrapper><Auth /></LanguageWrapper>} />
      <Route path="/:lang/panier" element={<LanguageWrapper><Cart /></LanguageWrapper>} />
      <Route path="/:lang/cart" element={<LanguageWrapper><Cart /></LanguageWrapper>} />
      <Route path="/:lang/checkout" element={<LanguageWrapper><Checkout /></LanguageWrapper>} />
      <Route path="/:lang/compte" element={<LanguageWrapper><Account /></LanguageWrapper>} />
      <Route path="/:lang/account" element={<LanguageWrapper><Account /></LanguageWrapper>} />
      
      {/* Listings routes with localized slugs */}
      <Route path="/:lang/listings" element={<LanguageWrapper><ListingsRoute /></LanguageWrapper>} />
      <Route path="/:lang/annonces" element={<LanguageWrapper><ListingsRoute /></LanguageWrapper>} />
      <Route path="/:lang/anzeigen" element={<LanguageWrapper><ListingsRoute /></LanguageWrapper>} />
      <Route path="/:lang/anuncios" element={<LanguageWrapper><ListingsRoute /></LanguageWrapper>} />
      <Route path="/:lang/annunci" element={<LanguageWrapper><ListingsRoute /></LanguageWrapper>} />
      
      {/* Listing detail routes with localized slugs */}
      <Route path="/:lang/listing/:id" element={<LanguageWrapper><ListingDetailRoute /></LanguageWrapper>} />
      <Route path="/:lang/annonce/:id" element={<LanguageWrapper><ListingDetailRoute /></LanguageWrapper>} />
      <Route path="/:lang/anzeige/:id" element={<LanguageWrapper><ListingDetailRoute /></LanguageWrapper>} />
      <Route path="/:lang/anuncio/:id" element={<LanguageWrapper><ListingDetailRoute /></LanguageWrapper>} />
      <Route path="/:lang/annuncio/:id" element={<LanguageWrapper><ListingDetailRoute /></LanguageWrapper>} />
      
      {/* Legacy routes - redirect to localized versions */}
      <Route path="/annonces" element={<Navigate to={`/${defaultLang}/${getLocalizedSlug('listings', defaultLang)}`} replace />} />
      <Route path="/annonce/:id" element={<Navigate to={`/${defaultLang}/${getLocalizedSlug('listing', defaultLang)}/:id`} replace />} />
      
      {/* Admin routes - completely separate from public site */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/admin/reset-password" element={<AdminResetPassword />} />
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id" element={<AdminProductForm />} />
        <Route path="categories" element={<AdminCategories />} />
      </Route>

      {/* Catch-all 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default LocalizedRoutes;
