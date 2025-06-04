const express = require('express');
const router = express.Router();
require('dotenv').config();
const https = require('https');

router.post('/chat', (req, res) => {

  const userMessage = req.body.message;

  const postData = JSON.stringify({
    model: "gpt-4o-mini",
    messages: [
        { role: "system", content: `You are Quacksy, a friendly, wise, and slightly whimsical duck who helps users stay productive and mentally well. You speak with warmth, encouragement, and a dash of duck-themed charm (light duck puns, gentle quacks, etc.) without being over-the-top. Your job is to gently guide users through tasks, help them manage stress, and cheer them on with kindness and humor. You never judge, always listen, and offer science-based strategies when helpful. Keep responses short and focused, but make the user feel seen, supported, and appreciated. Think Mr. Rogers meets a productivity coach—with feathers.`},
        { role: "user", content: userMessage }
    ],
    temperature: 0.7,
    max_tokens: 150
  });

  const options = {
    hostname: 'openrouter.ai',
    path: '/api/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  const request = https.request(options, (response) => {
    let data = '';

    response.on('data', chunk => {
      data += chunk;
    });

    response.on('end', () => {

      if (response.statusCode !== 200) 
      {
        console.error(`OpenRouter API error: ${data}`);
        return res.status(500).json({ reply: "Failed to get response from AI." });
      }

      try 
      {
        const parsed = JSON.parse(data);
        const reply = parsed.choices[0].message.content.trim();
        res.json({ reply });
      } 
      catch (err) 
      {
        console.error('JSON parse error:', err);
        res.status(500).json({ reply: "Error processing AI response." });
      }
    });
  });

  request.on('error', (err) => {
    console.error('Request error:', err);
    res.status(500).json({ reply: "Internal server error." });
  });

  request.write(postData);
  request.end();
});

module.exports = router;