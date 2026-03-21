import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LANGUAGES, getLocalizedSlug, type SupportedLanguage } from '@/i18n';

// Critical path — loaded eagerly
import Index from '@/pages/Index';

// Lazy-loaded pages
const Annonces = lazy(() => import('@/pages/Annonces'));
const AnnonceDetail = lazy(() => import('@/pages/AnnonceDetail'));
const About = lazy(() => import('@/pages/About'));
const Categories = lazy(() => import('@/pages/Categories'));
const HowItWorks = lazy(() => import('@/pages/HowItWorks'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Contact = lazy(() => import('@/pages/Contact'));
const Terms = lazy(() => import('@/pages/Terms'));
const PurchaseTerms = lazy(() => import('@/pages/PurchaseTerms'));
const Privacy = lazy(() => import('@/pages/Privacy'));
const Cookies = lazy(() => import('@/pages/Cookies'));
const Returns = lazy(() => import('@/pages/Returns'));
const RefundPolicy = lazy(() => import('@/pages/RefundPolicy'));
const LegalNotice = lazy(() => import('@/pages/LegalNotice'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Auth = lazy(() => import('@/pages/Auth'));
const Cart = lazy(() => import('@/pages/Cart'));
const Checkout = lazy(() => import('@/pages/Checkout'));
const OrderConfirmation = lazy(() => import('@/pages/OrderConfirmation'));
const Account = lazy(() => import('@/pages/Account'));

// Admin — lazy loaded (never needed on public pages)
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const AdminResetPassword = lazy(() => import('@/pages/admin/AdminResetPassword'));
const AdminLayout = lazy(() => import('@/pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminOrders = lazy(() => import('@/pages/admin/AdminOrders'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('@/pages/admin/AdminProductForm'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminBrands = lazy(() => import('@/pages/admin/AdminBrands'));
const AdminBankAccounts = lazy(() => import('@/pages/admin/AdminBankAccounts'));
const AdminCustomers = lazy(() => import('@/pages/admin/AdminCustomers'));
const AdminPaypalSettings = lazy(() => import('@/pages/admin/AdminPaypalSettings'));
const AdminPromotions = lazy(() => import('@/pages/admin/AdminPromotions'));
const AdminShippingZones = lazy(() => import('@/pages/admin/AdminShippingZones'));
const AdminMerchantCenter = lazy(() => import('@/pages/admin/AdminMerchantCenter'));
const AdminImport = lazy(() => import('@/pages/admin/AdminImport'));

// Minimal loading fallback
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

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
  
  const pathParts = location.pathname.split('/').filter(Boolean);
  if (pathParts.length >= 2) {
    const urlSlug = pathParts[1];
    const expectedSlug = getLocalizedSlug('listings', lang as SupportedLanguage);
    
    if (urlSlug !== expectedSlug) {
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
  
  const getDefaultLanguage = (): SupportedLanguage => {
    const stored = localStorage.getItem('ekiptrade-lang');
    if (stored && SUPPORTED_LANGUAGES.includes(stored as SupportedLanguage)) {
      return stored as SupportedLanguage;
    }
    return 'it';
  };

  const defaultLang = getDefaultLanguage();

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/" element={<Navigate to={`/${defaultLang}`} replace />} />
        
        {/* Homepage — eagerly loaded */}
        <Route path="/:lang" element={<LanguageWrapper><Index /></LanguageWrapper>} />
        
        {/* Static pages */}
        <Route path="/:lang/about" element={<LanguageWrapper><About /></LanguageWrapper>} />
        <Route path="/:lang/categories" element={<LanguageWrapper><Categories /></LanguageWrapper>} />
        <Route path="/:lang/how-it-works" element={<LanguageWrapper><HowItWorks /></LanguageWrapper>} />
        <Route path="/:lang/faq" element={<LanguageWrapper><FAQ /></LanguageWrapper>} />
        <Route path="/:lang/contact" element={<LanguageWrapper><Contact /></LanguageWrapper>} />
        <Route path="/:lang/terms" element={<LanguageWrapper><Terms /></LanguageWrapper>} />
        <Route path="/:lang/purchase-terms" element={<LanguageWrapper><PurchaseTerms /></LanguageWrapper>} />
        <Route path="/:lang/privacy" element={<LanguageWrapper><Privacy /></LanguageWrapper>} />
        <Route path="/:lang/cookies" element={<LanguageWrapper><Cookies /></LanguageWrapper>} />
        <Route path="/:lang/returns" element={<LanguageWrapper><Returns /></LanguageWrapper>} />
        <Route path="/:lang/refund-policy" element={<LanguageWrapper><RefundPolicy /></LanguageWrapper>} />
        <Route path="/:lang/legal-notice" element={<LanguageWrapper><LegalNotice /></LanguageWrapper>} />
        
        {/* Auth & Cart */}
        <Route path="/:lang/auth" element={<LanguageWrapper><Auth /></LanguageWrapper>} />
        <Route path="/:lang/panier" element={<LanguageWrapper><Cart /></LanguageWrapper>} />
        <Route path="/:lang/cart" element={<LanguageWrapper><Cart /></LanguageWrapper>} />
        <Route path="/:lang/checkout" element={<LanguageWrapper><Checkout /></LanguageWrapper>} />
        <Route path="/:lang/order-confirmation" element={<LanguageWrapper><OrderConfirmation /></LanguageWrapper>} />
        <Route path="/:lang/compte" element={<LanguageWrapper><Account /></LanguageWrapper>} />
        <Route path="/:lang/account" element={<LanguageWrapper><Account /></LanguageWrapper>} />
        
        {/* Listings */}
        <Route path="/:lang/listings" element={<LanguageWrapper><ListingsRoute /></LanguageWrapper>} />
        <Route path="/:lang/annonces" element={<LanguageWrapper><ListingsRoute /></LanguageWrapper>} />
        <Route path="/:lang/anzeigen" element={<LanguageWrapper><ListingsRoute /></LanguageWrapper>} />
        <Route path="/:lang/anuncios" element={<LanguageWrapper><ListingsRoute /></LanguageWrapper>} />
        <Route path="/:lang/annunci" element={<LanguageWrapper><ListingsRoute /></LanguageWrapper>} />
        
        {/* Listing detail */}
        <Route path="/:lang/listing/:id" element={<LanguageWrapper><ListingDetailRoute /></LanguageWrapper>} />
        <Route path="/:lang/annonce/:id" element={<LanguageWrapper><ListingDetailRoute /></LanguageWrapper>} />
        <Route path="/:lang/anzeige/:id" element={<LanguageWrapper><ListingDetailRoute /></LanguageWrapper>} />
        <Route path="/:lang/anuncio/:id" element={<LanguageWrapper><ListingDetailRoute /></LanguageWrapper>} />
        <Route path="/:lang/annuncio/:id" element={<LanguageWrapper><ListingDetailRoute /></LanguageWrapper>} />
        
        {/* Legacy */}
        <Route path="/annonces" element={<Navigate to={`/${defaultLang}/${getLocalizedSlug('listings', defaultLang)}`} replace />} />
        <Route path="/annonce/:id" element={<Navigate to={`/${defaultLang}/${getLocalizedSlug('listing', defaultLang)}/:id`} replace />} />
        
        {/* Admin */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/reset-password" element={<AdminResetPassword />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="brands" element={<AdminBrands />} />
          <Route path="customers" element={<AdminCustomers />} />
          <Route path="bank-accounts" element={<AdminBankAccounts />} />
          <Route path="paypal" element={<AdminPaypalSettings />} />
          <Route path="promotions" element={<AdminPromotions />} />
          <Route path="shipping-zones" element={<AdminShippingZones />} />
          <Route path="merchant-center" element={<AdminMerchantCenter />} />
          <Route path="import" element={<AdminImport />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
};

export default LocalizedRoutes;
