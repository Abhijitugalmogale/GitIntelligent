## Setup GitHub OAuth (Local Development)

1. Go to [GitHub Developer Settings](https://github.com/settings/developers) -> OAuth Apps -> New OAuth App
2. Set **Homepage URL** to `http://localhost:8080`
3. Set **Authorization callback URL** to `http://localhost:8080/auth/callback`
4. Copy the Client ID and Client Secret
5. Duplicate `.env.example` as `.env.local` and paste the credentials:
   ```env
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   ```
6. Run `npm run api` and `npm run dev` concurrently (or use `npx concurrently "npm run dev" "npm run api"`).
