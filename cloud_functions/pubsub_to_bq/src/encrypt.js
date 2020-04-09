'use strict'
const kms = require('@google-cloud/kms')

const locationId = 'europe-west3'

// [START kms_asymmetric_encrypt]
const encrypt = async(projectId, keyRingId, cryptoKeyId, plaintext) =>{
  // Import the library and create a client

  const client = new kms.KeyManagementServiceClient()

  // The location of the crypto key's key ring, e.g. "global"
  console.log('encriptando')
  const name = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId
  )

  // Encrypts the file using the specified crypto key
  const [ result ] = await client.encrypt({ name, plaintext })

  return Buffer.from(result.ciphertext, 'base64')
}

// [END kms_asymmetric_encrypt]

module.exports = { encrypt }