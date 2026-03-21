import { lazy, Suspense } from 'react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import BrandsMarquee from '@/components/home/BrandsMarquee';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PopularCategoriesLinks from '@/components/home/PopularCategoriesLinks';
import SEOHead from '@/components/SEOHead';
import HomeJsonLd from '@/components/HomeJsonLd';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load below-fold sections
const PremiumProducts = lazy(() => import('@/components/home/PremiumProducts'));
const PromoVideoSection = lazy(() => import('@/components/home/PromoVideoSection'));
const RobotMowersSection = lazy(() => import('@/components/home/RobotMowersSection'));
const SpecialProductSection = lazy(() => import('@/components/home/SpecialProductSection'));
const ProductsGrid = lazy(() => import('@/components/home/ProductsGrid'));
const TrustBar = lazy(() => import('@/components/home/TrustBar'));
const TestimonialsSection = lazy(() => import('@/components/home/TestimonialsSection'));

// Lazy load icons used only in below-fold sections
const LazyIcons = {
  Shovel: lazy(() => import('lucide-react').then(m => ({ default: m.Shovel }))),
  TreePine: lazy(() => import('lucide-react').then(m => ({ default: m.TreePine }))),
  Axe: lazy(() => import('lucide-react').then(m => ({ default: m.Axe }))),
  Wind: lazy(() => import('lucide-react').then(m => ({ default: m.Wind }))),
};

const SectionLoader = () => (
  <div className="py-8">
    <div className="container-custom">
      <Skeleton className="h-8 w-48 mb-6" />
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  </div>
);

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <SEOHead 
        titleKey="seo.home.title" 
        descriptionKey="seo.home.description"
        keywordsKey="seo.home.keywords"
      />
      <HomeJsonLd />
      <Header />
      <HeaderSpacer />
      <BrandsMarquee />
      
      <HeroBanner />
      
      <main className="flex-1">
        {/* 1. Featured / mise en avant — above fold priority */}
        <FeaturedProducts />
        <PopularCategoriesLinks />

        {/* 2+ Below fold — lazy loaded */}
        <Suspense fallback={<SectionLoader />}>
          <ProductsGrid titleKey="home.tractors" category="tracteurs" limit={12} />
        </Suspense>
        <div className="bg-card">
          <Suspense fallback={<SectionLoader />}>
            <ProductsGrid titleKey="home.harvestEquipment" category="recolte" limit={12} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionLoader />}>
          <ProductsGrid titleKey="home.constructionEquipment" category="chantier" limit={12} />
        </Suspense>
        <div className="bg-card">
          <Suspense fallback={<SectionLoader />}>
            <ProductsGrid titleKey="home.soilWork" category="travail-sol" limit={12} />
          </Suspense>
        </div>

        {/* 3. Vidéo promo */}
        <Suspense fallback={null}>
          <PromoVideoSection />
        </Suspense>

        {/* 4. Sections spécialisées */}
        <Suspense fallback={<SectionLoader />}>
          <SpecialProductSection
            titleKey="home.miniExcavators"
            subtitleKey="home.miniExcavatorsSubtitle"
            searchTerm="mini pelle"
            icon={LazyIcons.Shovel as any}
            iconColorClass="text-accent"
            bgClass=""
          />
        </Suspense>
        <div className="bg-card">
          <Suspense fallback={<SectionLoader />}>
            <RobotMowersSection />
          </Suspense>
        </div>
        <Suspense fallback={<SectionLoader />}>
          <SpecialProductSection
            titleKey="home.brushcutters"
            subtitleKey="home.brushcuttersSubtitle"
            searchTerm="débroussailleuse"
            icon={LazyIcons.TreePine as any}
            iconColorClass="text-success"
            bgClass=""
          />
        </Suspense>
        <div className="bg-card">
          <Suspense fallback={<SectionLoader />}>
            <SpecialProductSection
              titleKey="home.tillers"
              subtitleKey="home.tillersSubtitle"
              searchTerm="motoculteur"
              icon={LazyIcons.Axe as any}
              iconColorClass="text-primary"
              bgClass=""
            />
          </Suspense>
        </div>
        <Suspense fallback={<SectionLoader />}>
          <SpecialProductSection
            titleKey="home.blowers"
            subtitleKey="home.blowersSubtitle"
            searchTerm="souffleur"
            icon={LazyIcons.Wind as any}
            iconColorClass="text-accent"
            bgClass=""
          />
        </Suspense>

        {/* 5. Catégories restantes */}
        <div className="bg-card">
          <Suspense fallback={<SectionLoader />}>
            <ProductsGrid titleKey="home.handling" category="manutention" limit={12} />
          </Suspense>
        </div>
        <Suspense fallback={<SectionLoader />}>
          <ProductsGrid titleKey="home.partsAccessories" category="pieces" limit={12} />
        </Suspense>

        {/* 6. Premium */}
        <div className="bg-card">
          <Suspense fallback={<SectionLoader />}>
            <PremiumProducts />
          </Suspense>
        </div>

        {/* 7. Preuve sociale */}
        <Suspense fallback={null}>
          <TestimonialsSection />
        </Suspense>
      </main>
      
      <Suspense fallback={null}>
        <TrustBar />
      </Suspense>
      <Footer />
    </div>
  );
};

export default Index;
