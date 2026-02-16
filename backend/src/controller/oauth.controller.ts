import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { tokenStorageService } from '../services/token-storage.service';
import { oauthStateService } from '../services/oauth-state.service';
import { oauthService } from '../services/oauth.service';
import { AppDataSource } from '@/config/datasource';
import { UserGitConnection } from '@/models/postgres/user-git-connection.entity';
import { env } from '@/config/env';

const LOGIN_PROVIDERS = ['github', 'gitlab', 'bitbucket', 'google'];

export class OAuthController {
    /**
     * GET /api/v1/auth/oauth/:provider/authorize
     * Returns authUrl for login (identity scopes). Frontend redirects user to authUrl.
     */
    async authorize(req: Request, res: Response): Promise<void> {
        try {
            const provider = Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider;
            if (!provider || !LOGIN_PROVIDERS.includes(provider)) {
                res.status(400).json({ error: 'Invalid OAuth provider' });
                return;
            }

            const state = authService.generateOAuthState();
            const authUrl = authService.getOAuthUrl(provider as 'github' | 'gitlab' | 'bitbucket' | 'google', state, 'login');

            res.status(200).json({
                authUrl,
                state,
            });
        } catch (error: any) {
            if (error.message.includes('not configured')) {
                res.status(503).json({ error: 'OAuth provider not configured' });
                return;
            }
            res.status(500).json({ error: 'Failed to generate OAuth URL' });
        }
    }

    /**
     * GET /api/v1/auth/oauth/:provider/callback
     * Handles OAuth callback: if state is connect flow, save token and redirect to repos; else login flow.
     */
    async callback(req: Request, res: Response): Promise<void> {
        try {
            const provider = Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider;
            const code = req.query.code;
            const state = req.query.state;

            if (!provider || !LOGIN_PROVIDERS.includes(provider)) {
                res.status(400).json({ error: 'Invalid OAuth provider' });
                return;
            }

            const codeStr: string = typeof code === 'string' ? code : Array.isArray(code) && typeof code[0] === 'string' ? code[0] : '';
            if (!codeStr) {
                res.redirect(env.FRONTEND_URL + '/login?error=missing_code');
                return;
            }
            const stateStr = typeof state === 'string' ? state : Array.isArray(state) ? (state[0] as string) : undefined;
            const connectPayload = stateStr ? await oauthStateService.getConnectState(stateStr) : null;

            if (connectPayload && connectPayload.purpose === 'repo' && ['github', 'gitlab', 'bitbucket'].includes(provider)) {
                const accessToken = await oauthService.getAccessToken(provider as string, codeStr);
                const repo = AppDataSource.getRepository(UserGitConnection);
                const prov = provider as 'github' | 'gitlab' | 'bitbucket';
                let connection = await repo.findOne({
                    where: { userId: connectPayload.userId, provider: prov },
                });
                if (connection) {
                    connection.accessToken = accessToken;
                    connection.refreshToken = null;
                    connection.expiresAt = null;
                    await repo.save(connection);
                } else {
                    connection = repo.create({
                        userId: connectPayload.userId,
                        provider: prov,
                        accessToken,
                        refreshToken: null,
                        expiresAt: null,
                    });
                    await repo.save(connection);
                }
                res.redirect(env.FRONTEND_URL + '/repos?connected=' + provider);
                return;
            }

            const result = await authService.handleOAuthCallback(
                provider as 'github' | 'gitlab' | 'bitbucket' | 'google',
                codeStr,
                stateStr
            );

            tokenStorageService.setTokensAsCookies(
                res,
                result.tokens.accessToken,
                result.tokens.refreshToken
            );
            res.redirect(env.FRONTEND_URL + '/?login=success');
        } catch (error: any) {
            if (error.message.includes('not configured')) {
                res.status(503).json({ error: 'OAuth provider not configured' });
                return;
            }
            if (error.message.includes('Invalid email')) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.redirect(env.FRONTEND_URL + '/login?error=oauth_failed');
        }
    }

    /**
     * GET /api/v1/auth/oauth/providers
     * List available OAuth providers
     */
    async getProviders(req: Request, res: Response): Promise<void> {
        const providers: string[] = [];
        if (process.env.GITHUB_CLIENT_ID) providers.push('github');
        if (process.env.GITLAB_CLIENT_ID) providers.push('gitlab');
        if (process.env.BITBUCKET_CLIENT_ID) providers.push('bitbucket');
        if (process.env.GOOGLE_CLIENT_ID) providers.push('google');
        res.status(200).json({ providers });
    }
}

export const oauthController = new OAuthController();