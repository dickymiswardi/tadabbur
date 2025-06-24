const { Octokit } = require("@octokit/rest");

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { username, data } = JSON.parse(event.body);
  const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
  const octokit = new Octokit({ auth: GITHUB_TOKEN });

  const owner = "dickymiswardi"; // Ganti sesuai akunmu
  const repo = "tadabbur";       // Ganti sesuai repo
  const path = `data/${username}.json`;

  const content = Buffer.from(JSON.stringify(data, null, 2)).toString("base64");

  try {
    let sha;
    try {
      const { data } = await octokit.repos.getContent({ owner, repo, path });
      sha = data.sha;
    } catch {}

    await octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path,
      message: `Sync data for ${username}`,
      content,
      sha,
    });

    return { statusCode: 200, body: "✅ Disimpan ke Cloud!" };
  } catch (err) {
    return { statusCode: 500, body: `❌ Gagal: ${err.message}` };
  }
};
