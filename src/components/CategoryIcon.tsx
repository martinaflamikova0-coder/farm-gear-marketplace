import { Tractor, Wheat, Cog, Fence, Container, Wrench, Settings, Package, type LucideProps } from 'lucide-react';

const iconMap: Record<string, React.ComponentType<LucideProps>> = {
  Tractor,
  Wheat,
  Cog,
  Fence,
  Container,
  Wrench,
  Settings,
  Package,
};

interface CategoryIconProps extends LucideProps {
  name: string;
}

const CategoryIcon = ({ name, ...props }: CategoryIconProps) => {
  const IconComponent = iconMap[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};

export default CategoryIcon;
