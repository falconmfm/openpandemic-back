const { PubSub } = require('@google-cloud/pubsub')
const { encrypt } = require('./encrypt')

const publishMessage = async(data, backProjectPubSubConfiguration) => {
  const pubsubClient = new PubSub(backProjectPubSubConfiguration)
  console.log('pre-encript')
  const encData = await encrypt(
    backProjectPubSubConfiguration.projectId,
    backProjectPubSubConfiguration.keyRingId,
    backProjectPubSubConfiguration.cryptoKeyId,
    data,
  )
  console.log('post-encript')
  const dataBuffer = Buffer.from(encData)
  const messageId = await pubsubClient
    .topic(backProjectPubSubConfiguration.topicName)
    .publish(dataBuffer)
  return messageId
}

module.exports = { publishMessage }
