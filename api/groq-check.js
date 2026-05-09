module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.statusCode = 405;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ allowed: true, fallback: true }));
    return;
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
    const message = String(body.message || '').slice(0, 500);

    const upstream = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192',
        temperature: 0,
        max_tokens: 40,
        messages: [
          {
            role: 'system',
            content: 'You moderate a game chat. Reply only with JSON like {"allowed":true,"reason":"ok"} or {"allowed":false,"reason":"spam/offensive"}.'
          },
          {
            role: 'user',
            content: JSON.stringify({
              type: body.type || 'chat_moderation',
              username: body.username || 'guest',
              message
            })
          }
        ]
      })
    });

    const payload = await upstream.json();
    const content = payload?.choices?.[0]?.message?.content || '';

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { allowed: true, reason: 'unparsed_response' };
    }

    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({
      allowed: parsed.allowed !== false,
      reason: parsed.reason || 'ok'
    }));
  } catch (error) {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ allowed: true, fallback: true }));
  }
};
