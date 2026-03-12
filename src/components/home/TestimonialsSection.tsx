import { useTranslation } from 'react-i18next';
import { Star, Quote, MapPin, Building2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useFeaturedTestimonials } from '@/hooks/useTestimonials';
import { useState, useCallback } from 'react';

const TestimonialsSection = () => {
  const { t } = useTranslation();
  const { data: testimonials = [], isLoading } = useFeaturedTestimonials();
  const [page, setPage] = useState(0);
  const perPage = 6;
  const totalPages = Math.ceil(testimonials.length / perPage);

  const nextPage = useCallback(() => setPage(p => Math.min(p + 1, totalPages - 1)), [totalPages]);
  const prevPage = useCallback(() => setPage(p => Math.max(p - 1, 0)), []);

  const visibleTestimonials = testimonials.slice(page * perPage, (page + 1) * perPage);

  if (isLoading) {
    return (
      <section className="py-16 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="container-custom">
          <div className="text-center mb-12">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
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
          {visibleTestimonials.map((testimonial, index) => (
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
                  <p className="text-foreground leading-relaxed pl-6 text-sm">
                    "{testimonial.content}"
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-border flex items-center gap-3">
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={testimonial.author_avatar_url || undefined} alt={testimonial.author_name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                      {testimonial.author_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {testimonial.author_name}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      {testimonial.author_company && (
                        <span className="flex items-center gap-1 truncate">
                          <Building2 className="h-3 w-3 shrink-0" />
                          {testimonial.author_company}
                        </span>
                      )}
                      {testimonial.author_location && (
                        <span className="flex items-center gap-1 truncate">
                          <MapPin className="h-3 w-3 shrink-0" />
                          {testimonial.author_location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevPage}
              disabled={page === 0}
              className="rounded-full"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-muted-foreground">
              {page + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              onClick={nextPage}
              disabled={page === totalPages - 1}
              className="rounded-full"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default TestimonialsSection;
