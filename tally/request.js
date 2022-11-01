const {convertObjToXml, convertXmlToObj} = require("../xml/convert");
const {tallyApiCall} = require("../services/api");

const flagShowReqId = true;
const flagShowRequest = false;
const flagShowResponse = false;
const flagShowXml = false;

const tallyCheckServerBoolean = () => {
  return new Promise(function (resolve,reject) {
    tallyProcessRequestPromise(null, "Check Server")
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
  return tallyProcessRequestPromise(null, "Check Server");
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

const tallyProcessRequestPromise = (requestObj, reqIdStr) => {
  return new Promise((resolve, reject) => {
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

          convertXmlToObj(tallyResponseXmlStr, (err, tallyResponseObj) => {
            if (flagShowResponse) {
              console.log(`Response:\n${JSON.stringify(tallyResponseObj, null, 2)}`);
            }
            const responseObj = {
              status: 'Success',
              tallyResponse: tallyResponseObj,
              requestObj,
              reqIdStr
            }
            resolve(responseObj);
          });
        })
        .catch((error) => {
          console.log(error);
          console.log('Make sure the Tally Application is running and is reachable on the network');
          const errorObj = {
            status: 'Failed',
            reason: 'timeout',
            tallyError: error,
            requestObj,
            reqIdStr
          }
          reject(errorObj);
        });
  })


}


module.exports = {
  tallyProcessRequest,
  tallyProcessRequestPromise,
  tallyCheckServer,
  tallyCheckServerBoolean
}