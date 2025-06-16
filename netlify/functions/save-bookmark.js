const { Octokit } = require("@octokit/core");
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

exports.handler = async (event) => {
  const username = event.queryStringParameters.username;
  const data = event.body;

  if (!username || !data) {
    return { statusCode: 400, body: "Missing username or data" };
  }

  const octokit = new Octokit({ auth: GITHUB_TOKEN });
  const path = `data/bookmark-${username}.json`;

  let sha = null;
  try {
    const { data: fileData } = await octokit.request("GET /repos/{owner}/{repo}/contents/{path}", {
      owner: "dickymiswardi",
      repo: "tadabbur",
      path
    });
    sha = fileData.sha;
  } catch {}

  await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
    owner: "dickymiswardi",
    repo: "tadabbur",
    path,
    message: `Sync bookmark-${username}.json via Netlify`,
    content: Buffer.from(data).toString("base64"),
    ...(sha && { sha })
  });

  return { statusCode: 200, body: "Bookmark saved successfully" };
};
