const express = require('express');
const cors = require('cors');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the current directory
app.use(express.static(path.join(__dirname)));

// LinkedIn OAuth configuration
const LINKEDIN_CONFIG = {
    clientId: process.env.LINKEDIN_CLIENT_ID,
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    redirectUri: process.env.LINKEDIN_REDIRECT_URI || `http://localhost:${PORT}`,
};

// Backend endpoint to exchange code for token
app.post('/api/linkedin/token', async (req, res) => {
    const { code } = req.body;
    
    if (!code) {
        return res.status(400).json({ error: 'Authorization code is required' });
    }

    try {
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            client_id: LINKEDIN_CONFIG.clientId,
            client_secret: LINKEDIN_CONFIG.clientSecret,
            redirect_uri: LINKEDIN_CONFIG.redirectUri
        });
        const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body
        });

        if (!tokenResponse.ok) {
            const errorText = await tokenResponse.text();
            console.error('LinkedIn token response error:', {
                status: tokenResponse.status,
                statusText: tokenResponse.statusText,
                body: errorText
            });
            throw new Error(`LinkedIn API error: ${tokenResponse.status} ${tokenResponse.statusText}`);
        }

        const tokenData = await tokenResponse.json();
        res.json({ access_token: tokenData.access_token });

    } catch (error) {
        console.error('Token exchange error:', error);
        res.status(500).json({ error: 'Failed to exchange code for token' });
    }
});

// Backend endpoint to fetch LinkedIn profile
app.get('/api/linkedin/profile', async (req, res) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Authorization header required' });
    }

    const accessToken = authHeader.split(' ')[1];

    try {
        const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'cache-control': 'no-cache'
            }
        });

        if (!profileResponse.ok) {
            const errorText = await profileResponse.text();
            console.error('LinkedIn profile response error:', {
                status: profileResponse.status,
                statusText: profileResponse.statusText,
                body: errorText
            });
            throw new Error(`LinkedIn Profile API error: ${profileResponse.status} ${profileResponse.statusText}`);
        }

        const profileData = await profileResponse.json();
        console.log('profileData', profileData);
        res.json(profileData);

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch profile data' });
    }
});

// Get LinkedIn client ID for frontend (safe to expose)
app.get('/api/linkedin/config', (req, res) => {
    res.json({
        clientId: LINKEDIN_CONFIG.clientId,
        redirectUri: LINKEDIN_CONFIG.redirectUri
    });
});

// Handle root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Handle any other routes by serving index.html (for SPA routing)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`🚀 LinkedIn Profile Viewer is running at http://localhost:${PORT}`);
    console.log('');
    console.log('📝 Setup Instructions:');
    console.log('1. Create a LinkedIn app at https://developer.linkedin.com/');
    console.log('2. Set redirect URI to: http://localhost:3000');
    console.log('3. Create a .env file with your LinkedIn credentials');
    console.log('4. Open http://localhost:3000 in your browser');
    console.log('');
    
    if (!LINKEDIN_CONFIG.clientId) {
        console.log('⚠️  LinkedIn Client ID not found in environment variables');
        console.log('   Create a .env file with LINKEDIN_CLIENT_ID and LINKEDIN_CLIENT_SECRET');
    } else {
        console.log('✅ LinkedIn Client ID loaded from environment');
    }
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('👋 Server shutting down gracefully');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('👋 Server shutting down gracefully');
    process.exit(0);
}); 