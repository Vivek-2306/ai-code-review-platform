import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import { authService } from '@/services/auth.service';
import { oauthStateService } from '@/services/oauth-state.service';
import { env } from '@/config/env';

const REPO_PROVIDERS = ['github', 'gitlab', 'bitbucket'];

export class GitConnectController {
    /**
     * GET /api/v1/git/connect/:provider/authorize
     * Authenticated. Stores connect state in Redis and redirects to provider with repo scopes.
     */
    async authorize(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.redirect(env.FRONTEND_URL + '/login?error=unauthorized');
                return;
            }
            const provider = Array.isArray(req.params.provider) ? req.params.provider[0] : req.params.provider;
            if (!provider || !REPO_PROVIDERS.includes(provider)) {
                res.status(400).json({ error: 'Invalid provider' });
                return;
            }
            const state = authService.generateOAuthState();
            await oauthStateService.setConnectState(state, {
                userId: req.user.id,
                purpose: 'repo',
                provider,
            });
            const authUrl = authService.getOAuthUrl(
                provider as 'github' | 'gitlab' | 'bitbucket',
                state,
                'repo'
            );
            res.redirect(302, authUrl);
        } catch (err: any) {
            if (err.message?.includes('not configured')) {
                res.redirect(env.FRONTEND_URL + '/repos?error=provider_not_configured');
                return;
            }
            res.redirect(env.FRONTEND_URL + '/repos?error=connect_failed');
        }
    }
}

export const gitConnectController = new GitConnectController();
