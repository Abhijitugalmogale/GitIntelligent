export default function handler(req: any, res: any) {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: "Missing GITHUB_CLIENT_ID in environment" }));
        return;
    }

    const scope = "repo%20read:user";
    const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=${scope}`;

    res.writeHead(302, { Location: url });
    res.end();
}
