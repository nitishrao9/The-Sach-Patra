// User types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  role: 'admin' | 'editor';
  roleLevel: 1 | 2; // 1 = admin, 2 = editor
  createdAt: Date;
  updatedAt: Date;
}

// Role level mapping
export const ROLE_LEVELS = {
  admin: 1,
  editor: 2
} as const;

export const LEVEL_ROLES = {
  1: 'admin',
  2: 'editor'
} as const;

// News article types
export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  state?: string; // For state-specific news (used with national category)
  imageUrl: string;
  additionalImages?: string[]; // Additional images for the article
  videoUrl?: string;
  relatedLinks?: RelatedLink[]; // Related links within the article
  author: string;
  publishedAt: string;
  createdAt: Date;
  updatedAt: Date;
  featured?: boolean;
  commentsCount?: number;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
}

// Related link interface for articles
export interface RelatedLink {
  id: string;
  title: string;
  url: string;
  description?: string;
}

// Comment interface for articles
export interface Comment {
  id: string;
  articleId: string;
  name: string;
  email: string;
  comment: string;
  createdAt: Date;
  approved: boolean; // For moderation
}

// Advertisement types
export interface Advertisement {
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: 'header' | 'sidebar' | 'content' | 'footer' | 'top';
  category?: string; // For category-specific ads
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
  clickCount: number;
  impressionCount: number;
}

// Video types
export interface Video {
  id: string;
  title: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: string;
  publishedAt: string;
  createdAt: Date;
  updatedAt: Date;
}

// Gallery image types
export interface GalleryImage {
  id: string;
  imageUrl: string;
  caption: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tag types
export interface Tag {
  id: string;
  name: string;
  count: number;
}

// Breaking news types
export interface BreakingNews {
  id: string;
  title: string;
  isActive: boolean;
  priority: number; // Higher number = higher priority
  createdAt: Date;
  updatedAt: Date;
}

// Pagination types
export interface PaginationData<T> {
  items: T[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
