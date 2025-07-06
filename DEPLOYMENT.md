# Deployment Guide for Render

## Prerequisites

1. **MongoDB Database**: You'll need a MongoDB database. You can use:
   - MongoDB Atlas (free tier available)
   - Or any other MongoDB provider

2. **GitHub Repository**: Your code should be in a GitHub repository

## Deployment Steps

### 1. Prepare Your Repository

Your repository structure should look like this:
```
/
├── server.js
├── package.json
├── package-lock.json
├── render.yaml
├── .env (local only, don't commit)
├── .gitignore
├── README.md
├── models/
│   ├── User.js
│   └── Event.js
├── routes/
│   ├── auth.js
│   └── events.js
└── middleware/
    ├── auth.js
    └── validate.js
```

### 2. Deploy to Render

1. **Go to Render Dashboard**: https://dashboard.render.com
2. **Click "New +"** and select **"Web Service"**
3. **Connect your GitHub repository**
4. **Configure the service**:
   - **Name**: `eventspark-api`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

### 3. Environment Variables

In the Render dashboard, go to your service → Environment → Add Environment Variables:

```
NODE_ENV=production
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/eventspark
JWT_SECRET=your-super-secure-jwt-secret-key-here
```

**Important**: 
- Replace `MONGODB_URI` with your actual MongoDB connection string
- Generate a strong `JWT_SECRET` (you can use a random string generator)

### 4. Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy your application
3. Wait for the build to complete (usually 2-3 minutes)

### 5. Test Your Deployment

Once deployed, your API will be available at:
```
https://your-app-name.onrender.com
```

Test the health endpoint:
```
GET https://your-app-name.onrender.com/api/health
```

## Environment Variables Explained

- **NODE_ENV**: Set to `production` for deployment
- **MONGODB_URI**: Your MongoDB connection string
- **JWT_SECRET**: Secret key for JWT token generation (keep this secure!)

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all dependencies are in `package.json`
2. **Database Connection Error**: Verify your `MONGODB_URI` is correct
3. **Port Issues**: Render automatically sets the `PORT` environment variable
4. **JWT Errors**: Make sure `JWT_SECRET` is set and secure

### Logs:
- Check the logs in Render dashboard for any errors
- Look for build logs and runtime logs

## API Endpoints After Deployment

Your API endpoints will be:
- `https://your-app-name.onrender.com/api/auth/register`
- `https://your-app-name.onrender.com/api/auth/login`
- `https://your-app-name.onrender.com/api/events`
- `https://your-app-name.onrender.com/api/health`

## Security Notes

1. **Never commit your `.env` file** to Git
2. **Use strong JWT secrets** in production
3. **Use HTTPS** (Render provides this automatically)
4. **Keep your MongoDB credentials secure**

## Local Development vs Production

- **Local**: Uses `.env` file
- **Production**: Uses Render environment variables
- **Database**: Use local MongoDB for development, cloud MongoDB for production 