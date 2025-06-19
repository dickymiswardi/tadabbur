const fetch = require("node-fetch");

exports.handler = async function (event) {
  const { query } = JSON.parse(event.body);

  

  return {
    statusCode: 200,
    body: JSON.stringify(data)
  };
};
