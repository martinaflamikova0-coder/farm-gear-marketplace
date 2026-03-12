import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeaderSpacer from '@/components/layout/HeaderSpacer';

import BrandsMarquee from '@/components/home/BrandsMarquee';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import RecentProducts from '@/components/home/RecentProducts';
import PremiumProducts from '@/components/home/PremiumProducts';
import BestSellersSection from '@/components/home/BestSellersSection';
import LatestProductsSection from '@/components/home/LatestProductsSection';
import PopularCategoriesLinks from '@/components/home/PopularCategoriesLinks';
import VerifiedQualityBanner from '@/components/home/VerifiedQualityBanner';
import PromoVideoSection from '@/components/home/PromoVideoSection';
import LawnMowersSection from '@/components/home/LawnMowersSection';
import ProductsGrid from '@/components/home/ProductsGrid';
import TrustBar from '@/components/home/TrustBar';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import SEOHead from '@/components/SEOHead';
import HomeJsonLd from '@/components/HomeJsonLd';

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
        <FeaturedProducts />
        <PopularCategoriesLinks />
        <BestSellersSection />
        <LatestProductsSection />
        <VerifiedQualityBanner />
        <PremiumProducts />
        <div className="bg-card">
          <RecentProducts />
        </div>
        <LawnMowersSection />
        <ProductsGrid titleKey="home.tractors" category="tracteurs" limit={4} />
        <PromoVideoSection />
        <div className="bg-card">
          <ProductsGrid titleKey="home.harvestEquipment" category="recolte" limit={4} />
        </div>
        <ProductsGrid titleKey="home.constructionEquipment" category="chantier" limit={4} />
        <div className="bg-card">
          <ProductsGrid titleKey="home.soilWork" category="travail-sol" limit={4} />
        </div>
        <ProductsGrid titleKey="home.handling" category="manutention" limit={4} />
        <div className="bg-card">
          <ProductsGrid titleKey="home.partsAccessories" category="pieces" limit={4} />
        </div>
        <TestimonialsSection />
      </main>
      
      <TrustBar />
      <Footer />
    </div>
  );
};

export default Index;
