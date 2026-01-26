import axios from 'axios'

export interface OAuthProvider {
    name: 'github' | 'google';
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
}

export class OAuthService {
    private providers: Map<string, OAuthProvider> = new Map();

    constructor() {
        if (process.env.GITHUB_CLIENT_ID) {
            this.providers.set('github', {
                name: 'github',
                clientId: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET!,
                redirectUri: process.env.GITHUB_REDIRECT_URI!,
                authUrl: 'https://github.com/login/oauth/authorize',
                tokenUrl: 'https://github.com/login/oauth/access_token',
                userInfoUrl: 'https://api.github.com/user',
            })
        }

        if (process.env.GOOGLE_CLIENT_ID) {
            this.providers.set('google', {
                name: 'google',
                clientId: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
                redirectUri: process.env.GOOGLE_REDIRECT_URI!,
                authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenUrl: 'https://oauth2.googleapis.com/token',
                userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
            });
        }
    }

    /**
     * Get OAuth authorization URL
     */
    getAuthUrl(provider: string, state?: string): string {
        const oauthProvider = this.providers.get(provider);
        if (!oauthProvider) {
            throw new Error(`OAuth provider ${provider} not configured`);
        }

        const params = new URLSearchParams({
            client_id: oauthProvider.clientId,
            redirect_uri: oauthProvider.redirectUri,
            response_type: 'code',
            scope: provider === 'github' ? 'user:email' : 'openid email profile',
            ...(state && { state }),
        });

        return `${oauthProvider.authUrl}?${params.toString()}`;
    }

    /**
     * Exchange code for access token
     */
    async getAccessToken(provider: string, code: string): Promise<string> {
        const oauthProvider = this.providers.get(provider);
        if (!oauthProvider) {
            throw new Error(`OAuth provider ${provider} not configured`);
        }

        const response = await axios.post(
            oauthProvider.tokenUrl,
            {
                client_id: oauthProvider.clientId,
                client_secret: oauthProvider.clientSecret,
                code,
                redirect_uri: oauthProvider.redirectUri,
                ...(provider === 'google' && { grant_type: 'authorization_code' }),
            },
            {
                headers: {
                    Accept: provider === 'github' ? 'application/json' : 'application/x-www-form-urlencoded',
                },
            }
        );

        return provider === 'github' ? response.data.access_token : response.data.access_token;
    }

    /**
     * Get user info from OAuth provider
     */
    async getUserInfo(provider: string, accessToken: string): Promise<{ email: string; name?: string }> {
        const oauthProvider = this.providers.get(provider);
        if (!oauthProvider) {
            throw new Error(`OAuth provider ${provider} not configured`);
        }

        const response = await axios.get(oauthProvider.userInfoUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (provider === 'github') {
            return {
                email: response.data.email || response.data.login + '@github.local',
                name: response.data.name,
            };
        } else {
            return {
                email: response.data.email,
                name: response.data.name,
            };
        }
    }
}

export const oauthService = new OAuthService();