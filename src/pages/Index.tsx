import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/home/SearchBar';
import QuickCategories from '@/components/home/QuickCategories';
import BrandsMarquee from '@/components/home/BrandsMarquee';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import RecentProducts from '@/components/home/RecentProducts';
import ProductsGrid from '@/components/home/ProductsGrid';
import TrustBar from '@/components/home/TrustBar';
import SEOHead from '@/components/SEOHead';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <SEOHead 
        titleKey="seo.home.title" 
        descriptionKey="seo.home.description" 
      />
      <Header />
      <BrandsMarquee />
      <TrustBar />
      <SearchBar />
      <QuickCategories />
      
      <main className="flex-1">
        <FeaturedProducts />
        
        <div className="bg-card">
          <RecentProducts />
        </div>

        <ProductsGrid 
          titleKey="home.tractors"
          category="tracteurs"
          limit={4}
        />

        <div className="bg-card">
          <ProductsGrid 
            titleKey="home.harvestEquipment"
            category="recolte"
            limit={4}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;
