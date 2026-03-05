import * as cookie from 'cookie';

export default async function handler(req: any, res: any) {
    const code = req.query?.code || req.url?.split('code=')[1]?.split('&')[0];
    if (!code) {
        res.writeHead(400, { 'Content-Type': 'text/plain' });
        res.end('Missing code parameter');
        return;
    }

    const clientId = process.env.GITHUB_CLIENT_ID;
    const clientSecret = process.env.GITHUB_CLIENT_SECRET;

    try {
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
            }),
        });

        const tokenData = await tokenResponse.json();
        if (tokenData.error) {
            res.writeHead(400, { 'Content-Type': 'text/plain' });
            res.end(`GitHub App Error: ${tokenData.error_description}`);
            return;
        }

        const accessToken = tokenData.access_token;

        const serializedCookie = cookie.serialize('gh_pat', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
        });

        res.setHeader('Set-Cookie', serializedCookie);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
    } catch (err: any) {
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error: ' + err.message);
    }
}
