import { useState } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useBrands } from '@/hooks/useBrands';

interface BrandComboboxProps {
  value: string;
  onChange: (value: string) => void;
  categoryId?: string;
  placeholder?: string;
}

const BrandCombobox = ({ value, onChange, categoryId, placeholder = "Rechercher une marque..." }: BrandComboboxProps) => {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const { data: brands = [], isLoading } = useBrands(categoryId);

  // Allow typing a custom brand that's not in the list
  const handleSelect = (brandName: string) => {
    onChange(brandName);
    setOpen(false);
  };

  const handleInputChange = (search: string) => {
    setInputValue(search);
  };

  // Filter brands based on input
  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Check if input matches exactly any brand
  const exactMatch = brands.some(
    brand => brand.name.toLowerCase() === inputValue.toLowerCase()
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal"
        >
          {value || placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder={placeholder}
            value={inputValue}
            onValueChange={handleInputChange}
          />
          <CommandList>
            {isLoading ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                Chargement...
              </div>
            ) : (
              <>
                <CommandEmpty>
                  {inputValue && !exactMatch ? (
                    <button
                      className="flex w-full items-center gap-2 px-2 py-3 text-sm hover:bg-accent cursor-pointer"
                      onClick={() => handleSelect(inputValue)}
                    >
                      <Plus className="h-4 w-4" />
                      Utiliser "{inputValue}"
                    </button>
                  ) : (
                    <span className="py-6 text-center text-sm">Aucune marque trouvée</span>
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {filteredBrands.map((brand) => (
                    <CommandItem
                      key={brand.id}
                      value={brand.name}
                      onSelect={() => handleSelect(brand.name)}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          value === brand.name ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {brand.name}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default BrandCombobox;
