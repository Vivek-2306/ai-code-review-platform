import axios from 'axios';
import { env } from '@/config/env';

export type OAuthPurpose = 'login' | 'repo';

export interface OAuthProvider {
    name: 'github' | 'gitlab' | 'bitbucket' | 'google';
    clientId: string;
    clientSecret: string;
    redirectUri: string;
    authUrl: string;
    tokenUrl: string;
    userInfoUrl: string;
    scopes?: string;
}

const LOGIN_SCOPES: Record<string, string> = {
    github: 'user:email',
    gitlab: 'read_user',
    bitbucket: 'account email',
    google: 'openid email profile',
};

const REPO_SCOPES: Record<string, string> = {
    github: 'repo read:user',
    gitlab: 'read_api read_repository',
    bitbucket: 'repository',
};

export class OAuthService {
    private providers: Map<string, OAuthProvider> = new Map();

    constructor() {
        if (env.GITHUB_CLIENT_ID) {
            this.providers.set('github', {
                name: 'github',
                clientId: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET!,
                redirectUri: env.GITHUB_REDIRECT_URI!,
                authUrl: 'https://github.com/login/oauth/authorize',
                tokenUrl: 'https://github.com/login/oauth/access_token',
                userInfoUrl: 'https://api.github.com/user',
            });
        }

        if (env.GITLAB_CLIENT_ID) {
            this.providers.set('gitlab', {
                name: 'gitlab',
                clientId: env.GITLAB_CLIENT_ID,
                clientSecret: env.GITLAB_CLIENT_SECRET!,
                redirectUri: env.GITLAB_REDIRECT_URI!,
                authUrl: 'https://gitlab.com/oauth/authorize',
                tokenUrl: 'https://gitlab.com/oauth/token',
                userInfoUrl: 'https://gitlab.com/api/v4/user',
                scopes: 'read_api read_user',
            });
        }

        if (env.BITBUCKET_CLIENT_ID) {
            this.providers.set('bitbucket', {
                name: 'bitbucket',
                clientId: env.BITBUCKET_CLIENT_ID,
                clientSecret: env.BITBUCKET_CLIENT_SECRET!,
                redirectUri: env.BITBUCKET_REDIRECT_URI!,
                authUrl: 'https://bitbucket.org/site/oauth2/authorize',
                tokenUrl: 'https://bitbucket.org/site/oauth2/access_token',
                userInfoUrl: 'https://api.bitbucket.org/2.0/user',
                scopes: 'account email',
            });
        }

        if (env.GOOGLE_CLIENT_ID) {
            this.providers.set('google', {
                name: 'google',
                clientId: env.GOOGLE_CLIENT_ID,
                clientSecret: env.GOOGLE_CLIENT_SECRET!,
                redirectUri: env.GOOGLE_REDIRECT_URI!,
                authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenUrl: 'https://oauth2.googleapis.com/token',
                userInfoUrl: 'https://www.googleapis.com/oauth2/v2/userinfo',
                scopes: 'openid email profile',
            });
        }
    }

    /**
     * Get OAuth authorization URL
     * @param purpose 'login' = identity scopes only, 'repo' = repo read scopes
     */
    getAuthUrl(provider: string, state?: string, purpose: OAuthPurpose = 'login'): string {
        const oauthProvider = this.providers.get(provider);
        if (!oauthProvider) {
            throw new Error(`OAuth provider ${provider} not configured`);
        }

        const scope =
            purpose === 'repo'
                ? REPO_SCOPES[provider] ?? oauthProvider.scopes ?? ''
                : LOGIN_SCOPES[provider] ?? oauthProvider.scopes ?? '';

        const params = new URLSearchParams({
            client_id: oauthProvider.clientId,
            redirect_uri: oauthProvider.redirectUri,
            response_type: 'code',
            scope,
            ...(state && { state }),
        });

        if (provider === 'bitbucket') {
            params.set('approval_prompt', 'force');
        }

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

        if (provider === 'bitbucket') {
            return this.getAccessTokenBitbucket(oauthProvider, code);
        }

        const tokenData: Record<string, string> = {
            client_id: oauthProvider.clientId,
            client_secret: oauthProvider.clientSecret,
            code,
            redirect_uri: oauthProvider.redirectUri,
        };

        if (provider === 'google') {
            tokenData.grant_type = 'authorization_code';
        }

        const headers: Record<string, string> = {
            Accept: 'application/json',
        };

        const response = await axios.post(
            oauthProvider.tokenUrl,
            new URLSearchParams(tokenData),
            { headers }
        );
        return response.data.access_token;
    }

    private async getAccessTokenBitbucket(
        oauthProvider: OAuthProvider,
        code: string
    ): Promise<string> {
        const basicAuth = Buffer.from(
            `${oauthProvider.clientId}:${oauthProvider.clientSecret}`
        ).toString('base64');
        const body = new URLSearchParams({
            grant_type: 'authorization_code',
            code,
        });
        const response = await axios.post(oauthProvider.tokenUrl, body.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
                Authorization: `Basic ${basicAuth}`,
            },
        });
        return response.data.access_token;
    }

    /**
     * Get user info from OAuth provider
     */
    async getUserInfo(provider: string, accessToken: string): Promise<{ email: string; name?: string }> {
        const oauthProvider = this.providers.get(provider);
        if (!oauthProvider) {
            throw new Error(`OAuth provider ${provider} not configured`);
        }

        const headers = {
            Authorization: `Bearer ${accessToken}`,
        };

        if (provider === 'github') {
            const userResponse = await axios.get(oauthProvider.userInfoUrl, { headers });
            let email = userResponse.data.email;
            if (!email) {
                const emailsResponse = await axios.get('https://api.github.com/user/emails', {
                    headers,
                });
                const primary = emailsResponse.data?.find((e: any) => e.primary);
                email = primary?.email || userResponse.data.login + '@users.noreply.github.com';
            }
            return {
                email,
                name: userResponse.data.name,
            };
        }

        const response = await axios.get(oauthProvider.userInfoUrl, { headers });
        if (provider === 'bitbucket') {
            const emailResponse = await axios.get('https://api.bitbucket.org/2.0/user/emails', {
                headers,
            });
            const emails = emailResponse.data?.values || [];
            const primary = emails.find((e: any) => e.is_primary) || emails[0];
            return {
                email: primary?.email || response.data.uuid + '@bitbucket.local',
                name: response.data.display_name,
            };
        }
        return {
            email: response.data.email,
            name: response.data.name,
        };
    }
}

export const oauthService = new OAuthService();
