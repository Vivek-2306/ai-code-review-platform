import { getApiUrl } from '@/config/env';
import { tokenStorage } from '@/lib/token-storage';

const GIT_BASE = 'git';

async function gitFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = getApiUrl(
    path.startsWith(GIT_BASE) ? path : `${GIT_BASE}/${path.replace(/^\//, '')}`
  );
  const token = tokenStorage.getAccessToken();
  const response = await fetch(url, {
    ...options,
    credentials: 'include',
    headers: {
      ...(options.headers as HeadersInit),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof data?.error === 'string' ? data.error : 'Request failed';
    throw new Error(message);
  }
  return data as T;
}

export type GitProvider = 'github' | 'gitlab' | 'bitbucket';

export interface GitConnection {
  provider: GitProvider;
}

export interface GitRepo {
  id: string;
  provider: GitProvider;
  name: string;
  fullName: string;
  owner: string;
  defaultBranch: string;
  private?: boolean;
}

export interface GitFileEntry {
  path: string;
  name: string;
  type: 'file' | 'dir';
  size?: number;
}

export interface GitFileContent {
  content: string;
  path: string;
  name: string;
}

export async function getConnections(): Promise<{
  data: { connections: GitConnection[] };
}> {
  return gitFetch<{ data: { connections: GitConnection[] } }>(
    `${GIT_BASE}/connections`
  );
}

export async function getRepos(provider?: GitProvider): Promise<{
  data: GitRepo[];
}> {
  const q = provider ? `?provider=${provider}` : '';
  return gitFetch<{ data: GitRepo[] }>(`${GIT_BASE}/repos${q}`);
}

export async function getFiles(
  owner: string,
  repo: string,
  provider: GitProvider,
  path?: string
): Promise<{ data: GitFileEntry[] }> {
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);
  const q = path ? `&path=${encodeURIComponent(path)}` : '';
  return gitFetch<{ data: GitFileEntry[] }>(
    `${GIT_BASE}/repos/${encodedOwner}/${encodedRepo}/files?provider=${provider}${q}`
  );
}

export interface FileContentResponse {
  content: string;
  encoding?: string;
}

export async function getFileContent(
  owner: string,
  repo: string,
  provider: GitProvider,
  filePath: string
): Promise<{ data: FileContentResponse }> {
  const encodedOwner = encodeURIComponent(owner);
  const encodedRepo = encodeURIComponent(repo);
  return gitFetch<{ data: FileContentResponse }>(
    `${GIT_BASE}/repos/${encodedOwner}/${encodedRepo}/contents?provider=${provider}&path=${encodeURIComponent(filePath)}`
  );
}

export function getConnectAuthorizeUrl(provider: GitProvider): string {
  return getApiUrl(`${GIT_BASE}/connect/${provider}/authorize`);
}
