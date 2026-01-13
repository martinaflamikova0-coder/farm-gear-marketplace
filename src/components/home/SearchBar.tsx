import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
import { getLocalizedSlug, type SupportedLanguage } from '@/i18n';

const SearchBar = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { lang } = useParams<{ lang: string }>();
  const currentLang = (lang || i18n.language || 'en') as SupportedLanguage;

  const getCategoryName = (category: typeof categories[0]) => {
    const categoryMap: Record<string, string> = {
      'Tracteurs': t('categories.tractors'),
      'Matériel de récolte': t('categories.harvest'),
      'Travail du sol': t('categories.tillage'),
      'Matériel d\'élevage': t('categories.livestock'),
      'Manutention': t('categories.handling'),
      'Matériel de chantier': t('categories.construction'),
      'Pièces et accessoires': t('categories.parts'),
      'Autres matériels': t('categories.other')
    };
    return categoryMap[category.name] || category.name;
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const listingsSlug = getLocalizedSlug('listings', currentLang);
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    navigate(`/${currentLang}/${listingsSlug}?${params.toString()}`);
  };

  return (
    <div className="bg-card border-b border-border sticky top-[73px] z-40">
      <div className="container-custom py-4">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t('common.searchPlaceholder')}
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-[200px] h-11">
              <SelectValue placeholder={t('filters.category')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('common.allCategories')}</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.slug}>
                  {category.icon} {getCategoryName(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button type="submit" variant="accent" className="h-11 px-6">
            <Search className="h-4 w-4 mr-2" />
            {t('common.search')}
          </Button>

          <Button 
            type="button" 
            variant="outline" 
            className="h-11"
            onClick={() => navigate(`/${currentLang}/${getLocalizedSlug('listings', currentLang)}`)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            {t('filters.advancedFilters')}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default SearchBar;