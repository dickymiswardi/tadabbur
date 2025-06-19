const fetch = require("node-fetch");

exports.handler = async function (event) {
  const query = event.queryStringParameters.q;
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Query kosong" }),
    };
  }

  const clientId = "4032fd79-ed9a-4416-966f-8be347967401";
  const clientSecret = "dgjsFbkqFNx9EycbbvS2zaxvKk";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    // 1. Ambil token
    const tokenRes = await fetch("https://prelive-oauth2.quran.foundation/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Gagal dapat token" }),
      };
    }

    // 2. Gunakan endpoint /content/api/v4/search
    const searchRes = await fetch(
      `https://apis-prelive.quran.foundation/content/api/v4/search?q=${encodeURIComponent(query)}&size=10`,
      {
        method: "GET",
        headers: {
          "x-auth-token": token,
          "x-client-id": clientId,
        },
      }
    );

    const result = await searchRes.json();
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
