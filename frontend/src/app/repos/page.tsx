'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  getConnections,
  getRepos,
  getFiles,
  getFileContent,
  getConnectAuthorizeUrl,
  type GitProvider,
  type GitRepo,
  type GitFileEntry,
  type GitFileContent,
} from '@/lib/git-api';
import { useToast } from '@/components/providers/ToastProvider';
import { Header } from '@/components/layout/Header';

const REPO_PROVIDERS: GitProvider[] = ['github', 'gitlab', 'bitbucket'];

export default function ReposPage() {
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const [connections, setConnections] = useState<GitProvider[]>([]);
  const [repos, setRepos] = useState<GitRepo[]>([]);
  const [loading, setLoading] = useState(true);
  const [reposLoading, setReposLoading] = useState(false);
  const [selectedRepo, setSelectedRepo] = useState<GitRepo | null>(null);
  const [fileTree, setFileTree] = useState<GitFileEntry[]>([]);
  const [pathStack, setPathStack] = useState<string[]>([]);
  const [treeLoading, setTreeLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [reviewContent, setReviewContent] = useState<GitFileContent[] | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);

  const currentPath = pathStack.join('/');

  const loadConnections = useCallback(async () => {
    try {
      const res = await getConnections();
      setConnections(
        (res.data?.connections ?? []).map((c) => c.provider as GitProvider)
      );
    } catch (e: any) {
      if (e?.message?.includes('Unauthorized') || e?.message?.includes('401')) {
        window.location.href = '/login';
        return;
      }
      showToast(e?.message ?? 'Failed to load connections');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  useEffect(() => {
    const connected = searchParams.get('connected');
    const error = searchParams.get('error');
    if (connected) {
      showToast(`Connected to ${connected}`);
      loadConnections();
      window.history.replaceState({}, '', '/repos');
    }
    if (error) {
      showToast(
        error === 'provider_not_configured'
          ? 'That provider is not configured.'
          : 'Connection failed.'
      );
      window.history.replaceState({}, '', '/repos');
    }
  }, [searchParams, showToast, loadConnections]);

  const loadRepos = useCallback(async () => {
    setReposLoading(true);
    try {
      const res = await getRepos();
      setRepos(res.data ?? []);
    } catch (e: any) {
      showToast(e?.message ?? 'Failed to load repositories');
    } finally {
      setReposLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (connections.length > 0 && repos.length === 0 && !reposLoading) {
      loadRepos();
    }
  }, [connections.length, repos.length, reposLoading, loadRepos]);

  const loadFileTree = useCallback(
    async (repo: GitRepo, path: string) => {
      setTreeLoading(true);
      try {
        const res = await getFiles(
          repo.owner,
          repo.name,
          repo.provider,
          path || undefined
        );
        setFileTree(res.data ?? []);
      } catch (e: any) {
        showToast(e?.message ?? 'Failed to load files');
      } finally {
        setTreeLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    if (selectedRepo) {
      loadFileTree(selectedRepo, currentPath);
    } else {
      setFileTree([]);
      setPathStack([]);
      setSelectedFiles(new Set());
    }
  }, [selectedRepo, currentPath, loadFileTree]);

  const handleConnect = (provider: GitProvider) => {
    window.location.href = getConnectAuthorizeUrl(provider);
  };

  const handleSelectRepo = (repo: GitRepo) => {
    setSelectedRepo(repo);
    setPathStack([]);
    setSelectedFiles(new Set());
  };

  const handlePathClick = (index: number) => {
    setPathStack((prev) => prev.slice(0, index + 1));
  };

  const handleDirClick = (entry: GitFileEntry) => {
    if (entry.type === 'dir') {
      setPathStack((prev) => [...prev, entry.name]);
    }
  };

  const toggleFileSelection = (entry: GitFileEntry) => {
    if (entry.type !== 'file') return;
    const key = `${currentPath ? currentPath + '/' : ''}${entry.name}`;
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const handleReviewSelected = async () => {
    if (!selectedRepo || selectedFiles.size === 0) return;
    setReviewLoading(true);
    setReviewContent(null);
    try {
      const contents: GitFileContent[] = [];
      for (const relPath of selectedFiles) {
        const res = await getFileContent(
          selectedRepo.owner,
          selectedRepo.name,
          selectedRepo.provider,
          relPath
        );
        if (res.data?.content != null)
          contents.push({
            content: res.data.content,
            path: relPath,
            name: relPath.split('/').pop() ?? relPath,
          });
      }
      setReviewContent(contents);
      showToast(`${contents.length} file(s) loaded for review`);
    } catch (e: any) {
      showToast(e?.message ?? 'Failed to load file contents');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center p-8">
          <p className="text-slate-500">Loading…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <Header />
      <main className="flex-1 p-6 lg:p-8 max-w-6xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="text-2xl font-bold dark:text-white mb-2">
            Repositories
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Connect a provider to list repos and select files for review
          </p>
        </div>

        <section className="mb-8">
          <h2 className="text-lg font-semibold dark:text-white mb-3">
            Connect Git providers
          </h2>
          <div className="flex flex-wrap gap-3">
            {REPO_PROVIDERS.map((provider) => {
              const connected = connections.includes(provider);
              const label =
                provider.charAt(0).toUpperCase() + provider.slice(1);
              return (
                <div key={provider} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleConnect(provider)}
                    className="px-4 py-2 rounded-lg bg-white dark:bg-[#1c2a38] border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#253545] transition-colors text-sm font-medium"
                  >
                    {connected ? `Reconnect ${label}` : `Connect ${label}`}
                  </button>
                  {connected && (
                    <span className="text-xs text-emerald-600 dark:text-emerald-400">
                      Connected
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {connections.length === 0 && (
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            Connect at least one provider above to see repositories.
          </p>
        )}

        {connections.length > 0 && (
          <>
            <section className="mb-8">
              <h2 className="text-lg font-semibold dark:text-white mb-3">
                Your repositories
              </h2>
              <button
                type="button"
                onClick={loadRepos}
                disabled={reposLoading}
                className="mb-3 text-sm text-primary hover:underline disabled:opacity-70"
              >
                {reposLoading ? 'Loading…' : 'Refresh'}
              </button>
              <ul className="space-y-2">
                {repos.map((repo) => (
                  <li key={`${repo.provider}-${repo.fullName}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectRepo(repo)}
                      className="text-left w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-[#253545] transition-colors flex items-center justify-between"
                    >
                      <span className="font-medium dark:text-white">
                        {repo.fullName}
                      </span>
                      <span className="text-xs text-slate-500 capitalize">
                        {repo.provider}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            {selectedRepo && (
              <section className="border border-slate-200 dark:border-slate-700 rounded-xl p-4">
                <h2 className="text-lg font-semibold dark:text-white mb-2">
                  Files: {selectedRepo.fullName}
                </h2>
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setPathStack([])}
                    className="text-sm text-slate-500 hover:text-primary"
                  >
                    root
                  </button>
                  {pathStack.map((segment, i) => (
                    <span key={i} className="flex items-center gap-2">
                      <span className="text-slate-400">/</span>
                      <button
                        type="button"
                        onClick={() => handlePathClick(i)}
                        className="text-sm text-slate-500 hover:text-primary"
                      >
                        {segment}
                      </button>
                    </span>
                  ))}
                </div>
                {treeLoading ? (
                  <p className="text-slate-500 text-sm">Loading…</p>
                ) : (
                  <ul className="space-y-1 mb-4">
                    {fileTree.map((entry) => (
                      <li key={entry.path}>
                        {entry.type === 'dir' ? (
                          <button
                            type="button"
                            onClick={() => handleDirClick(entry)}
                            className="flex items-center gap-2 text-left w-full py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-[#253545]"
                          >
                            <span className="text-slate-500">📁</span>
                            <span className="dark:text-white">{entry.name}</span>
                          </button>
                        ) : (
                          <label className="flex items-center gap-2 py-1.5 px-2 rounded hover:bg-slate-100 dark:hover:bg-[#253545] cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedFiles.has(entry.path)}
                              onChange={() => toggleFileSelection(entry)}
                              className="rounded"
                            />
                            <span className="text-slate-500">📄</span>
                            <span className="dark:text-white">{entry.name}</span>
                          </label>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {selectedFiles.size > 0 && (
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleReviewSelected}
                      disabled={reviewLoading}
                      className="px-4 py-2 rounded-lg bg-primary text-white font-medium hover:opacity-90 disabled:opacity-70"
                    >
                      {reviewLoading
                        ? 'Loading…'
                        : `Review selected (${selectedFiles.size})`}
                    </button>
                  </div>
                )}
                {reviewContent && reviewContent.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg bg-slate-100 dark:bg-[#1c2a38]">
                    <p className="text-sm font-medium dark:text-white mb-2">
                      Ready for review ({reviewContent.length} file
                      {reviewContent.length !== 1 ? 's' : ''})
                    </p>
                    <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                      {reviewContent.map((f) => (
                        <li key={f.path}>{f.path}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>
            )}
          </>
        )}

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
          <Link
            href="/"
            className="text-sm text-primary hover:underline"
          >
            ← Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
