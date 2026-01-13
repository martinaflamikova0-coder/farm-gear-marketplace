import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import SearchBar from '@/components/home/SearchBar';
import QuickCategories from '@/components/home/QuickCategories';
import StatsBar from '@/components/home/StatsBar';
import ProductsGrid from '@/components/home/ProductsGrid';
import { products } from '@/data/products';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <StatsBar />
      <SearchBar />
      <QuickCategories />
      
      <main className="flex-1">
        <ProductsGrid 
          title="⭐ Annonces en vedette"
          subtitle="Nos meilleures opportunités du moment"
          filterFn={(p) => p.filter(product => product.featured)}
          limit={4}
        />
        
        <div className="bg-card">
          <ProductsGrid 
            title="🕐 Dernières annonces"
            subtitle="Les plus récentes"
            filterFn={(p) => [...p].sort((a, b) => 
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            )}
            limit={8}
          />
        </div>

        <ProductsGrid 
          title="🚜 Tracteurs"
          filterFn={(p) => p.filter(product => product.category === 'Tracteurs')}
          limit={4}
        />

        <div className="bg-card">
          <ProductsGrid 
            title="🌾 Matériel de récolte"
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
