exports.handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const data = JSON.parse(event.body);
    const { appId, contents, headings, include_player_ids } = data;

    const restApiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!restApiKey) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Missing ONESIGNAL_REST_API_KEY in Netlify environment variables' })
      };
    }

    const payload = {
      app_id: appId,
      contents: contents || { en: "Notification" },
      headings: headings || { en: "Notice" }
    };

    if (include_player_ids && include_player_ids.length > 0) {
      payload.include_player_ids = include_player_ids;
    } else {
      payload.included_segments = ["Subscribers"];
    }

    // Await מלא לבקשה מול OneSignal
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Basic ${restApiKey}`
      },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    return {
      statusCode: response.status,
      headers,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: error.message })
    };
  }
};
