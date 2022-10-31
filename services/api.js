const axios = require('axios');

const debugAxios = true;

const initApi = (baseUrl) => {
  const instance = axios.create({
    baseURL: baseUrl
  });
}

const tallyApiCall = (req, callback) => {
  if (debugAxios) {
    console.log('getResource: Sending axios request');
    console.log(`req="${req}" type=${typeof req}`);
  }

  return new Promise(function(resolve, reject) {
    axios({
      method: "post",
      url: 'http://192.168.64.3:9000',
      timeout: 1000 * 3,
      data: req
    })
    .then(resp => {
      // console.log(resp.data);
      callback(resp.data, req);
    })
    .catch(err => {
      console.error(err.message);
    });
  });
}

module.exports = {
  initApi,
  tallyApiCall
}