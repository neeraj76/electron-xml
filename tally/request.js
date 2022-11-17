const {convertObjToXml, convertXmlToObj} = require("../xml/convert");
const {tallyApiCall} = require("../services/api");

const flagShowKeepAlive = false;
const flagShowRequest = false;
const flagShowResponse = false;
const flagShowXml = false;

const tallyCheckServerBoolean = () => {
  return new Promise(function (resolve,reject) {
    tallyProcessRequestPromise(null)
        .then(response => {
          console.log(`tallyCheckServerPromise: ${JSON.stringify(response)}`)
          resolve(true);
        })
        .catch(error => {
          console.error(`tallyCheckServerPromise: ${JSON.stringify(error)}`);
          resolve(false);
        })
  });
}

const tallyCheckServer = () => {
  return tallyProcessRequestPromise(null);
}

const tallyProcessRequestPromise = (requestObj) => {
  return new Promise((resolve, reject) => {
    if (flagShowRequest) {
      if (requestObj != null || flagShowKeepAlive) {
        console.log(JSON.stringify(requestObj, null, 2));
      }
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

          convertXmlToObj(tallyResponseXmlStr, (err, tallyResponseObj) => {
            if (flagShowResponse) {
              console.log(`Response:\n${JSON.stringify(tallyResponseObj, null, 2)}`);
            }

            const responseObj = {
              status: 'Success',
              tallyResponse: tallyResponseObj,
              requestObj
            }
            resolve(responseObj);
          });
        })
        .catch((error) => {
          console.log("tallyProcessRequestPromise", error);
          console.log('Make sure the Tally Application is running and is reachable on the network');
          const errorObj = {
            status: 'Failed',
            reason: 'timeout',
            tallyError: error,
            requestObj
          }
          reject(errorObj);
        });
  })


}


module.exports = {
  tallyProcessRequestPromise,
  tallyCheckServer,
  tallyCheckServerBoolean
}