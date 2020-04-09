'use strict'
const fs = require('fs')
const {promisify} = require('util')
const kms = require('@google-cloud/kms')

const locationId = 'europe-west3'

// [START kms_decrypt]
const decrypt = async(projectId,  keyRingId,  cryptoKeyId,  ciphertext) => {

  const client = new kms.KeyManagementServiceClient()

  // The location of the crypto key's key ring, e.g. "global"
  const name = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  )

  // Decrypts the file using the specified crypto key
  const [ result ] = await client.decrypt({name, ciphertext})

  return result.plaintext
}

module.exports = {decrypt}