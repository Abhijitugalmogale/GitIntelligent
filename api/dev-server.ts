import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

import githubHandler from './auth/github';
import callbackHandler from './auth/callback';
import meHandler from './auth/me';
import logoutHandler from './auth/logout';

const app = express();

app.use(cors({
    origin: 'http://localhost:8080',
    credentials: true
}));

app.get('/api/auth/github', githubHandler);
app.get('/api/auth/callback', callbackHandler);
app.get('/api/auth/me', meHandler);
app.post('/api/auth/logout', logoutHandler);
// also allow GET logout just in case
app.get('/api/auth/logout', logoutHandler);

app.listen(3001, () => {
    console.log('API dev server running on http://localhost:3001');
});
