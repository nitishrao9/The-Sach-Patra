# Firestore Index Deployment

To deploy the Firestore indexes for the comment system and news queries, follow these steps:

## Prerequisites
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize Firebase in your project: `firebase init firestore`

## Deploy Indexes
Run the following command in your project root:

```bash
firebase deploy --only firestore:indexes
```

## Manual Index Creation (Alternative)
If the automatic deployment doesn't work, you can create indexes manually in the Firebase Console:

### For Comments Collection:
1. Go to Firebase Console > Firestore Database > Indexes
2. Create a composite index for `comments` collection with fields:
   - `articleId` (Ascending)
   - `approved` (Ascending) 
   - `createdAt` (Descending)

### For News Collection:
1. Create a composite index for `news` collection with fields:
   - `status` (Ascending)
   - `createdAt` (Descending)

2. Create another composite index for `news` collection with fields:
   - `category` (Ascending)
   - `status` (Ascending)
   - `createdAt` (Descending)

## Troubleshooting
- If you see index errors in the console, the indexes are being created automatically
- Wait 5-10 minutes for indexes to build
- Check Firebase Console > Firestore Database > Indexes for build status
