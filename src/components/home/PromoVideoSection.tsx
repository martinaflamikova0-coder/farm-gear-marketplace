import { useTranslation } from 'react-i18next';
import { Play } from 'lucide-react';
import { useState } from 'react';

const PromoVideoSection = () => {
  const { t } = useTranslation();
  const [isPlaying, setIsPlaying] = useState(false);

  return (
    <section className="py-12 md:py-16 bg-gradient-to-b from-primary/5 to-transparent">
      <div className="container-custom">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            {t('home.seeInAction', 'See Our Marketplace in Action')}
          </h2>
          <p className="text-muted-foreground">
            {t('home.videoSubtitle', 'Discover how easy it is to find your next equipment')}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="relative rounded-2xl overflow-hidden shadow-2xl bg-card">
            <video
              src="/videos/promo-video.mov"
              className="w-full h-auto"
              controls={isPlaying}
              playsInline
              poster="/placeholder.svg"
              onClick={() => setIsPlaying(true)}
              onPlay={() => setIsPlaying(true)}
            >
              Your browser does not support the video tag.
            </video>
            
            {!isPlaying && (
              <button
                onClick={() => {
                  setIsPlaying(true);
                  const video = document.querySelector('video');
                  if (video) video.play();
                }}
                className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group cursor-pointer"
              >
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-primary/90 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                  <Play className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground ml-1" fill="currentColor" />
                </div>
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromoVideoSection;
