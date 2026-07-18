const jwt = require('jsonwebtoken');

exports.handler = async (event, context) => {
  const secret = process.env.STREAM_SECRET;

  if (!secret) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "STREAM_SECRET not found in environment" }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  const userId = event.queryStringParameters.user_id;

  if (!userId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "user_id query parameter is required" }),
      headers: { 'Content-Type': 'application/json' }
    };
  }

  try {
    // Create Stream JWT
    const token = jwt.sign({ user_id: userId }, secret, { algorithm: 'HS256', noTimestamp: true });
    
    return {
      statusCode: 200,
      body: JSON.stringify({ token }),
      headers: { 'Content-Type': 'application/json' }
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
      headers: { 'Content-Type': 'application/json' }
    };
  }
};
