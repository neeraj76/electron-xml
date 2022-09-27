const XML = require("xml2js");

let xmlBuilder;

const convertObjToXml = (obj) => {
  if (xmlBuilder == undefined) {
    xmlBuilder = new XML.Builder({headless: true, renderOpts: { pretty: true }});
  }

  return xmlBuilder.buildObject(obj)
}

const convertXmlToObj = (xml, callback) => {
  XML.parseString(xml, (err, result) => {
    callback(err, result)
  });

  // return {'RESPONSE': 'response'}
}

module.exports = {
  convertObjToXml,
  convertXmlToObj
}