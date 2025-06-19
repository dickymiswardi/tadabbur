const fetch = require("node-fetch");

exports.handler = async function (event) {
  try {
    const { recitation_id, chapter_number } = JSON.parse(event.body);

    // ✅ Minta access token
    const tokenRes = await fetch("https://prelive-oauth2.quran.foundation/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: process.env.CLIENT_ID,
        client_secret: process.env.CLIENT_SECRET
      })
    });

    // ✅ Debug log isi mentah respons token
    const raw = await tokenRes.text();
    console.log("TOKEN RESPONSE RAW:", raw);

    const tokenData = JSON.parse(raw);
    const accessToken = tokenData.access_token;

    // ✅ Ambil data audio file
    const audioRes = await fetch(
      `https://prelive-oauth2.quran.foundation/v4/audio/recitation/${recitation_id}/audio_files?chapter_number=${chapter_number}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` }
      }
    );

    const audioData = await audioRes.json();

    return {
      statusCode: 200,
      body: JSON.stringify(audioData)
    };
  } catch (err) {
    console.error("❌ ERROR:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal error" })
    };
  }
};
