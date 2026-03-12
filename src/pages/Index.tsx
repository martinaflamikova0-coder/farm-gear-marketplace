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

import PromoVideoSection from '@/components/home/PromoVideoSection';
import LawnMowersSection from '@/components/home/LawnMowersSection';
import RobotMowersSection from '@/components/home/RobotMowersSection';
import SpecialProductSection from '@/components/home/SpecialProductSection';
import ProductsGrid from '@/components/home/ProductsGrid';
import TrustBar from '@/components/home/TrustBar';
import TestimonialsSection from '@/components/home/TestimonialsSection';
import SEOHead from '@/components/SEOHead';
import HomeJsonLd from '@/components/HomeJsonLd';
import { Shovel, TreePine, Axe, Wind } from 'lucide-react';

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
        
        <PremiumProducts />
        <div className="bg-card">
          <RecentProducts />
        </div>
        <LawnMowersSection />
        <RobotMowersSection />
        <ProductsGrid titleKey="home.tractors" category="tracteurs" limit={10} />
        <PromoVideoSection />
        <div className="bg-card">
          <ProductsGrid titleKey="home.harvestEquipment" category="recolte" limit={10} />
        </div>
        <SpecialProductSection
          titleKey="home.miniExcavators"
          subtitleKey="home.miniExcavatorsSubtitle"
          searchTerm="mini pelle"
          icon={Shovel}
          iconColorClass="text-accent"
          bgClass=""
        />
        <div className="bg-card">
          <SpecialProductSection
            titleKey="home.brushcutters"
            subtitleKey="home.brushcuttersSubtitle"
            searchTerm="débroussailleuse"
            icon={TreePine}
            iconColorClass="text-success"
            bgClass=""
          />
        </div>
        <SpecialProductSection
          titleKey="home.tillers"
          subtitleKey="home.tillersSubtitle"
          searchTerm="motoculteur"
          icon={Axe}
          iconColorClass="text-primary"
          bgClass=""
        />
        <ProductsGrid titleKey="home.constructionEquipment" category="chantier" limit={10} />
        <div className="bg-card">
          <ProductsGrid titleKey="home.soilWork" category="travail-sol" limit={10} />
        </div>
        <div className="bg-card">
          <SpecialProductSection
            titleKey="home.blowers"
            subtitleKey="home.blowersSubtitle"
            searchTerm="souffleur"
            icon={Wind}
            iconColorClass="text-accent"
            bgClass=""
          />
        </div>
        <ProductsGrid titleKey="home.handling" category="manutention" limit={10} />
        <div className="bg-card">
          <ProductsGrid titleKey="home.partsAccessories" category="pieces" limit={10} />
        </div>
        <TestimonialsSection />
      </main>
      
      <TrustBar />
      <Footer />
    </div>
  );
};

export default Index;
