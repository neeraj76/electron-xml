const Convert = require("xml2js");

let xmlBuilder;

const convertObjToXml = (obj) => {
  if (xmlBuilder == undefined) {
    xmlBuilder = new Convert.Builder({headless: true, renderOpts: { pretty: true }});
  }

  let xml = "";
  try {
    xml = xmlBuilder.buildObject(obj);
  } catch (e) {
    console.error(e.message);
    console.error(`obj=${JSON.stringify(obj)}`);
  }

  return xml;
}

const convertXmlToObj = (xml, callback) => {
  Convert.parseString(xml, (err, result) => {
    callback(err, result)
  });

  // return {'RESPONSE': 'response'}
}

module.exports = {
  convertObjToXml,
  convertXmlToObj
}