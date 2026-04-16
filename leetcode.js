// ============================================================
// GANESH REDDY GUDIBANDI — Terminal Portfolio
// api/leetcode.js  —  Vercel Serverless Function
//
// Proxies LeetCode GraphQL to avoid browser CORS restrictions.
// Endpoint: POST /api/leetcode
// ============================================================

export default async function handler(req, res) {

  // ── CORS headers ─────────────────────────────────────────
  const allowedOrigins = [
    'https://ganeshreddygudibandi.com',
    'http://localhost:3000',
    'http://localhost:5173',
    'http://127.0.0.1:5500',  // Live Server (VS Code)
  ];

  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST')    return res.status(405).json({ error: 'Method not allowed' });

  // ── LeetCode GraphQL query ────────────────────────────────
  const LEETCODE_USERNAME = 'ganesh040';

  const query = `
    query getUserStats($username: String!) {
      matchedUser(username: $username) {
        username
        submitStats {
          acSubmissionNum {
            difficulty
            count
            submissions
          }
        }
        profile {
          ranking
        }
        userCalendar {
          streak
          totalActiveDays
        }
      }
    }
  `;

  try {
    const lcRes = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Referer':      'https://leetcode.com',
        'User-Agent':   'Mozilla/5.0 (compatible; portfolio-proxy/1.0)',
      },
      body: JSON.stringify({
        query,
        variables: { username: LEETCODE_USERNAME },
      }),
    });

    if (!lcRes.ok) throw new Error(`LeetCode responded with ${lcRes.status}`);

    const data = await lcRes.json();
    if (data.errors) throw new Error(data.errors[0]?.message || 'LeetCode GraphQL error');

    const user = data?.data?.matchedUser;
    if (!user) return res.status(404).json({ error: 'LeetCode user not found' });

    const stats = user.submitStats?.acSubmissionNum || [];
    const find  = d => stats.find(s => s.difficulty === d) || { count: 0, submissions: 0 };

    const payload = {
      username:   user.username,
      ranking:    user.profile?.ranking    ?? null,
      streak:     user.userCalendar?.streak ?? 0,
      activeDays: user.userCalendar?.totalActiveDays ?? 0,
      solved: {
        all:    find('All').count,
        easy:   find('Easy').count,
        medium: find('Medium').count,
        hard:   find('Hard').count,
      },
      submissions: {
        all:    find('All').submissions,
        easy:   find('Easy').submissions,
        medium: find('Medium').submissions,
        hard:   find('Hard').submissions,
      },
    };

    // Cache 10 minutes on Vercel edge
    res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300');
    return res.status(200).json(payload);

  } catch (err) {
    console.error('[leetcode proxy error]', err.message);
    return res.status(502).json({
      error:  'Failed to fetch LeetCode data',
      detail: err.message,
    });
  }
}
