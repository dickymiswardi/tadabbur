const fetch = require("node-fetch");

exports.handler = async function (event) {
  const { query } = JSON.parse(event.body);

  const res = await fetch(`https://api.quran.com/v4/search?q=${encodeURIComponent(query)}&language=id&size=50`);
  const data = await res.json();

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
