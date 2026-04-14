const Anthropic = require('@anthropic-ai/sdk');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers };

  try {
    const body = JSON.parse(event.body);
    const { prompt, fileBase64, fileType } = body;

    if (!prompt) {
      return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing prompt' }) };
    }

    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    let messages;

    // If a file is attached, send as document/image
    if (fileBase64 && fileType) {
      let mediaType;
      let contentType;

      if (fileType === 'pdf') {
        mediaType = 'application/pdf';
        contentType = 'document';
      } else {
        // For docx, send as text extraction request without file
        // Just use the prompt directly
        messages = [{ role: 'user', content: prompt }];
      }

      if (fileType === 'pdf') {
        messages = [{
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'base64',
                media_type: mediaType,
                data: fileBase64
              }
            },
            { type: 'text', text: prompt }
          ]
        }];
      }
    } else {
      messages = [{ role: 'user', content: prompt }];
    }

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages
    });

    const text = response.content
      .filter(block => block.type === 'text')
      .map(block => block.text)
      .join('');

    return {
      statusCode: 200,
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    };

  } catch (err) {
    console.error('Error:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: err.message })
    };
  }
};
