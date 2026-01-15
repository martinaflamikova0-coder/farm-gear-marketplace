import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, TrendingUp, Eye, AlertTriangle, PackageX } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Stats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  soldProducts: number;
}

interface LowStockProduct {
  id: string;
  title: string;
  stock: number;
  low_stock_threshold: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    soldProducts: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<LowStockProduct[]>([]);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all products with stock info
        const { data: products, error } = await supabase
          .from('products')
          .select('id, title, status, condition, stock, low_stock_threshold');

        if (error) throw error;

        const totalProducts = products?.length || 0;
        const activeProducts = products?.filter(p => p.status === 'active').length || 0;
        const draftProducts = products?.filter(p => p.status === 'draft').length || 0;
        const soldProducts = products?.filter(p => p.status === 'sold').length || 0;

        setStats({ totalProducts, activeProducts, draftProducts, soldProducts });

        // Find low stock products (new items with stock <= threshold)
        const lowStock = products?.filter(p => 
          p.condition === 'new' && 
          p.stock !== null && 
          p.low_stock_threshold !== null &&
          p.stock <= p.low_stock_threshold &&
          p.stock > 0 &&
          p.status === 'active'
        ).map(p => ({
          id: p.id,
          title: p.title,
          stock: p.stock!,
          low_stock_threshold: p.low_stock_threshold!,
        })) || [];
        
        setLowStockProducts(lowStock);

        // Count out of stock products
        const outOfStock = products?.filter(p => 
          p.condition === 'new' && 
          p.stock !== null && 
          p.stock === 0 &&
          p.status === 'active'
        ).length || 0;
        
        setOutOfStockCount(outOfStock);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Total Produits', 
      value: stats.totalProducts, 
      icon: Package,
      color: 'text-primary'
    },
    { 
      title: 'Actifs', 
      value: stats.activeProducts, 
      icon: Eye,
      color: 'text-green-600'
    },
    { 
      title: 'Brouillons', 
      value: stats.draftProducts, 
      icon: TrendingUp,
      color: 'text-yellow-600'
    },
    { 
      title: 'Vendus', 
      value: stats.soldProducts, 
      icon: TrendingUp,
      color: 'text-blue-600'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Vue d'ensemble de votre activité</p>
        </div>
        <Button asChild>
          <Link to="/admin/products/new">
            <Plus className="h-4 w-4 mr-2" />
            Nouveau produit
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {isLoading ? '...' : stat.value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stock Alerts */}
      {(lowStockProducts.length > 0 || outOfStockCount > 0) && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Alertes de stock
            </CardTitle>
            <CardDescription>Articles nécessitant votre attention</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {outOfStockCount > 0 && (
              <div className="flex items-center gap-3 p-3 bg-destructive/10 rounded-lg">
                <PackageX className="h-5 w-5 text-destructive" />
                <div className="flex-1">
                  <p className="font-medium text-destructive">
                    {outOfStockCount} article{outOfStockCount > 1 ? 's' : ''} en rupture de stock
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ces articles sont visibles mais affichent "Rupture de stock"
                  </p>
                </div>
              </div>
            )}
            
            {lowStockProducts.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Stock bas :</p>
                <div className="space-y-2">
                  {lowStockProducts.slice(0, 5).map((product) => (
                    <Link
                      key={product.id}
                      to={`/admin/products/${product.id}`}
                      className="flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <span className="text-sm truncate max-w-[200px] sm:max-w-none">
                        {product.title}
                      </span>
                      <Badge variant="outline" className="text-warning border-warning">
                        {product.stock} restant{product.stock > 1 ? 's' : ''}
                      </Badge>
                    </Link>
                  ))}
                  {lowStockProducts.length > 5 && (
                    <p className="text-sm text-muted-foreground text-center pt-2">
                      + {lowStockProducts.length - 5} autres articles
                    </p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
          <CardDescription>Accédez rapidement aux fonctionnalités principales</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button asChild variant="outline">
            <Link to="/admin/products">
              <Package className="h-4 w-4 mr-2" />
              Gérer les produits
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/admin/products/new">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un produit
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
