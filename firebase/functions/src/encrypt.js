'use strict'

const kms = require('@google-cloud/kms')

// [START kms_encrypt]
const encrypt = async(projectId, keyRingId, cryptoKeyId, plaintext) => {
  // Import the library and create a client
  const client = new kms.KeyManagementServiceClient()

  // The location of the crypto key's key ring
  const locationId = 'europe-west3'

  console.log('Params')
  console.log(`projectId: ${projectId}`)
  console.log(`locationId: ${locationId}`)
  console.log(`keyRingId: ${keyRingId}`)
  console.log(`cryptoKeyId: ${cryptoKeyId}`)

  const name = client.cryptoKeyPath(
    projectId,
    locationId,
    keyRingId,
    cryptoKeyId,
  )

  console.log(`path to key: ${name}`)

  // Encrypts the file using the specified crypto key
  const [ result ] = await client.encrypt({ name, plaintext })

  console.log('Result ciphered ok')

  return Buffer.from(result.ciphertext, 'base64')
}

// [END kms_encrypt]

module.exports = { encrypt }
