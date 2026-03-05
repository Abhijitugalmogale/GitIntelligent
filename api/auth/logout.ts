import * as cookie from 'cookie';

export default function handler(req: any, res: any) {
    const serializedCookie = cookie.serialize('gh_pat', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: -1,
    });

    res.setHeader('Set-Cookie', serializedCookie);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true }));
}
