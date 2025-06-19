const fetch = require("node-fetch");

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

  const clientId = "4032fd79-ed9a-4416-966f-8be347967401";
  const clientSecret = "dgjsFbkqFNx9EycbbvS2zaxvKk";
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    // 1. Ambil token
    const tokenRes = await timeoutFetch("https://prelive-oauth2.quran.foundation/oauth2/token", {
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
      console.log("Token tidak didapat:", tokenData);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Gagal dapat token" }),
      };
    }

    // 2. Cari ayat
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
    console.log("Hasil pencarian:", result);

    return {
      statusCode: 200,
      body: JSON.stringify(result),
    };
  } catch (err) {
    console.error("❌ ERROR:", err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};
