import { Package, Users, MapPin } from 'lucide-react';

const StatsBar = () => {
  const stats = [
    { icon: Package, value: '995', label: 'annonces' },
    { icon: Users, value: '200+', label: 'vendeurs' },
    { icon: MapPin, value: '95', label: 'départements' },
  ];

  return (
    <div className="bg-primary text-primary-foreground">
      <div className="container-custom py-2">
        <div className="flex justify-center items-center gap-8 text-sm">
          {stats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2">
              <stat.icon className="h-4 w-4 opacity-80" />
              <span className="font-semibold">{stat.value}</span>
              <span className="opacity-80">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatsBar;
