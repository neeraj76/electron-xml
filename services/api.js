const axios = require('axios');

const initApi = (baseUrl) => {
  const instance = axios.create({
    baseURL: baseUrl
  });
}

const getResource = (req, callback) => {
  console.log('getResource: Sending axios request')
  axios.post('http://192.168.64.3:9000', req)
      .then(resp => {
        // console.log(resp.data);
        callback(resp.data);
      })
}

module.exports = {
  initApi,
  getResource
}