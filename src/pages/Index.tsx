import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeaderSpacer from '@/components/layout/HeaderSpacer';
import SearchBar from '@/components/home/SearchBar';
import QuickCategories from '@/components/home/QuickCategories';
import BrandsMarquee from '@/components/home/BrandsMarquee';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import RecentProducts from '@/components/home/RecentProducts';
import PremiumProducts from '@/components/home/PremiumProducts';
import BestSellersSection from '@/components/home/BestSellersSection';
import BestSellersLinks from '@/components/home/BestSellersLinks';
import PopularCategoriesLinks from '@/components/home/PopularCategoriesLinks';
import VerifiedQualityBanner from '@/components/home/VerifiedQualityBanner';
import FastDealsBanner from '@/components/home/FastDealsBanner';
import GlobalNetworkBanner from '@/components/home/GlobalNetworkBanner';
import ShopPremiumBanner from '@/components/home/ShopPremiumBanner';
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
      
      {/* Hero Banner - Full width impact */}
      <HeroBanner />
      
      <SearchBar />
      <QuickCategories />
      
      <main className="flex-1">
        {/* Featured Products */}
        <FeaturedProducts />
        
        {/* Popular Categories Links - Internal SEO */}
        <PopularCategoriesLinks />
        
        {/* Best Sellers - Top 100 */}
        <BestSellersSection />
        
        {/* Top Bestsellers Quick Links - Internal SEO */}
        <BestSellersLinks />
        
        {/* Verified Quality Banner - Build trust early */}
        <VerifiedQualityBanner />
        
        {/* Premium Products */}
        <PremiumProducts />
        
        {/* Recent Products */}
        <div className="bg-card">
          <RecentProducts />
        </div>
        
        {/* Fast Deals Banner - Show speed advantage */}
        <FastDealsBanner />
        
        {/* Lawn Mowers Section */}
        <LawnMowersSection />
        
        {/* Tractors */}
        <ProductsGrid titleKey="home.tractors" category="tracteurs" limit={4} />
        
        {/* Promo Video - Engagement section */}
        <PromoVideoSection />
        
        {/* Harvest Equipment */}
        <div className="bg-card">
          <ProductsGrid titleKey="home.harvestEquipment" category="recolte" limit={4} />
        </div>
        
        {/* Global Network Banner - International credibility */}
        <GlobalNetworkBanner />
        
        {/* Construction Equipment */}
        <ProductsGrid titleKey="home.constructionEquipment" category="chantier" limit={4} />
        
        {/* Soil Work */}
        <div className="bg-card">
          <ProductsGrid titleKey="home.soilWork" category="travail-sol" limit={4} />
        </div>
        
        {/* Shop Premium Banner - Category showcase */}
        <ShopPremiumBanner />
        
        {/* Handling */}
        <ProductsGrid titleKey="home.handling" category="manutention" limit={4} />
        
        {/* Parts & Accessories */}
        <div className="bg-card">
          <ProductsGrid titleKey="home.partsAccessories" category="pieces" limit={4} />
        </div>
        
        {/* Testimonials */}
        <TestimonialsSection />
      </main>
      
      <TrustBar />
      <Footer />
    </div>
  );
};

export default Index;
