const { Octokit } = require("@octokit/rest");

exports.handler = async function (event) {
  const headers = {
    'Access-Control-Allow-Origin': 'https://dickymiswardi.github.io', // ✅ Bisa tambahkan Netlify domain jika mau
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  // Tangani preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers,
      body: "Method Not Allowed"
    };
  }

  try {
    const { username, data } = JSON.parse(event.body);
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const octokit = new Octokit({ auth: GITHUB_TOKEN });

    const owner = "dickymiswardi";
    const repo = "tadabbur";
    const path = `data/${username}.json`;
    const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

    let sha;
    try {
      const getResult = await octokit.repos.getContent({ owner, repo, path });
      sha = getResult.data.sha;
    } catch (e) {
      // File belum ada (tidak apa)
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
    console.error('❌ Upload gagal:', err);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: `❌ Gagal: ${err.message}` })
    };
  }
};
