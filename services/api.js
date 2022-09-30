const axios = require('axios');

const debugAxios = false;

const initApi = (baseUrl) => {
  const instance = axios.create({
    baseURL: baseUrl
  });
}

const tallyApiCall = (req, callback) => {
  if (debugAxios) {
    console.log('getResource: Sending axios request');
  }

  axios.post('http://192.168.64.3:9000', req)
      .then(resp => {
        // console.log(resp.data);
        callback(resp.data, req);
      })
}

module.exports = {
  initApi,
  tallyApiCall
}