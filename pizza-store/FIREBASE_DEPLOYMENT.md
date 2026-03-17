# Firebase Deployment Instructions

## Step 1: Update Environment Variables
1. Open `.env.production` in frontend folder
2. Replace `https://your-backend-url.onrender.com/api` with your actual backend URL
3. Example: `REACT_APP_API_URL=https://your-pizza-backend.onrender.com/api`

## Step 2: Update Firebase Project ID
1. Open `.firebaserc` in frontend folder
2. Replace `your-firebase-project-id` with your actual Firebase project ID

## Step 3: Build and Deploy
```bash
# In frontend folder
npm run build

# Login to Firebase (first time only)
firebase login

# Initialize Firebase (if not done)
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## Step 4: Backend Deployment
Deploy your backend to Render/Heroku/Railway:
- Upload backend folder
- Set environment variables from .env file
- Get the deployment URL
- Update REACT_APP_API_URL in .env.production

## Your Live App
After deployment: `https://your-project-id.web.app`