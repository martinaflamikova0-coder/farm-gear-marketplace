import { useTranslation } from 'react-i18next';
import { useRef, useEffect, useState } from 'react';

const PromoVideoSection = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Lazy load: only render video when section scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Autoplay once video element is rendered
  useEffect(() => {
    if (isVisible && videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay blocked by browser, user can interact to play
      });
    }
  }, [isVisible]);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container-custom">
        <div className="text-center mb-6">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t('home.seeInAction', 'See Our Marketplace in Action')}
          </h2>
          <p className="text-muted-foreground">
            {t('home.videoSubtitle', 'Discover how easy it is to find your next equipment')}
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto" ref={containerRef}>
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-card" style={{ minHeight: '200px' }}>
            {isVisible ? (
              <video
                ref={videoRef}
                className="w-full h-auto max-h-[300px] md:max-h-[400px] object-cover"
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
              >
                <source src="/videos/promo-video.mp4" type="video/mp4" />
                <source src="/videos/promo-video.mov" type="video/quicktime" />
                {t('common.videoNotSupported', 'Your browser does not support the video tag.')}
              </video>
            ) : (
              <div className="w-full h-[200px] md:h-[300px] flex items-center justify-center">
                <div className="animate-pulse w-16 h-16 rounded-full bg-muted" />
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoVideoSection;
