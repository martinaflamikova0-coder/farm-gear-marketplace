import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { categories } from '@/data/products';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery);
    if (selectedCategory) params.set('category', selectedCategory);
    navigate(`/annonces?${params.toString()}`);
  };

  return (
    <div className="bg-card border-b border-border sticky top-[73px] z-40">
      <div className="container-custom py-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher un tracteur, une marque, un modèle..."
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px] h-11">
              <SelectValue placeholder="Catégorie" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes catégories</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.icon} {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" variant="accent" className="h-11 px-6">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            className="h-11"
            onClick={() => navigate('/annonces')}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres avancés
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;
