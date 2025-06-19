// netlify/functions/getAudio.js
const fetch = require("node-fetch");

exports.handler = async function (event) {
  const { recitation_id, chapter_number } = JSON.parse(event.body);

  const tokenRes = await fetch("https://prelive-oauth2.quran.foundation/v4/auth/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: "310ab2c2-3140-4dca-8507-a993b4e8d128",
      client_secret: "spvNGTD5tfY7wgCqYclzYRLNPr"
    })
  });

  const { access_token } = await tokenRes.json();

  const audioRes = await fetch(
    `https://prelive-oauth2.quran.foundation/v4/audio/recitation/${recitation_id}/audio_files?chapter_number=${chapter_number}`,
    {
      headers: { Authorization: `Bearer ${access_token}` }
    }
  );

  const data = await audioRes.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
