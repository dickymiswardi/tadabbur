const { Octokit } = require("@octokit/rest");

exports.handler = async function(event) {
  const headers = {
    "Access-Control-Allow-Origin": "*", // ⚠ Saat production, ganti ke domain Anda untuk keamanan
    "Access-Control-Allow-Headers": "Content-Type"
  };

  // Tangani preflight OPTIONS
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers,
      body: ""
    };
  }

  // Hanya izinkan POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  try {
    const { username, data } = JSON.parse(event.body || "{}");

    if (!username || !/^[a-z0-9_-]+$/.test(username)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "❌ Username tidak valid" })
      };
    }

    if (!data) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: "❌ Data tidak ada" })
      };
    }

    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    if (!GITHUB_TOKEN) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: "❌ GITHUB_TOKEN tidak tersedia di server" })
      };
    }

    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    const owner = "dickymiswardi";
    const repo = "tadabbur";
    const path = `data/${username}.json`;
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    let sha;
    try {
      const res = await octokit.repos.getContent({ owner, repo, path });
      sha = res.data.sha;
    } catch (e) {
      // File belum ada → sha undefined, tidak masalah
    }

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Sync data for ${username}`,
      content,
      sha
    });

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: "✅ Disimpan ke Cloud!" })
    };

  } catch (err) {
    console.error("❌ Upload error:", err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `❌ Gagal: ${err.message}` })
    };
  }
};
