// File: netlify/functions/searchtruth.js

const fetch = require("node-fetch");
const cheerio = require("cheerio");

exports.handler = async function (event, context) {
  const { keyword = "العرش", chapter = "", translator = "1" } = event.queryStringParameters;

  const searchURL = `https://www.searchtruth.com/search.php?keyword=${encodeURIComponent(
    keyword
  )}&chapter=${chapter}&translator=${translator}&search_word=exact`;

  try {
    const response = await fetch(searchURL);
    const html = await response.text();
    const $ = cheerio.load(html);

    const results = [];

    // Cari semua baris hasil
    $(".QuranData b").each((_, elem) => {
      const ayatText = $(elem).text().trim();
      const next = $(elem).parent().next();
      const surahInfo = next.find("a").text().trim();

      if (ayatText && surahInfo) {
        results.push({
          surahInfo,
          ayat: ayatText
        });
      }
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        query: keyword,
        source: searchURL,
        count: results.length,
        results,
      }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch or parse data.", details: err.message })
    };
  }
};
