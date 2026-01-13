import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/home/SearchBar';
import QuickCategories from '@/components/home/QuickCategories';
import BrandsMarquee from '@/components/home/BrandsMarquee';
import ProductsGrid from '@/components/home/ProductsGrid';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <BrandsMarquee />
      <SearchBar />
      <QuickCategories />
      
      <main className="flex-1">
        <ProductsGrid 
          titleKey="home.featuredListings"
          subtitleKey="home.featuredSubtitle"
          filterFn={(p) => p.filter(product => product.featured)}
          limit={4}
        />
        
        <div className="bg-card">
          <ProductsGrid 
            titleKey="home.recentListings"
            subtitleKey="home.recentSubtitle"
            filterFn={(p) => [...p].sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )}
            limit={8}
          />
        </div>

        <ProductsGrid 
          titleKey="home.tractors"
          filterFn={(p) => p.filter(product => product.category === 'Tracteurs')}
          limit={4}
        />

        <div className="bg-card">
          <ProductsGrid 
            titleKey="home.harvestEquipment"
            filterFn={(p) => p.filter(product => product.category === 'Matériel de récolte')}
            limit={4}
          />
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Index;