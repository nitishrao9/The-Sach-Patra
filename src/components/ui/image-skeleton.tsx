import React, { useState, useEffect } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { getDirectImageUrl, getFallbackImageUrl, getOptimizedImageUrl, generateSrcSet, generateSizes } from '@/utils/imageUtils';

interface ImageWithSkeletonProps {
  src: string;
  alt: string;
  className?: string;
  aspectRatio?: 'square' | 'video' | 'portrait' | 'landscape';
  fallbackSrc?: string;
  category?: string;
  width?: number;
  height?: number;
}

export const ImageWithSkeleton: React.FC<ImageWithSkeletonProps> = ({
  src,
  alt,
  className = '',
  aspectRatio = 'landscape',
  fallbackSrc,
  category,
  width = 800,
  height = 600
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [imgSrc, setImgSrc] = useState('');

  // Initialize image source with optimizations
  useEffect(() => {
    if (src) {
      const optimizedSrc = getOptimizedImageUrl(src, width, height);
      setImgSrc(optimizedSrc);
      setLoading(true);
      setError(false);
    }
  }, [src, width, height]);

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'square': return 'aspect-square';
      case 'video': return 'aspect-video';
      case 'portrait': return 'aspect-[3/4]';
      case 'landscape': return 'aspect-[4/3]';
      default: return 'aspect-[4/3]';
    }
  };

  const handleLoad = () => {
    setLoading(false);
  };

  const handleError = () => {
    if (!error) {
      setError(true);
      const fallback = fallbackSrc || getFallbackImageUrl(category);
      const optimizedFallback = getOptimizedImageUrl(fallback, width, height);
      setImgSrc(optimizedFallback);
    } else {
      setLoading(false);
    }
  };

  return (
    <div className={`relative overflow-hidden ${getAspectRatioClass()} ${className}`}>
      {loading && (
        <Skeleton 
          height="100%" 
          width="100%" 
          className="absolute inset-0"
          baseColor="#f3f4f6"
          highlightColor="#e5e7eb"
        />
      )}
      <img
        src={imgSrc}
        srcSet={generateSrcSet(src)}
        sizes={generateSizes()}
        alt={alt}
        width={width}
        height={height}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          loading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};

// Skeleton for news cards
export const NewsCardSkeleton: React.FC = () => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Skeleton height={200} />
      <div className="p-4 space-y-3">
        <Skeleton height={20} width="60%" />
        <Skeleton height={16} count={2} />
        <div className="flex justify-between items-center">
          <Skeleton height={14} width="40%" />
          <Skeleton height={14} width="30%" />
        </div>
      </div>
    </div>
  );
};

// Skeleton for horizontal news cards
export const NewsCardHorizontalSkeleton: React.FC = () => {
  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="sm:col-span-1">
          <Skeleton height={150} />
        </div>
        <div className="p-3 sm:p-4 sm:col-span-2 space-y-2">
          <Skeleton height={18} width="80%" />
          <Skeleton height={14} count={2} />
          <div className="flex justify-between items-center">
            <Skeleton height={12} width="30%" />
            <Skeleton height={12} width="25%" />
          </div>
        </div>
      </div>
    </div>
  );
};

// Skeleton for article detail page
export const ArticleDetailSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* Category and Date */}
      <div className="flex items-center gap-3">
        <Skeleton height={24} width={80} />
        <Skeleton height={16} width={120} />
      </div>
      
      {/* Title */}
      <Skeleton height={32} count={2} />
      
      {/* Author */}
      <div className="flex items-center gap-3">
        <Skeleton circle height={40} width={40} />
        <div>
          <Skeleton height={16} width={120} />
          <Skeleton height={14} width={80} />
        </div>
      </div>
      
      {/* Featured Image */}
      <Skeleton height={400} />
      
      {/* Content */}
      <div className="space-y-3">
        <Skeleton height={16} count={8} />
        <Skeleton height={16} width="60%" />
      </div>
      
      {/* Tags */}
      <div className="flex gap-2">
        <Skeleton height={24} width={60} />
        <Skeleton height={24} width={80} />
        <Skeleton height={24} width={70} />
      </div>
    </div>
  );
};
