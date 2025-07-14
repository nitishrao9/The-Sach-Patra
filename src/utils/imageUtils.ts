// Utility functions for handling different image hosting platforms

/**
 * Converts various image hosting URLs to direct image URLs
 */
export const getDirectImageUrl = (url: string): string => {
  if (!url) return '';

  // Handle ImageBB URLs
  if (url.includes('ibb.co') || url.includes('imgbb.com')) {
    // ImageBB URLs are usually direct, but sometimes need conversion
    if (url.includes('/image/')) {
      // Convert from view URL to direct URL
      return url.replace('/image/', '/');
    }
    return url;
  }

  // Handle Imgur URLs
  if (url.includes('imgur.com')) {
    // Convert imgur gallery/view URLs to direct image URLs
    if (url.includes('/gallery/') || url.includes('/a/')) {
      const imageId = url.split('/').pop()?.split('.')[0];
      return `https://i.imgur.com/${imageId}.jpg`;
    }
    // If it's already a direct URL, return as is
    if (url.includes('i.imgur.com')) {
      return url;
    }
    // Convert regular imgur URL to direct
    const imageId = url.split('/').pop()?.split('.')[0];
    return `https://i.imgur.com/${imageId}.jpg`;
  }

  // Handle Google Drive URLs
  if (url.includes('drive.google.com')) {
    const fileId = url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (fileId) {
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
  }

  // Handle Dropbox URLs
  if (url.includes('dropbox.com')) {
    return url.replace('?dl=0', '?raw=1');
  }

  // Handle OneDrive URLs
  if (url.includes('1drv.ms') || url.includes('onedrive.live.com')) {
    return url.replace('?e=', '&download=1&e=');
  }

  // For other URLs, return as is
  return url;
};

/**
 * Validates if a URL is likely to be an image
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;

  // Check for common image extensions
  const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)(\?.*)?$/i;
  if (imageExtensions.test(url)) return true;

  // Check for known image hosting domains
  const imageHosts = [
    'imgur.com',
    'ibb.co',
    'imgbb.com',
    'unsplash.com',
    'pexels.com',
    'pixabay.com',
    'cloudinary.com',
    'amazonaws.com',
    'googleusercontent.com',
    'drive.google.com',
    'dropbox.com',
    'onedrive.live.com',
    '1drv.ms'
  ];

  return imageHosts.some(host => url.includes(host));
};

/**
 * Gets a fallback image URL based on category
 */
export const getFallbackImageUrl = (category?: string): string => {
  const fallbackImages = {
    'देश': 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=600&fit=crop&crop=center',
    'विदेश': 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=600&fit=crop&crop=center',
    'खेल': 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&h=600&fit=crop&crop=center',
    'मनोरंजन': 'https://images.unsplash.com/photo-1489599735734-79b4169c2a78?w=800&h=600&fit=crop&crop=center',
    'तकनीक': 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=800&h=600&fit=crop&crop=center',
    'व्यापार': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=600&fit=crop&crop=center',
    'विशेष': 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&h=600&fit=crop&crop=center',
    'default': 'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?w=800&h=600&fit=crop&crop=center'
  };

  return fallbackImages[category as keyof typeof fallbackImages] || fallbackImages.default;
};

/**
 * Check browser support for modern image formats
 */
export const supportsWebP = (): boolean => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
};

export const supportsAVIF = (): boolean => {
  if (typeof window === 'undefined') return false;
  const canvas = document.createElement('canvas');
  canvas.width = 1;
  canvas.height = 1;
  return canvas.toDataURL('image/avif').indexOf('data:image/avif') === 0;
};

/**
 * Get the best supported image format
 */
export const getBestImageFormat = (): 'avif' | 'webp' | 'jpg' => {
  if (supportsAVIF()) return 'avif';
  if (supportsWebP()) return 'webp';
  return 'jpg';
};

/**
 * Optimizes image URL for different screen sizes and formats
 */
export const getOptimizedImageUrl = (url: string, width: number = 800, height: number = 600): string => {
  const directUrl = getDirectImageUrl(url);
  const format = getBestImageFormat();

  // For Unsplash images, add optimization parameters
  if (directUrl.includes('unsplash.com')) {
    const separator = directUrl.includes('?') ? '&' : '?';
    return `${directUrl}${separator}w=${width}&h=${height}&fit=crop&crop=center&fm=${format}&q=80`;
  }

  // For Cloudinary images
  if (directUrl.includes('cloudinary.com')) {
    // Insert optimization parameters into Cloudinary URL
    const parts = directUrl.split('/upload/');
    if (parts.length === 2) {
      return `${parts[0]}/upload/w_${width},h_${height},c_fill,f_${format},q_auto/${parts[1]}`;
    }
  }

  // For other services, return the direct URL
  return directUrl;
};

/**
 * Generate responsive image srcset
 */
export const generateSrcSet = (url: string, sizes: number[] = [400, 800, 1200, 1600]): string => {
  const format = getBestImageFormat();
  const directUrl = getDirectImageUrl(url);

  if (directUrl.includes('unsplash.com')) {
    return sizes
      .map(size => `${getOptimizedImageUrl(url, size, Math.round(size * 0.75))} ${size}w`)
      .join(', ');
  }

  // For other services, return single size
  return `${directUrl} 1x`;
};

/**
 * Generate responsive image sizes attribute
 */
export const generateSizes = (breakpoints: { [key: string]: string } = {
  '(max-width: 640px)': '100vw',
  '(max-width: 1024px)': '50vw',
  default: '33vw'
}): string => {
  const entries = Object.entries(breakpoints);
  const mediaQueries = entries.slice(0, -1).map(([query, size]) => `${query} ${size}`);
  const defaultSize = breakpoints.default || '100vw';

  return [...mediaQueries, defaultSize].join(', ');
};

/**
 * Preloads an image to check if it's valid
 */
export const preloadImage = (src: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = getDirectImageUrl(src);
  });
};

/**
 * Create a picture element with multiple format support
 */
export const createPictureElement = (
  url: string,
  alt: string,
  width: number = 800,
  height: number = 600,
  className: string = ''
): string => {
  const directUrl = getDirectImageUrl(url);
  const avifUrl = getOptimizedImageUrl(url, width, height).replace(/fm=\w+/, 'fm=avif');
  const webpUrl = getOptimizedImageUrl(url, width, height).replace(/fm=\w+/, 'fm=webp');
  const jpegUrl = getOptimizedImageUrl(url, width, height).replace(/fm=\w+/, 'fm=jpg');

  return `
    <picture>
      <source srcset="${avifUrl}" type="image/avif">
      <source srcset="${webpUrl}" type="image/webp">
      <img src="${jpegUrl}" alt="${alt}" width="${width}" height="${height}" class="${className}" loading="lazy">
    </picture>
  `;
};
