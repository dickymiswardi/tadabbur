const fetch = require("node-fetch");

// Ambil client ID dan secret dari environment variable Netlify
const clientId = process.env.QURAN_CLIENT_ID;
const clientSecret = process.env.QURAN_CLIENT_SECRET;

// Fungsi timeout untuk fetch
function timeoutFetch(url, options = {}, timeout = 5000) {
  return Promise.race([
    fetch(url, options),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), timeout)
    )
  ]);
}

exports.handler = async function (event) {
  const query = event.queryStringParameters.q;

  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Query kosong" }),
    };
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    // 1. Ambil access token dari API production
    const tokenRes = await timeoutFetch("https://oauth2.quran.foundation/oauth2/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    }, 5000);

    const tokenData = await tokenRes.json();
    const token = tokenData.access_token;

    if (!token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Gagal mendapatkan token" }),
      };
    }

    // 2. Kirim pencarian ke endpoint content production
    const searchRes = await timeoutFetch(
      `https://apis.quran.foundation/content/api/v4/search?q=${encodeURIComponent(query)}&size=10`,
      {
        method: "GET",
        headers: {
          "x-auth-token": token,
          "x-client-id": clientId,
        },
      },
      5000
    );

    const result = await searchRes.json();
    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("❌ Error:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
