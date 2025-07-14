# News Website with Admin Panel

A modern news website built with React, TypeScript, Vite, and Firebase. Features include role-based admin panel, advertisement management, pagination, and responsive design.

## Features

### Public Features
- 📰 News articles with categories (देश, विदेश, खेल, मनोरंजन, तकनीक, व्यापार, विशेष)
- 🔍 Category-wise news browsing with pagination (20 items per page)
- 📱 Responsive design for mobile and desktop
- 🎯 Advertisement display on home page and category pages
- 🏷️ Trending tags and featured articles
- 📸 Photo gallery and video sections

### Admin Panel Features
- 🔐 Firebase Authentication with role-based access control
- 👥 User management (Admin, Editor, User roles)
- 📝 News article management (CRUD operations)
- 📢 Advertisement management with analytics
- 📊 Dashboard with statistics
- 🎨 Modern UI with shadcn/ui components

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui
- **Backend**: Firebase (Authentication, Firestore, Storage)
- **State Management**: React Context API
- **Routing**: React Router DOM
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Firebase project

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd NEWS2
```

2. **Install dependencies**
```bash
npm install
```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Authentication (Email/Password)
   - Create Firestore database
   - Enable Storage (optional, for image uploads)

4. **Configure Firebase**
   - Copy your Firebase config from Project Settings
   - Update `src/lib/firebase.ts` with your configuration

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

5. **Start the development server**
```bash
npm run dev
```

6. **Access Admin Panel**
   - Navigate to `/admin/login`
   - Use the demo accounts to test different role levels

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── admin/          # Admin panel components
│   ├── ads/            # Advertisement components
│   ├── auth/           # Authentication components
│   ├── layout/         # Layout components
│   ├── news/           # News-related components
│   └── ui/             # shadcn/ui components
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── lib/                # Utilities and configurations
├── pages/              # Page components
│   ├── admin/          # Admin panel pages
│   └── ...             # Public pages
├── services/           # Firebase services
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## User Roles & Demo Accounts

### Admin (Level 1)
- **Email:** admin@news.com
- **Password:** admin123
- **Access:** Full system access, user management, system settings, database setup

### Editor (Level 2)
- **Email:** editor@news.com
- **Password:** editor123
- **Access:** Create, edit, and publish articles, manage advertisements, access to analytics

### User (Level 3)
- **Email:** user@news.com
- **Password:** user123
- **Access:** Basic read access, comment on articles (if implemented)

> **Note:** These demo accounts are automatically created when you run the database initialization.

## API Routes

### Public Routes
- `/` - Home page
- `/news/:id` - Article detail
- `/category/:category` - Category page
- `/about` - About page

### Admin Routes (Protected)
- `/admin` - Dashboard
- `/admin/login` - Login page
- `/admin/register` - Registration page
- `/admin/news` - News management
- `/admin/ads` - Advertisement management
- `/admin/users` - User management (Admin only)

## Firebase Collections

### news
```typescript
{
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  imageUrl: string;
  author: string;
  publishedAt: string;
  featured: boolean;
  status: 'draft' | 'published' | 'archived';
  tags: string[];
  commentsCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### advertisements
```typescript
{
  id: string;
  title: string;
  imageUrl: string;
  linkUrl: string;
  position: 'header' | 'sidebar' | 'content' | 'footer' | 'top';
  category?: string;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  clickCount: number;
  impressionCount: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### users
```typescript
{
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'editor';
  roleLevel: 1 | 2; // 1 = admin, 2 = editor
  createdAt: Date;
  updatedAt: Date;
}
```

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint
```

## Deployment

### Firebase Hosting (Recommended)

1. **Install Firebase CLI**
```bash
npm install -g firebase-tools
```

2. **Login to Firebase**
```bash
firebase login
```

3. **Initialize Firebase Hosting**
```bash
firebase init hosting
```

4. **Build and Deploy**
```bash
npm run build
firebase deploy
```

### Other Hosting Options
- Vercel
- Netlify
- GitHub Pages

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email support@newswebsite.com or create an issue in the repository.

## Acknowledgments

- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Firebase](https://firebase.google.com/) for backend services
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Lucide](https://lucide.dev/) for icons

```shell
pnpm i
```

**Start Preview**

```shell
pnpm run dev
```

**To build**

```shell
pnpm run build
```
