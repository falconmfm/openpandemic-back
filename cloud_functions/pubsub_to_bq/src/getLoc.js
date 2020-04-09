const axios = require('axios').default
const path = require('path')
const fs = require('fs-extra')
const { SecretManagerServiceClient } = require('@google-cloud/secret-manager')
const client = new SecretManagerServiceClient()

const getApyKeyFromSecretManager = async() => {
  const [ response ] = await client.accessSecretVersion(
    {
      name: 'projects/au-corona-app-sp/secrets/maps_key/versions/1'
    })
  return response.payload.data.toString()
}

const processData = data => {
  const resp = data.results.reduce((acc, element) => {
    if (element.types[0] === 'postal_code' && !('postal_code' in acc)) {
      acc.postal_code = element.formatted_address
    } else if (element.types[0] === 'neighborhood' && !('neighborhood' in acc)) {
      acc.neighborhood = element.formatted_address
    } else if (element.types[0] === 'political' && !('political' in acc)) {
      acc.political = element.formatted_address
    }
    return acc
  }, {})
  return resp
}

const getLoc = async(lat, lng) => {
  const requestUrl = {
    protocol: 'https',
    hostname: 'maps.googleapis.com',
    pathname: 'maps/api/geocode/json'
  }

  const url = `${requestUrl.protocol}://${requestUrl.hostname}/${requestUrl.pathname}`

  const apiKeyFile = await getApyKeyFromSecretManager()
  try {
    const response = await axios({
      method: 'get',
      url,
      params: {
        latlng: `${lat},${lng}`,
        key: apiKeyFile
      }
    })
    return processData(response.data)
  } catch (error) {
    console.log(error)
    return error
  }
}

module.exports = {
  getLoc
}