const axios = require('axios');

const debugAxios = false;
const debugAxiosData = false;

let axiosTallyInstance;
const axiosRequestTimeout = 10000;

const tallyApiInit = (serverAddr) => {
  return new Promise((resolve, reject) => {
    axiosTallyInstance = axios.create({
        baseURL: `http://${serverAddr.host}:${serverAddr.port}`
      });
    resolve(axiosTallyInstance);
  })
}

const tallyApiCall = ({req, timeout=3}) => {
  if (debugAxios) {
    console.log('getResource: Sending axios request');
    if (debugAxiosData) {
      console.log(`req="${req}" type=${typeof req}`);
    }
  }

  return new Promise(function(resolve, reject) {
    if (!axiosTallyInstance) {
      reject('Tally server not initialized');
    }

    axiosTallyInstance({
      method: "post",
      timeout: axiosRequestTimeout * timeout,
      data: req
    })
    .then(resp => {
      // console.log(resp.data);
      resolve(resp.data, req);
    })
    .catch(err => {
      // console.error(err.message);
      reject(err.message);
    });
  });
}

module.exports = {
  tallyApiInit,
  tallyApiCall
}