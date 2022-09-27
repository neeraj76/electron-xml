const XML = require("xml2js");

const getXmlBuilder = () => {
  return new XML.Builder({headless: true, renderOpts: { pretty: true }});
}

module.exports = {
  getXmlBuilder
}