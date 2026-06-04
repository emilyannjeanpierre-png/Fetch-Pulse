export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' });

  const { mode, dateRange, trend, pastedReport } = req.body;

  const week = dateRange || getWeekRange();

  const systemPrompt = `You are a senior consumer insights analyst writing for Fetch — a rewards and shopping app used by Gen Z and Millennials. Fetch cares deeply about consumer behavior, spending habits, retail trends, food, beauty, wellness, and viral commerce moments.

Rules:
- Use REAL, CURRENT events from the last 7 days found via web search
- Include specific brand names, products, data — never generic
- Written for leadership, marketing, and consumer insights audience
- Slack mrkdwn formatting: *bold*, bullets with •
- Avoid: celebrity gossip, politics, entertainment without spending implications`;

  let userPrompt = '';

  if (mode === 'pulse') {
    userPrompt = `Write the Consumer Culture Pulse for the week of ${week}.

Search the web for real current examples from the last 7 days across: TikTok trending products and behaviors, Reddit consumer discussions, Netflix Top 10 and major launches, retail and brand news, viral internet culture with commerce implications, food and beverage trends, beauty and wellness, emerging Gen Z and Millennial cultural movements.

Format EXACTLY as:

🔥 *CONSUMER CULTURE PULSE*
_Week of ${week} | Leadership, Marketing & Consumer Insights_

⚡ *TL;DR*
• [takeaway 1]
• [takeaway 2]
• [takeaway 3]

---

📈 *TOP TRENDS*

*1. [Punchy headline]*
*What happened:* [specific brands/data, 1-2 sentences]
*Why it matters:* [consumer behavior implication]
*Who's driving it:* [Gen Z / Millennials / both — specific]
*Why Fetch should care:* [tie to rewards, shopping, Fetch users]

*2. [Headline]*
[same structure]

*3. [Headline]*
[same structure]

*4. [Headline]*
[same structure]

*5. [Headline]*
[same structure]

---

👥 *GEN Z SIGNAL*
[1-2 sentences, specific behavior shift this week]

👨‍👩‍👧 *MILLENNIAL SIGNAL*
[1-2 sentences, specific behavior shift this week]

---

💡 *WHAT BRANDS SHOULD WATCH*
• [observation 1]
• [observation 2]
• [observation 3]

🔮 *WATCH LIST* — on our radar for next week
• [trend 1]
• [trend 2]
• [trend 3]

---

❓ *FAST BY FETCH — VALIDATION QUESTIONS*
_Prompt these directly into Fast by Fetch to validate against internal data_

*Q1 — [Trend name]:* [Specific, data-answerable question about redemptions/offer clicks/category performance]
*Q2 — [Trend name]:* [question]
*Q3 — [Trend name]:* [question]
*Q4 — [Trend name]:* [question]
*Q5 — [Trend name]:* [question]`;

  } else if (mode === 'deepdive') {
    userPrompt = `Do a deep-dive consumer trend brief on: "${trend}"

Write for the Fetch insights team. Cover:
- What's driving this trend right now (search the web for current data)
- Which demographics and why
- Specific brands, products, creators involved
- Commerce and spending implications — what are people actually buying?
- How long it's likely to last (flash trend vs. sustained shift)
- 3 specific ways Fetch could activate against it (offers, categories, brand partners)
- 5 Fast by Fetch questions to validate it against internal data

Format cleanly with bold headers. Be specific — data, brand names, dollar figures where available.`;

  } else if (mode === 'questions') {
    userPrompt = `Based on this Consumer Culture Pulse report, generate 5 precise Fast by Fetch validation questions the insights team can use to cross-reference each trend against Fetch internal data (redemptions, offer clicks, category performance, brand trends).

Each question should:
- Reference the actual trend/brand/category from the pulse
- Be specific and answerable by a data tool
- Suggest what signal to look for

Format as:
*Q1 — [Trend]:* [Question]
*Q2 — [Trend]:* [Question]
*Q3 — [Trend]:* [Question]
*Q4 — [Trend]:* [Question]
*Q5 — [Trend]:* [Question]

Here is the pulse report:
${pastedReport}`;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
        tools: [{ type: 'web_search_20250305', name: 'web_search' }]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });

    const text = data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('\n');

    res.status(200).json({ result: text });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

function getWeekRange() {
  const d = new Date(), s = new Date(d);
  s.setDate(d.getDate() - 7);
  const f = x => x.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  return `${f(s)} – ${f(d)}`;
}
