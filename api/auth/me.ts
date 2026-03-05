import * as cookie from 'cookie';

export default async function handler(req: any, res: any) {
    const cookies = cookie.parse(req.headers.cookie || '');
    const token = cookies.gh_pat;

    if (!token) {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not authenticated' }));
        return;
    }

    try {
        const userRes = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `token ${token}`,
                Accept: 'application/vnd.github.v3+json',
            },
        });

        if (!userRes.ok) {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid token' }));
            return;
        }

        const user = await userRes.json();

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ user, token }));
    } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
    }
}
