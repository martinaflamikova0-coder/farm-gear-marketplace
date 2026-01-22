import { useTranslation } from 'react-i18next';
import { Star, Quote, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useFeaturedTestimonials } from '@/hooks/useTestimonials';

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const { data: testimonials = [], isLoading } = useFeaturedTestimonials();

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container-custom">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.slice(0, 6).map((testimonial, index) => (
            <Card 
              key={testimonial.id} 
              className="hover-lift border-border bg-card overflow-hidden"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-6 flex flex-col h-full">
                <div className="flex items-center gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < testimonial.rating
                          ? 'fill-warning text-warning'
                          : 'fill-muted text-muted-foreground/30'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex-1 relative">
                  <Quote className="absolute -top-1 -left-1 h-8 w-8 text-primary/10" />
                  <p className="text-foreground leading-relaxed pl-6">
                    "{testimonial.content}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border">
                  <p className="font-semibold text-foreground">
                    {testimonial.author_name}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                    {testimonial.author_company && (
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3" />
                        {testimonial.author_company}
                      </span>
                    )}
                    {testimonial.author_location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {testimonial.author_location}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
