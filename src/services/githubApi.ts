const BASE_URL = "https://api.github.com";

function headers(token: string) {
  return {
    Authorization: `token ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface GitHubUser {
  login: string;
  name: string | null;
  avatar_url: string;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  html_url: string;
  private: boolean;
  updated_at: string;
}

export interface GitHubPR {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  merged_at: string | null;
  created_at: string;
  updated_at: string;
  html_url: string;
  repository_url: string;
  /** Derived from repository_url */
  repo: string;
  /** Derived: open | merged | closed */
  prStatus: "open" | "merged" | "closed";
  additions: number;
  deletions: number;
  draft: boolean;
  user: { login: string; avatar_url: string };
  pull_request?: { merged_at: string | null };
}

export interface GitHubIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
  html_url: string;
  repository_url: string;
  /** Derived from repository_url */
  repo: string;
  labels: { name: string; color: string }[];
  pull_request?: object; // present only if it's really a PR — we filter these out
}

export interface GitHubSearchResult<T> {
  total_count: number;
  items: T[];
}

// ─── API calls ─────────────────────────────────────────────────────────────────

/** Validate token & get user profile */
export async function getAuthenticatedUser(token: string): Promise<GitHubUser> {
  const res = await fetch(`${BASE_URL}/user`, { headers: headers(token) });
  if (res.status === 401) throw new Error("Invalid token. Please check your Personal Access Token.");
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

/** Get all repos the authenticated user has access to (own + collab) */
export async function getUserRepos(token: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  while (true) {
    const res = await fetch(
      `${BASE_URL}/user/repos?affiliation=owner,collaborator&sort=updated&per_page=100&page=${page}`,
      { headers: headers(token) }
    );
    if (!res.ok) throw new Error(`Failed to fetch repos: ${res.status}`);
    const data: GitHubRepo[] = await res.json();
    repos.push(...data);
    if (data.length < 100) break;
    page++;
  }
  return repos;
}

/** Get pull requests authored by the user via search API */
export async function getUserPullRequests(
  token: string,
  username: string,
  state: "open" | "closed" | "all" = "all"
): Promise<GitHubPR[]> {
  const stateQuery = state === "all" ? "" : `+state:${state}`;
  const res = await fetch(
    `${BASE_URL}/search/issues?q=type:pr+author:${username}${stateQuery}&sort=updated&per_page=50`,
    { headers: headers(token) }
  );
  if (!res.ok) throw new Error(`Failed to fetch pull requests: ${res.status}`);
  const data: GitHubSearchResult<GitHubPR> = await res.json();

  return data.items.map((item) => ({
    ...item,
    repo: repoNameFromUrl(item.repository_url),
    prStatus: item.pull_request?.merged_at
      ? "merged"
      : item.state === "open"
        ? "open"
        : "closed",
    additions: 0,
    deletions: 0,
  }));
}

/** Get issues authored by the user (filters out PRs) */
export async function getUserIssues(
  token: string,
  username: string
): Promise<GitHubIssue[]> {
  const res = await fetch(
    `${BASE_URL}/search/issues?q=type:issue+author:${username}&sort=updated&per_page=50`,
    { headers: headers(token) }
  );
  if (!res.ok) throw new Error(`Failed to fetch issues: ${res.status}`);
  const data: GitHubSearchResult<GitHubIssue> = await res.json();

  return data.items
    .filter((item) => !item.pull_request) // exclude PRs that sneak in
    .map((item) => ({
      ...item,
      repo: repoNameFromUrl(item.repository_url),
    }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert https://api.github.com/repos/owner/name → "owner/name" */
function repoNameFromUrl(url: string): string {
  const match = url.match(/repos\/(.+)$/);
  return match ? match[1] : url;
}

/** Format absolute date → relative string ("2h ago", "3d ago", etc.) */
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

// ─── Repo Explorer ─────────────────────────────────────────────────────────────

export interface RepoDetails {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  open_issues_count: number;
  topics: string[];
  visibility: string;
  default_branch: string;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  size: number;
  license: { name: string; spdx_id: string } | null;
  owner: { login: string; avatar_url: string; html_url: string; type: string };
  private: boolean;
  archived: boolean;
  fork: boolean;
  subscribers_count?: number;
  network_count?: number;
}

export interface RepoIssue {
  id: number;
  number: number;
  title: string;
  state: "open" | "closed";
  html_url: string;
  created_at: string;
  updated_at: string;
  labels: { name: string; color: string }[];
  user: { login: string; avatar_url: string };
  comments: number;
  pull_request?: object;
  body: string | null;
}

export interface RepoContributor {
  login: string;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

/**
 * Parse a GitHub repo URL or "owner/repo" string.
 * Returns { owner, repo } or throws if invalid.
 */
export function parseRepoInput(input: string): { owner: string; repo: string } {
  const trimmed = input.trim();
  // Full URL: https://github.com/owner/repo or https://github.com/owner/repo/...
  const urlMatch = trimmed.match(/github\.com\/([^/]+)\/([^/?#]+)/);
  if (urlMatch) return { owner: urlMatch[1], repo: urlMatch[2].replace(/\.git$/, "") };
  // Short form: owner/repo
  const shortMatch = trimmed.match(/^([^/]+)\/([^/]+)$/);
  if (shortMatch) return { owner: shortMatch[1], repo: shortMatch[2].replace(/\.git$/, "") };
  throw new Error("Invalid input. Use a GitHub URL or \"owner/repo\" format.");
}

export async function getRepoDetails(token: string, owner: string, repo: string): Promise<RepoDetails> {
  const res = await fetch(`${BASE_URL}/repos/${owner}/${repo}`, { headers: headers(token) });
  if (res.status === 404) throw new Error(`Repository "${owner}/${repo}" not found.`);
  if (res.status === 403) throw new Error("Rate limited or access denied.");
  if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);
  return res.json();
}

export async function getRepoIssues(
  token: string,
  owner: string,
  repo: string,
  state: "open" | "closed" | "all" = "open",
  perPage = 30
): Promise<RepoIssue[]> {
  const res = await fetch(
    `${BASE_URL}/repos/${owner}/${repo}/issues?state=${state}&per_page=${perPage}&sort=updated`,
    { headers: headers(token) }
  );
  if (!res.ok) throw new Error(`Failed to fetch issues: ${res.status}`);
  const data: RepoIssue[] = await res.json();
  // Filter out pull requests (GitHub returns them in /issues endpoint too)
  return data.filter((i) => !i.pull_request);
}

export async function getRepoContributors(
  token: string,
  owner: string,
  repo: string,
  perPage = 30
): Promise<RepoContributor[]> {
  const res = await fetch(
    `${BASE_URL}/repos/${owner}/${repo}/contributors?per_page=${perPage}&anon=false`,
    { headers: headers(token) }
  );
  if (res.status === 204) return []; // empty repo
  if (!res.ok) throw new Error(`Failed to fetch contributors: ${res.status}`);
  return res.json();
}

// ─── Global Search ─────────────────────────────────────────────────────────────

export interface SearchResults {
  prs: GitHubPR[];
  issues: GitHubIssue[];
  totalPRs: number;
  totalIssues: number;
}

/**
 * Search user's PRs and issues by keyword using GitHub search API.
 */
export async function searchPRsAndIssues(
  token: string,
  username: string,
  query: string
): Promise<SearchResults> {
  const q = encodeURIComponent(query.trim());
  const [prRes, issueRes] = await Promise.all([
    fetch(`${BASE_URL}/search/issues?q=${q}+type:pr+author:${username}&per_page=20&sort=updated`, { headers: headers(token) }),
    fetch(`${BASE_URL}/search/issues?q=${q}+type:issue+author:${username}&per_page=20&sort=updated`, { headers: headers(token) }),
  ]);

  const prData: GitHubSearchResult<GitHubPR> = prRes.ok ? await prRes.json() : { total_count: 0, items: [] };
  const issueData: GitHubSearchResult<GitHubIssue> = issueRes.ok ? await issueRes.json() : { total_count: 0, items: [] };

  return {
    prs: prData.items.map((item) => ({
      ...item,
      repo: repoNameFromUrl(item.repository_url),
      prStatus: item.pull_request?.merged_at ? "merged" : item.state === "open" ? "open" : "closed",
      additions: 0,
      deletions: 0,
    })),
    issues: issueData.items.filter((i) => !i.pull_request).map((item) => ({
      ...item,
      repo: repoNameFromUrl(item.repository_url),
    })),
    totalPRs: prData.total_count,
    totalIssues: issueData.total_count,
  };
}

