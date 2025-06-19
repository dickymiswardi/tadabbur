const fetch = require("node-fetch");

exports.handler = async function (event) {
  const { recitation_id, chapter_number } = JSON.parse(event.body);

  const tokenRes = await fetch("https://prelive-oauth2.quran.foundation/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET
    })
  });

  const tokenData = await tokenRes.json();

  const audioRes = await fetch(
    `https://prelive-oauth2.quran.foundation/v4/audio/recitation/${recitation_id}/audio_files?chapter_number=${chapter_number}`,
    {
      headers: { Authorization: `Bearer ${tokenData.access_token}` }
    }
  );

  const audioData = await audioRes.json();

  return {
    statusCode: 200,
    body: JSON.stringify(audioData)
  };
};
