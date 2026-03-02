import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
    getAuthenticatedUser,
    getUserRepos,
    getUserPullRequests,
    getUserIssues,
    getRepoDetails,
    getRepoIssues,
    getRepoContributors,
    searchPRsAndIssues,
} from "@/services/githubApi";

// ─── Current User ─────────────────────────────────────────────────────────────

export function useCurrentUser() {
    const { token } = useAuth();
    return useQuery({
        queryKey: ["github", "user", token],
        queryFn: () => getAuthenticatedUser(token!),
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
    });
}

// ─── Repositories ─────────────────────────────────────────────────────────────

export function useRepositories() {
    const { token } = useAuth();
    return useQuery({
        queryKey: ["github", "repos", token],
        queryFn: () => getUserRepos(token!),
        enabled: !!token,
        staleTime: 5 * 60 * 1000,
    });
}

// ─── Pull Requests ────────────────────────────────────────────────────────────

export function usePullRequests() {
    const { token, user } = useAuth();
    return useQuery({
        queryKey: ["github", "prs", token, user?.login],
        queryFn: () => getUserPullRequests(token!, user!.login),
        enabled: !!token && !!user?.login,
        staleTime: 2 * 60 * 1000,
        refetchInterval: 5 * 60 * 1000, // auto-poll every 5 minutes
        refetchIntervalInBackground: true,
    });
}

// ─── Issues ───────────────────────────────────────────────────────────────────

export function useIssues() {
    const { token, user } = useAuth();
    return useQuery({
        queryKey: ["github", "issues", token, user?.login],
        queryFn: () => getUserIssues(token!, user!.login),
        enabled: !!token && !!user?.login,
        staleTime: 2 * 60 * 1000,
    });
}

// ─── Dashboard Stats (derived) ────────────────────────────────────────────────

export function useStats() {
    const prsQuery = usePullRequests();
    const issuesQuery = useIssues();

    const prs = prsQuery.data ?? [];
    const issues = issuesQuery.data ?? [];

    const openPRs = prs.filter((pr) => pr.prStatus === "open").length;
    const mergedPRs = prs.filter((pr) => pr.prStatus === "merged").length;
    const closedPRs = prs.filter((pr) => pr.prStatus === "closed").length;
    const openIssues = issues.filter((i) => i.state === "open").length;
    const closedIssues = issues.filter((i) => i.state === "closed").length;

    const score = Math.min(100, Math.round(mergedPRs * 3 + openPRs + closedIssues * 0.5));

    return {
        isLoading: prsQuery.isLoading || issuesQuery.isLoading,
        isError: prsQuery.isError || issuesQuery.isError,
        stats: {
            openPRs,
            mergedPRs,
            closedPRs,
            openIssues,
            closedIssues,
            totalPRs: prs.length,
            score,
        },
    };
}

// ─── Repo Explorer ────────────────────────────────────────────────────────────

export function useRepoDetails(owner: string, repo: string) {
    const { token } = useAuth();
    return useQuery({
        queryKey: ["github", "repo", owner, repo],
        queryFn: () => getRepoDetails(token!, owner, repo),
        enabled: !!token && !!owner && !!repo,
        staleTime: 2 * 60 * 1000,
        retry: false,
    });
}

export function useRepoIssues(owner: string, repo: string, state: "open" | "closed" | "all" = "open") {
    const { token } = useAuth();
    return useQuery({
        queryKey: ["github", "repo-issues", owner, repo, state],
        queryFn: () => getRepoIssues(token!, owner, repo, state),
        enabled: !!token && !!owner && !!repo,
        staleTime: 2 * 60 * 1000,
        retry: false,
    });
}

export function useRepoContributors(owner: string, repo: string) {
    const { token } = useAuth();
    return useQuery({
        queryKey: ["github", "repo-contributors", owner, repo],
        queryFn: () => getRepoContributors(token!, owner, repo),
        enabled: !!token && !!owner && !!repo,
        staleTime: 5 * 60 * 1000,
        retry: false,
    });
}

// ─── Global Search ────────────────────────────────────────────────────────────

export function useSearch(query: string) {
    const { token, user } = useAuth();
    return useQuery({
        queryKey: ["github", "search", query, user?.login],
        queryFn: () => searchPRsAndIssues(token!, user!.login, query),
        enabled: !!token && !!user?.login && query.trim().length >= 2,
        staleTime: 30 * 1000,
        retry: false,
    });
}

