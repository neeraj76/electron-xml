const {convertObjToXml, convertXmlToObj} = require("../xml/convert");
const {tallyApiCall} = require("../services/api");

const flagShowReqId = true;
const flagShowRequest = false;
const flagShowResponse = false;
const flagShowXml = false;

const parseServerCheckResponse = (response, callback) => {
  console.log(`parseServerCheckResponse: ${response}`);
  return {status: 'Active'};
}

const tallyCheckServer = () => {

  return new Promise(function (resolve,reject) {

    try {
      tallyProcessRequest(null,
          (response) => resolve(parseServerCheckResponse(response)),
          "Check Server");
    } catch (e) {
      reject(e);
    }
  });

  // return tallyApiCall({req: "", timeout:4});
}

const tallyProcessRequest = (requestObj, callback, reqIdStr) => {
  if (flagShowReqId) {
    console.log(`tallyProcessRequest: req='${reqIdStr}'`);
  }

  if (flagShowRequest) {
    console.log(JSON.stringify(requestObj, null, 2));
  }

  // We get an error if there is a space in the Columns name
  let requestXmlStr = "";
  if (requestObj !== null) {
    requestXmlStr = convertObjToXml(requestObj);
    if (flagShowRequest && flagShowXml) {
      console.log(`Request:\n${requestXmlStr}`)
    }
  }

  tallyApiCall({req: requestXmlStr})
      .then((tallyResponseXmlStr) => {
        if (flagShowResponse && flagShowXml) {
          console.log(`Response:\n${tallyResponseXmlStr}`);
        }

        if (tallyResponseXmlStr !== undefined) {
          convertXmlToObj(tallyResponseXmlStr, (err, tallyResponseObj) => {
            if (flagShowResponse) {
              console.log(`Response:\n${JSON.stringify(tallyResponseObj, null, 2)}`);
            }
            if (tallyResponseObj !== undefined) {
              const responseObj = {
                status: 'Success',
                tallyResponseObj
              }
              callback(responseObj, requestObj, reqIdStr);
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
        console.log('Make sure the Tally Application is running and is reachable on the network');
        // throw err;
      });
}

module.exports = {
  tallyProcessRequest,
  tallyCheckServer
}