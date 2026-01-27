import { useTranslation } from 'react-i18next';
import { useRef, useEffect } from 'react';

const PromoVideoSection = () => {
  const { t } = useTranslation();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Attempt autoplay when component mounts
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay failed, likely due to browser restrictions
        // Video will play when user scrolls it into view or interacts
      });
    }
  }, []);

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
        
        <div className="max-w-3xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-card">
            <video
              ref={videoRef}
              className="w-full h-auto max-h-[300px] md:max-h-[400px] object-cover"
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
            >
              {/* MP4 for broad compatibility, MOV as fallback for Safari */}
              <source src="/videos/promo-video.mp4" type="video/mp4" />
              <source src="/videos/promo-video.mov" type="video/quicktime" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoVideoSection;
