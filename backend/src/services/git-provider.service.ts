import axios, { AxiosInstance } from 'axios';
import { AppDataSource } from '@/config/datasource';
import { UserGitConnection } from '@/models/postgres/user-git-connection.entity';

export type GitProviderType = 'github' | 'gitlab' | 'bitbucket';

export interface NormalizedRepo {
    id: string;
    provider: GitProviderType;
    name: string;
    fullName: string;
    owner: string;
    defaultBranch: string;
    private?: boolean;
}

export interface NormalizedFileEntry {
    path: string;
    name: string;
    type: 'file' | 'dir';
    size?: number;
}

export class GitProviderService {
    private async getConnections(userId: string): Promise<UserGitConnection[]> {
        return AppDataSource.getRepository(UserGitConnection).find({
            where: { userId },
        });
    }

    async listConnectionProviders(userId: string): Promise<GitProviderType[]> {
        const connections = await this.getConnections(userId);
        return connections.map((c) => c.provider as GitProviderType);
    }

    private client(accessToken: string, provider: GitProviderType): AxiosInstance {
        const headers: Record<string, string> = {
            Authorization: `Bearer ${accessToken}`,
        };
        if (provider === 'gitlab') {
            headers['PRIVATE-TOKEN'] = accessToken;
        }
        return axios.create({
            headers,
            validateStatus: () => true,
        });
    }

    async listRepos(userId: string, provider?: GitProviderType): Promise<NormalizedRepo[]> {
        const connections = await this.getConnections(userId);
        const toUse = provider ? connections.filter((c) => c.provider === provider) : connections;
        const results: NormalizedRepo[] = [];

        for (const conn of toUse) {
            try {
                if (conn.provider === 'github') {
                    const res = await this.client(conn.accessToken, 'github').get(
                        'https://api.github.com/user/repos',
                        { params: { per_page: 100, sort: 'updated' } }
                    );
                    if (res.status !== 200) continue;
                    const repos = res.data || [];
                    for (const r of repos) {
                        results.push({
                            id: String(r.id),
                            provider: 'github',
                            name: r.name,
                            fullName: r.full_name,
                            owner: r.owner?.login || r.full_name?.split('/')[0] || '',
                            defaultBranch: r.default_branch || 'main',
                            private: r.private,
                        });
                    }
                } else if (conn.provider === 'gitlab') {
                    const res = await this.client(conn.accessToken, 'gitlab').get(
                        'https://gitlab.com/api/v4/projects',
                        { params: { membership: true, per_page: 100 } }
                    );
                    if (res.status !== 200) continue;
                    const repos = res.data || [];
                    for (const r of repos) {
                        const pathWithNamespace = r.path_with_namespace || r.full_name || '';
                        const parts = pathWithNamespace.split('/');
                        results.push({
                            id: String(r.id),
                            provider: 'gitlab',
                            name: r.name,
                            fullName: pathWithNamespace,
                            owner: parts[0] || '',
                            defaultBranch: r.default_branch || 'main',
                            private: r.visibility !== 'public',
                        });
                    }
                } else if (conn.provider === 'bitbucket') {
                    const userRes = await this.client(conn.accessToken, 'bitbucket').get(
                        'https://api.bitbucket.org/2.0/user'
                    );
                    if (userRes.status !== 200) continue;
                    const username = userRes.data?.username;
                    if (!username) continue;
                    const res = await this.client(conn.accessToken, 'bitbucket').get(
                        `https://api.bitbucket.org/2.0/repositories/${username}`,
                        { params: { pagelen: 100 } }
                    );
                    if (res.status !== 200) continue;
                    const repos = res.data?.values || [];
                    for (const r of repos) {
                        const fullName = r.full_name || `${r.owner?.username || username}/${r.slug}`;
                        results.push({
                            id: r.uuid || r.slug,
                            provider: 'bitbucket',
                            name: r.name || r.slug,
                            fullName,
                            owner: r.owner?.username || username,
                            defaultBranch: r.mainbranch?.name || 'main',
                            private: r.is_private,
                        });
                    }
                }
            } catch {
                // skip this connection on error
            }
        }
        return results;
    }

