import { Response } from 'express';
import { AuthRequest } from '@/middleware/auth.middleware';
import { gitProviderService } from '@/services/git-provider.service';

export class GitController {
    async listConnections(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const providers = await gitProviderService.listConnectionProviders(req.user.id);
            res.status(200).json({ data: { connections: providers.map((p) => ({ provider: p })) } });
        } catch (err: any) {
            res.status(500).json({ error: err.message || 'Failed to list connections' });
        }
    }

    async listRepos(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const providerRaw = Array.isArray(req.query.provider) ? req.query.provider[0] : req.query.provider;
            const provider = typeof providerRaw === 'string' ? providerRaw : undefined;
            const repos = await gitProviderService.listRepos(req.user.id, provider as any);
            res.status(200).json({ data: repos });
        } catch (err: any) {
            res.status(500).json({ error: err.message || 'Failed to list repositories' });
        }
    }

    async listFiles(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const owner = Array.isArray(req.params.owner) ? req.params.owner[0] : req.params.owner;
            const repo = Array.isArray(req.params.repo) ? req.params.repo[0] : req.params.repo;
            const providerRaw = Array.isArray(req.query.provider) ? req.query.provider[0] : req.query.provider;
            const provider = typeof providerRaw === 'string' ? providerRaw : '';
            const pathRaw = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;
            const path = typeof pathRaw === 'string' ? pathRaw : '';
            if (!provider || !owner || !repo || !['github', 'gitlab', 'bitbucket'].includes(provider)) {
                res.status(400).json({ error: 'provider query is required (github, gitlab, bitbucket)' });
                return;
            }
            const files = await gitProviderService.listFiles(
                req.user.id,
                provider as any,
                owner,
                repo,
                path
            );
            res.status(200).json({ data: files });
        } catch (err: any) {
            if (err.message === 'Git connection not found') {
                res.status(404).json({ error: err.message });
                return;
            }
            if (err.message?.includes('Token expired')) {
                res.status(401).json({ error: err.message });
                return;
            }
            res.status(500).json({ error: err.message || 'Failed to list files' });
        }
    }

    async getFileContent(req: AuthRequest, res: Response): Promise<void> {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const owner = (Array.isArray(req.params.owner) ? req.params.owner[0] : req.params.owner) || '';
            const repo = (Array.isArray(req.params.repo) ? req.params.repo[0] : req.params.repo) || '';
            const providerRaw = Array.isArray(req.query.provider) ? req.query.provider[0] : req.query.provider;
            const provider = typeof providerRaw === 'string' ? providerRaw : '';
            const pathRaw = Array.isArray(req.query.path) ? req.query.path[0] : req.query.path;
            const fullPath = typeof pathRaw === 'string' ? pathRaw : '';
            if (!provider || !owner || !repo || !['github', 'gitlab', 'bitbucket'].includes(provider)) {
                res.status(400).json({ error: 'provider query is required (github, gitlab, bitbucket)' });
                return;
            }
            if (!fullPath) {
                res.status(400).json({ error: 'path query is required' });
                return;
            }
            const result = await gitProviderService.getFileContent(
                req.user.id,
                provider as any,
                owner,
                repo,
                fullPath
            );
            res.status(200).json({ data: result });
        } catch (err: any) {
            if (err.message === 'Git connection not found') {
                res.status(404).json({ error: err.message });
                return;
            }
            if (err.message?.includes('Token expired')) {
                res.status(401).json({ error: err.message });
                return;
            }
            if (err.message === 'Invalid path') {
                res.status(400).json({ error: err.message });
                return;
            }
            res.status(500).json({ error: err.message || 'Failed to get file content' });
        }
    }
}

export const gitController = new GitController();
