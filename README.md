# LinkedIn Profile Viewer

A simple frontend application that connects to LinkedIn and displays user profile data.

## Features

- LinkedIn OAuth authentication
- Profile information display (name, headline, photo, location, industry)
- Experience and education sections
- Responsive design
- Clean, modern UI

## Demo

The application includes mock data for demonstration purposes. To connect to real LinkedIn data, you'll need to set up LinkedIn OAuth (see setup instructions below).

## Quick Start

1. Open `index.html` in your browser
2. Click "Sign in with LinkedIn" to see the demo with mock data

## Setup for Real LinkedIn Integration

### 1. Create a LinkedIn App

1. Go to [LinkedIn Developer Portal](https://developer.linkedin.com/)
2. Sign in with your LinkedIn account
3. Click "Create App"
4. Fill in the required information:
   - App name: "LinkedIn Profile Viewer"
   - LinkedIn Page: Your company page (or create one)
   - Privacy policy URL: Your privacy policy
   - App logo: Upload a logo (optional)
5. Click "Create App"

### 2. Configure OAuth Settings

1. In your LinkedIn app dashboard, go to the "Auth" tab
2. Add your redirect URI:
   - For local development: `http://localhost:3000` (or your local server)
   - For production: `https://yourdomain.com`
3. Select the following OAuth scopes:
   - `openid`
   - `profile`
   - `email`
   - `w_member_social` (if you want to post content)

### 3. Get Your Credentials

1. In the "Auth" tab, copy your:
   - Client ID
   - Client Secret (keep this secure!)

### 4. Configure the Application

1. Open `script.js`
2. Replace `YOUR_LINKEDIN_CLIENT_ID` with your actual client ID:
   ```javascript
   const LINKEDIN_CONFIG = {
       clientId: 'your_actual_client_id_here',
       // ... rest of config
   };
   ```

### 5. Set Up a Local Server

Since LinkedIn OAuth requires HTTPS in production and proper CORS handling, you'll need to serve the files:

#### Option 1: Simple HTTP Server (Python)
```bash
# Python 3
python -m http.server 3000

# Python 2
python -m SimpleHTTPServer 3000
```

#### Option 2: Node.js HTTP Server
```bash
# Install a simple server
npm install -g http-server

# Serve the files
http-server -p 3000
```

#### Option 3: Live Server (VS Code Extension)
Install the "Live Server" extension in VS Code and right-click on `index.html` → "Open with Live Server"

### 6. Update Redirect URI

Make sure your LinkedIn app's redirect URI matches your server:
- Local: `http://localhost:3000`
- Production: `https://yourdomain.com`

## Security Considerations

⚠️ **Important Security Notes:**

1. **Client Secret**: The current implementation includes the client secret in the frontend code, which is **NOT secure** for production. In a real application:
   - Store the client secret on your backend server
   - Handle the OAuth token exchange on your backend
   - Only send the access token to the frontend

2. **HTTPS**: LinkedIn requires HTTPS for production applications

3. **CORS**: LinkedIn API has CORS restrictions. For production, you'll need a backend proxy

## Production Setup

For a production-ready application, you should:

1. **Create a Backend Server** (Node.js, Python, etc.) to:
   - Handle OAuth token exchange
   - Store client secrets securely
   - Proxy LinkedIn API requests
   - Implement proper error handling

2. **Use Environment Variables** for sensitive data:
   ```bash
   LINKEDIN_CLIENT_ID=your_client_id
   LINKEDIN_CLIENT_SECRET=your_client_secret
   ```

3. **Implement Proper Token Management**:
   - Secure token storage
   - Token refresh logic
   - Session management

## File Structure

```
seevee-front/
├── index.html          # Main HTML file
├── style.css           # Styling
├── script.js           # JavaScript logic
└── README.md           # This file
```

## API Endpoints Used

- **OAuth Authorization**: `https://www.linkedin.com/oauth/v2/authorization`
- **Token Exchange**: `https://www.linkedin.com/oauth/v2/accessToken`
- **Profile Data**: `https://api.linkedin.com/v2/people/~`
- **Profile Picture**: `https://api.linkedin.com/v2/people/~/profilePicture`

## Troubleshooting

### Common Issues

1. **"Please configure your LinkedIn Client ID"**
   - Make sure you've replaced `YOUR_LINKEDIN_CLIENT_ID` in `script.js`

2. **OAuth Error: redirect_uri_mismatch**
   - Ensure your LinkedIn app's redirect URI matches your current URL exactly

3. **CORS Errors**
   - Use a local server (not file:// protocol)
   - For production, implement a backend proxy

4. **"This demo requires a backend server"**
   - This is expected - the app shows mock data for security reasons
   - To get real data, implement a proper backend

### Testing the OAuth Flow

1. Make sure your server is running
2. Open your browser's developer tools
3. Click "Sign in with LinkedIn"
4. Check the network tab for any errors
5. Verify the redirect URI matches your LinkedIn app settings

## Next Steps

To make this production-ready:

1. **Backend Implementation**: Create a secure backend API
2. **Database**: Store user data and tokens securely
3. **Error Handling**: Implement comprehensive error handling
4. **Rate Limiting**: Handle LinkedIn API rate limits
5. **User Management**: Add user registration/login system
6. **Data Persistence**: Save profile data to avoid repeated API calls

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is open source and available under the [MIT License](LICENSE). 