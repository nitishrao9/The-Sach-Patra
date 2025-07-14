import React from 'react';
import { Advertisement } from '@/types';
import { useFirebaseCRUD } from '@/hooks/useFirebaseData';

interface AdBannerProps {
  ad: Advertisement;
  className?: string;
  sizeClasses?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ ad, className = '', sizeClasses = '' }) => {
  const { trackAdClick, trackAdImpression } = useFirebaseCRUD();

  const handleClick = async () => {
    // Track click in Firebase
    await trackAdClick(ad.id);

    // Open link
    if (ad.linkUrl) {
      window.open(ad.linkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleImpression = async () => {
    // Track impression in Firebase
    await trackAdImpression(ad.id);
  };

  React.useEffect(() => {
    handleImpression();
  }, [ad.id]);

  // Note: Date and active filtering is already handled in useAds hook

  return (
    <div className={`ad-banner ${className} ${sizeClasses}`}>
      <div
        className="cursor-pointer transition-all duration-300 hover:shadow-lg rounded-lg shadow-sm overflow-hidden"
        onClick={handleClick}
      >
        <img
          src={ad.imageUrl}
          alt={ad.title}
          className="w-full h-auto object-contain max-w-full rounded-lg"
          loading="lazy"
          style={{ aspectRatio: 'auto' }}
        />
      </div>

      {/* Title removed - only show image */}
    </div>
  );
};