    async listFiles(
        userId: string,
        provider: GitProviderType,
        owner: string,
        repo: string,
        path: string = ''
    ): Promise<NormalizedFileEntry[]> {
        const conn = await AppDataSource.getRepository(UserGitConnection).findOne({
            where: { userId, provider },
        });
        if (!conn) throw new Error('Git connection not found');

        const token = conn.accessToken;
        const client = this.client(token, provider);
        const results: NormalizedFileEntry[] = [];

        if (provider === 'github') {
            const url = path
                ? `https://api.github.com/repos/${owner}/${repo}/contents/${path}`
                : `https://api.github.com/repos/${owner}/${repo}/contents/`;
            const res = await client.get(url);
            if (res.status === 401) throw new Error('Token expired or revoked');
            if (res.status !== 200) throw new Error('Failed to list files');
            const items = Array.isArray(res.data) ? res.data : [res.data];
            for (const item of items) {
                results.push({
                    path: item.path || item.name,
                    name: item.name,
                    type: item.type === 'dir' ? 'dir' : 'file',
                    size: item.size,
                });
            }
        } else if (provider === 'gitlab') {
            const projectId = encodeURIComponent(`${owner}/${repo}`);
            const url = path
                ? `https://gitlab.com/api/v4/projects/${projectId}/repository/tree?path=${encodeURIComponent(path)}&per_page=100`
                : `https://gitlab.com/api/v4/projects/${projectId}/repository/tree?per_page=100`;
            const res = await client.get(url);
            if (res.status === 401) throw new Error('Token expired or revoked');
            if (res.status !== 200) throw new Error('Failed to list files');
            const items = res.data || [];
            for (const item of items) {
                const entryPath = path ? `${path}/${item.name}` : item.name;
                results.push({
                    path: entryPath,
                    name: item.name,
                    type: item.type === 'tree' ? 'dir' : 'file',
                });
            }
        } else if (provider === 'bitbucket') {
            const pathSegment = path ? `HEAD/${path}` : 'HEAD/';
            const url = `https://api.bitbucket.org/2.0/repositories/${owner}/${repo}/src/${pathSegment}`;
            const res = await client.get(url);
            if (res.status === 401) throw new Error('Token expired or revoked');
            if (res.status !== 200) throw new Error('Failed to list files');
            const items = res.data?.values || [];
            for (const item of items) {
                const name = item.path || item.name || '';
                const entryPath = path ? `${path}/${name}` : name;
                const isDir = item.type === 'commit_directory' || item.type === 'directory';
                results.push({
                    path: entryPath,
                    name,
                    type: isDir ? 'dir' : 'file',
                });
            }
        }
        return results;
    }

    async getFileContent(
        userId: string,
        provider: GitProviderType,
        owner: string,
        repo: string,
        filePath: string
    ): Promise<{ content: string; encoding: string }> {
        if (filePath.includes('..')) throw new Error('Invalid path');
        const conn = await AppDataSource.getRepository(UserGitConnection).findOne({
            where: { userId, provider },
        });
        if (!conn) throw new Error('Git connection not found');

        const token = conn.accessToken;
        const client = this.client(token, provider);

        if (provider === 'github') {
            const res = await client.get(
                `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`
            );
            if (res.status === 401) throw new Error('Token expired or revoked');
            if (res.status !== 200) throw new Error('Failed to get file');
            const content = res.data.content;
            const encoding = res.data.encoding || 'base64';
            if (encoding === 'base64') {
                return { content: Buffer.from(content, 'base64').toString('utf-8'), encoding: 'utf-8' };
            }
            return { content: content, encoding };
        } else if (provider === 'gitlab') {
            const projectId = encodeURIComponent(`${owner}/${repo}`);
            const encodedPath = encodeURIComponent(filePath);
            const res = await client.get(
                `https://gitlab.com/api/v4/projects/${projectId}/repository/files/${encodedPath}/raw?ref=HEAD`
            );
            if (res.status === 401) throw new Error('Token expired or revoked');
            if (res.status !== 200) throw new Error('Failed to get file');
            const content = typeof res.data === 'string' ? res.data : (res.data?.content ?? '');
            return { content, encoding: 'utf-8' };
        } else if (provider === 'bitbucket') {
            const res = await client.get(
                `https://api.bitbucket.org/2.0/repositories/${owner}/${repo}/src/HEAD/${filePath}`
            );
            if (res.status === 401) throw new Error('Token expired or revoked');
            if (res.status !== 200) throw new Error('Failed to get file');
            const content = typeof res.data === 'string' ? res.data : '';
            return { content, encoding: 'utf-8' };
        }
        throw new Error('Unsupported provider');
    }
}

export const gitProviderService = new GitProviderService();
