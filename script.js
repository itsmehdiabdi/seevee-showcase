// LinkedIn API Configuration (will be loaded from backend)
let LINKEDIN_CONFIG = {
    clientId: '',
    redirectUri: 'http://localhost:3000', // Make this consistent with backend
    scope: 'openid profile email',
    responseType: 'code',
    state: 'linkedin_oauth_' + Math.random().toString(36).substring(7)
};

// DOM Elements
const loginSection = document.getElementById('login-section');
const profileSection = document.getElementById('profile-section');
const loadingSection = document.getElementById('loading-section');
const errorSection = document.getElementById('error-section');
const linkedinLoginBtn = document.getElementById('linkedin-login');
const logoutBtn = document.getElementById('logout-btn');
const retryBtn = document.getElementById('retry-btn');

// Initialize the app
document.addEventListener('DOMContentLoaded', async () => {
    await loadLinkedInConfig();
    checkForAuthCode();
    setupEventListeners();
});

// Load LinkedIn configuration from backend
async function loadLinkedInConfig() {
    try {
        const response = await fetch('/api/linkedin/config');
        if (response.ok) {
            const config = await response.json();
            LINKEDIN_CONFIG.clientId = config.clientId;
            LINKEDIN_CONFIG.redirectUri = config.redirectUri;
        }
    } catch (error) {
        console.warn('Could not load LinkedIn config from backend');
    }
}

// Setup event listeners
function setupEventListeners() {
    linkedinLoginBtn.addEventListener('click', initiateLinkedInLogin);
    logoutBtn.addEventListener('click', logout);
    retryBtn.addEventListener('click', () => {
        hideAllSections();
        showSection(loginSection);
    });
}

// Show/Hide sections
function hideAllSections() {
    [loginSection, profileSection, loadingSection, errorSection].forEach(section => {
        section.classList.add('hidden');
    });
}

function showSection(section) {
    hideAllSections();
    section.classList.remove('hidden');
}

function showError(message) {
    document.getElementById('error-text').textContent = message;
    showSection(errorSection);
}

// Check if we're returning from LinkedIn OAuth
function checkForAuthCode() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    const error = urlParams.get('error');

    if (error) {
        showError(`LinkedIn authentication failed: ${error}`);
        return;
    }

    if (code && state) {
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        showSection(loadingSection);
        exchangeCodeForToken(code);
    } else {
        // Check if we already have a stored access token
        const storedToken = localStorage.getItem('linkedin_access_token');
        if (storedToken) {
            showSection(loadingSection);
            fetchLinkedInProfile(storedToken);
        } else {
            showSection(loginSection);
        }
    }
}

// Initiate LinkedIn OAuth login
function initiateLinkedInLogin() {
    if (!LINKEDIN_CONFIG.clientId) {
        showError('LinkedIn Client ID not configured. Please check your .env file and restart the server.');
        return;
    }

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?` +
        `response_type=${LINKEDIN_CONFIG.responseType}&` +
        `client_id=${LINKEDIN_CONFIG.clientId}&` +
        `redirect_uri=${encodeURIComponent(LINKEDIN_CONFIG.redirectUri)}&` +
        `scope=${encodeURIComponent(LINKEDIN_CONFIG.scope)}&` +
        `state=${LINKEDIN_CONFIG.state}`;

    window.location.href = authUrl;
}

// Exchange authorization code for access token (using secure backend)
async function exchangeCodeForToken(code) {
    try {
        const response = await fetch('/api/linkedin/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to exchange code for token');
        }

        const data = await response.json();
        const accessToken = data.access_token;

        // Store token (in production, use more secure storage)
        localStorage.setItem('linkedin_access_token', accessToken);
        
        // Fetch profile data
        await fetchLinkedInProfile(accessToken);

    } catch (error) {
        console.error('Token exchange error:', error);
        showError(`Authentication failed: ${error.message}`);
    }
}

// Fetch LinkedIn profile data (using secure backend)
async function fetchLinkedInProfile(accessToken) {
    try {
        const response = await fetch('/api/linkedin/profile', {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to fetch profile data');
        }

        const profileData = await response.json();
        displayProfile(profileData);

    } catch (error) {
        console.error('Profile fetch error:', error);
        showError(`Failed to load profile: ${error.message}`);
    }
}

// Display profile data
function displayProfile(profileData) {
    try {
        // OpenID Connect userinfo endpoint returns different format
        const firstName = profileData.given_name || '';
        const lastName = profileData.family_name || '';
        const fullName = profileData.name || `${firstName} ${lastName}`;
        const email = profileData.email || 'Email not available';
        const picture = profileData.picture || '';
        
        // Get profile photo
        let profilePhotoUrl = picture || 
                             'https://via.placeholder.com/200x200/0077b5/white?text=' + 
                             (firstName.charAt(0) + lastName.charAt(0));

        // Update DOM elements with available data
        document.getElementById('profile-photo').src = profilePhotoUrl;
        document.getElementById('profile-name').textContent = fullName;
        document.getElementById('profile-headline').textContent = email; // Using email as headline since headline not available in OpenID
        document.getElementById('profile-location').textContent = 'Location requires LinkedIn v2 API access';
        document.getElementById('profile-industry').textContent = 'Industry requires LinkedIn v2 API access';

        // Clear previous experience and education data
        document.getElementById('experience-list').innerHTML = '<p>Experience data requires LinkedIn v2 API permissions</p>';
        document.getElementById('education-list').innerHTML = '<p>Education data requires LinkedIn v2 API permissions</p>';

        showSection(profileSection);

    } catch (error) {
        console.error('Display profile error:', error);
        showError('Failed to display profile data');
    }
}

// Logout function
function logout() {
    localStorage.removeItem('linkedin_access_token');
    showSection(loginSection);
}

// Handle errors gracefully
window.addEventListener('error', (event) => {
    console.error('Application error:', event.error);
    showError('An unexpected error occurred. Please try again.');
}); 