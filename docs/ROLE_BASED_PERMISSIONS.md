# Role-Based Permissions System

## Overview

The news application now implements a role-based permissions system that restricts editors to only edit and delete their own articles, while admins retain full access to all articles.

## User Roles

### Admin (Role Level 1)
- **Full Access**: Can view, edit, and delete all articles regardless of who created them
- **User Management**: Can manage other users and their roles
- **System Administration**: Access to migration tools and system settings
- **Article Creation**: Can create new articles

### Editor (Role Level 2)
- **Limited Access**: Can only edit and delete articles they created
- **Article Creation**: Can create new articles
- **View Access**: Can view all articles but cannot modify others' articles
- **No User Management**: Cannot access user management features

## Technical Implementation

### Database Schema Changes

A new field `createdBy` has been added to the `news` collection:

```typescript
interface NewsArticle {
  // ... existing fields
  createdBy?: string; // User ID of the creator
}
```

### Permission Logic

The system uses the following logic to determine edit/delete permissions:

```typescript
const canEditArticle = (article: NewsArticle) => {
  // Admins can edit any article
  if (currentUser?.role === 'admin') {
    return true;
  }
  
  // Editors can only edit their own articles
  if (currentUser?.role === 'editor') {
    return article.createdBy === currentUser.id;
  }
  
  return false;
};
```

### UI Changes

1. **Action Buttons**: Edit and Delete buttons are only shown for articles the user has permission to modify
2. **Visual Indicators**: Articles created by the current user show "(You)" next to the author name
3. **Filter Option**: Editors have a "My Articles Only" toggle to filter their own articles
4. **Error Handling**: Appropriate error messages when users try to access restricted content

## Migration

### For Existing Installations

1. **Access Migration Tool**: Admins can access the migration tool at `/admin/migration`
2. **Run Migration**: Click "Run Migration" to add the `createdBy` field to existing articles
3. **Assign Ownership**: Existing articles without ownership will need manual assignment

### Migration Process

The migration tool:
- Adds `createdBy` field to all existing articles
- Skips articles that already have the field
- Provides detailed results of the migration process
- Is only accessible to admin users

## Usage Examples

### For Editors

1. **Creating Articles**: New articles automatically assign the creator's ID
2. **Viewing Articles**: Can see all articles but only edit/delete their own
3. **Filtering**: Use "My Articles Only" toggle to see only your articles
4. **Visual Cues**: Your articles show "(You)" next to your name

### For Admins

1. **Full Access**: Can edit/delete any article regardless of creator
2. **User Management**: Can manage user roles and permissions
3. **Migration**: Can run database migrations when needed
4. **System Oversight**: Can see all articles and their creators

## Security Considerations

1. **Server-Side Validation**: All permissions are enforced on the server side
2. **UI Restrictions**: Client-side restrictions prevent accidental access attempts
3. **Error Handling**: Clear error messages for permission violations
4. **Audit Trail**: Article ownership is tracked for accountability

## Troubleshooting

### Common Issues

1. **Missing Edit/Delete Buttons**: 
   - Check if you're the article creator
   - Verify your user role
   - Ensure migration has been run

2. **Permission Denied Errors**:
   - Confirm you have the correct role
   - Check if the article belongs to you
   - Contact admin if you believe there's an error

3. **Migration Issues**:
   - Only admins can run migrations
   - Backup database before running migration
   - Contact technical support if migration fails

### Support

For technical issues or questions about the role-based permissions system, contact the system administrator or refer to the application logs for detailed error information.
