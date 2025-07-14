import React from 'react';
import { AdBanner } from './AdBanner';
import { Advertisement } from '@/types';
import { useAds } from '@/hooks/useFirebaseData';

interface AdContainerProps {
  position: Advertisement['position'];
  category?: string;
  className?: string;
  maxAds?: number;
}

export const AdContainer: React.FC<AdContainerProps> = ({
  position,
  category,
  className = '',
  maxAds = 1
}) => {
  const { ads, loading, error } = useAds(position, category);

  // Debug logging
  console.log(`AdContainer - Position: ${position}, Category: ${category}, Ads found: ${ads.length}`);
  if (ads.length > 0) {
    console.log('Ads data:', ads);
    ads.forEach(ad => {
      console.log(`Ad ${ad.id}: ${ad.title} - Position: ${ad.position} - Active: ${ad.isActive} - Start: ${ad.startDate.toLocaleDateString()} - End: ${ad.endDate.toLocaleDateString()}`);
    });
  } else {
    console.log(`No ads found for position ${position} and category ${category}`);
  }

  if (loading) {
    return (
      <div className={`ad-container ${className}`}>
        <div className="text-xs text-gray-700 mb-2 text-center font-semibold uppercase tracking-wide border-b border-gray-200 pb-1">
          Sponsored
        </div>
        <div className="animate-pulse bg-gray-200 rounded-lg w-full h-20 sm:h-24 md:h-28"></div>
      </div>
    );
  }

  if (error) {
    console.error('Error loading ads:', error);
    return null;
  }

  if (ads.length === 0) {
    console.log(`No ads found for position: ${position}, category: ${category}`);
    return null; // Hide completely if no ads
  }

  // Randomize and limit ads
  const shuffled = [...ads].sort(() => 0.5 - Math.random());
  const displayAds = shuffled.slice(0, maxAds);

  // Get size classes based on position - full width ads with auto height to preserve aspect ratio
  const getSizeClasses = (position: Advertisement['position']) => {
    switch (position) {
      case 'header':
        return 'w-full max-w-full'; // Full width banner with auto height
      case 'top':
        return 'w-full max-w-full'; // Full width banner with auto height
      case 'sidebar':
        return 'w-full max-w-full'; // Full width in sidebar container
      case 'content':
        return 'w-full max-w-full'; // Full width banner with auto height
      case 'footer':
        return 'w-full max-w-full'; // Full width banner with auto height
      default:
        return 'w-full max-w-full'; // Full width default with auto height
    }
  };

  const sizeClasses = getSizeClasses(position);

  return (
    <div className={`ad-container ${className}`}>
      <div className="text-xs text-gray-700 mb-2 text-center font-semibold uppercase tracking-wide border-b border-gray-200 pb-1">
        Sponsored
      </div>
      {displayAds.map((ad) => (
        <AdBanner
          key={ad.id}
          ad={ad}
          className="mb-3 sm:mb-4"
          sizeClasses={sizeClasses}
        />
      ))}
    </div>
  );
};
