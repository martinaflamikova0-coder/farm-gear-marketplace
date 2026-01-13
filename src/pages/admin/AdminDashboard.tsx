import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Package, Plus, TrendingUp, Eye } from 'lucide-react';

interface Stats {
  totalProducts: number;
  activeProducts: number;
  draftProducts: number;
  soldProducts: number;
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    activeProducts: 0,
    draftProducts: 0,
    soldProducts: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: products, error } = await supabase
          .from('products')
          .select('status');

        if (error) throw error;

        const totalProducts = products?.length || 0;
        const activeProducts = products?.filter(p => p.status === 'active').length || 0;
        const draftProducts = products?.filter(p => p.status === 'draft').length || 0;
        const soldProducts = products?.filter(p => p.status === 'sold').length || 0;

        setStats({ totalProducts, activeProducts, draftProducts, soldProducts });
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
