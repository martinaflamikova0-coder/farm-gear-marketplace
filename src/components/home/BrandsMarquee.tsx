import johnDeere from '@/assets/brands/john-deere.png';
import fendt from '@/assets/brands/fendt.png';
import masseyFerguson from '@/assets/brands/massey-ferguson.png';
import newHolland from '@/assets/brands/new-holland.jpeg';
import claas from '@/assets/brands/claas.png';
import caseIh from '@/assets/brands/case-ih.png';
import deutzFahr from '@/assets/brands/deutz-fahr.png';
import kubota from '@/assets/brands/kubota.png';
import mccormick from '@/assets/brands/mccormick.jpeg';
import sonalika from '@/assets/brands/sonalika.jpeg';

interface Brand {
  name: string;
  logo: string;
}

const brands: Brand[] = [
  { name: 'John Deere', logo: johnDeere },
  { name: 'Fendt', logo: fendt },
  { name: 'Massey Ferguson', logo: masseyFerguson },
  { name: 'New Holland', logo: newHolland },
  { name: 'Claas', logo: claas },
  { name: 'Case IH', logo: caseIh },
  { name: 'Deutz-Fahr', logo: deutzFahr },
  { name: 'Kubota', logo: kubota },
  { name: 'McCormick', logo: mccormick },
  { name: 'Sonalika', logo: sonalika },
];

const BrandsMarquee = () => {
  // Double the brands array for seamless infinite scroll
  const allBrands = [...brands, ...brands];

  return (
    <div className="bg-card border-y border-border overflow-hidden py-2 w-full">
      <div className="flex animate-marquee w-max">
        {allBrands.map((brand, index) => (
          <div
            key={`brand-${index}`}
            className="flex items-center justify-center mx-4 md:mx-6 flex-shrink-0"
          >
            <img
              src={brand.logo}
              alt={brand.name}
              className="h-5 md:h-6 w-auto object-contain grayscale hover:grayscale-0 transition-all duration-300 opacity-50 hover:opacity-100"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default BrandsMarquee;
