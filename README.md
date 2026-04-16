# Ganesh Reddy Gudibandi — Terminal Portfolio

Retro CRT terminal-style portfolio website. Green on black. Built to deploy on Vercel.

## File Structure

```
portfolio/
├── index.html          # Main HTML — all sections
├── style.css           # CRT styles, animations, layout
├── main.js             # Nav, skills, GitHub API, LeetCode
├── api/
│   └── leetcode.js     # Vercel serverless proxy for LeetCode
└── README.md
```

## Local Development

Just open `index.html` in a browser — no build step needed.

For LeetCode live data locally, use VS Code Live Server (port 5500 is already whitelisted in the proxy) or:

```bash
npx serve .
```

## Deploy to Vercel

1. Push this folder to a GitHub repo
2. Go to [vercel.com](https://vercel.com) → New Project → import the repo
3. Vercel auto-detects the `/api` folder and deploys `leetcode.js` as a serverless function
4. That's it — no build config needed for a static site

```bash
# Or deploy via CLI
npm i -g vercel
vercel
```

## GitHub API

- Calls `api.github.com` directly from the browser
- Works on your live domain with no auth (60 req/hr unauthenticated)
- To increase to 5000 req/hr: create a GitHub Personal Access Token and add it as a Vercel env variable, then pass it in the `Authorization` header in `main.js`

```js
// main.js — optional GitHub token
fetch(`https://api.github.com/users/${GITHUB_USER}`, {
  headers: { 'Authorization': `token ${process.env.GITHUB_TOKEN}` }
})
```

## LeetCode Proxy

- Browser can't call LeetCode GraphQL directly (CORS blocked)
- `/api/leetcode.js` runs server-side on Vercel and proxies the call
- Response is cached for 10 minutes at the edge
- If proxy fails, `main.js` falls back to static last-known values (43 solved)

## Customisation

| What                  | Where               |
|-----------------------|---------------------|
| Your info / bullets   | `index.html`        |
| Colors / fonts        | `style.css`         |
| Skills + percentages  | `main.js` → `skillGroups` array |
| Project cards         | `index.html` → `#projects` section |
| GitHub username       | `main.js` → `GITHUB_USER` constant |
| LeetCode username     | `api/leetcode.js` → `LEETCODE_USERNAME` constant |

## Adding a GitHub Token (optional)

1. Go to GitHub → Settings → Developer Settings → Personal Access Tokens → Fine-grained
2. Create token with `read:user` and `public_repo` scopes
3. In Vercel dashboard → Project → Settings → Environment Variables → add `GITHUB_TOKEN`
4. In `main.js`, update the fetch calls to include the header above
