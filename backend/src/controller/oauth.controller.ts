import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class OAuthController {
    /**
     * GET /api/auth/oauth/:provider/authorize
     * Redirects user to OAuth provider
     */
    async authorize(req: Request, res: Response): Promise<void> {
        try {
            const { provider } = req.params;

            if (provider !== 'github' && provider !== 'google') {
                res.status(400).json({ error: 'Invalid OAuth provider' });
                return;
            }

            // Generate state for CSRF protection
            const state = authService.generateOAuthState();

            // Store state in session or return it to client
            // For stateless, you can return it and client sends it back
            const authUrl = authService.getOAuthUrl(provider as 'github' | 'google', state);

            res.status(200).json({
                authUrl,
                state, // Client should store this and send it back in callback
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
     * GET /api/auth/oauth/:provider/callback
     * Handles OAuth callback from provider
     */
    async callback(req: Request, res: Response): Promise<void> {
        try {
            const { provider } = req.params;
            const { code, state } = req.query;

            if (provider !== 'github' && provider !== 'google') {
                res.status(400).json({ error: 'Invalid OAuth provider' });
                return;
            }

            if (!code || typeof code !== 'string') {
                res.status(400).json({ error: 'Authorization code is required' });
                return;
            }

            // Handle OAuth callback
            const result = await authService.handleOAuthCallback(
                provider as 'github' | 'google',
                code,
                typeof state === 'string' ? state : undefined
            );

            // In production, you might want to redirect to frontend with tokens
            // For now, return JSON response
            res.status(200).json({
                message: 'OAuth authentication successful',
                data: result,
            });
        } catch (error: any) {
            if (error.message.includes('not configured')) {
                res.status(503).json({ error: 'OAuth provider not configured' });
                return;
            }
            if (error.message.includes('Invalid email')) {
                res.status(400).json({ error: error.message });
                return;
            }
            res.status(500).json({ error: 'OAuth authentication failed' });
        }
    }

    /**
     * GET /api/auth/oauth/providers
     * List available OAuth providers
     */
    async getProviders(req: Request, res: Response): Promise<void> {
        const providers: string[] = [];

        if (process.env.GITHUB_CLIENT_ID) {
            providers.push('github');
        }

        if (process.env.GOOGLE_CLIENT_ID) {
            providers.push('google');
        }

        res.status(200).json({
            providers,
        });
    }
}

export const oauthController = new OAuthController();