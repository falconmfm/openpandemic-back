const admin = require('firebase-admin')
const { google } = require('googleapis')
const { publishMessage } = require('./publishMessage')

admin.initializeApp()

const getBackProjectConfiguration = async() => {
  const projectId = await google.auth.getProjectId()
  return {
    projectId: `${projectId}-sp`,
    topicName: `projects/${projectId}-sp/topics/new_diagnostic`,
    keyRingId: 'crypto-key',
    cryptoKeyId: 'corona-key',
  }
}

const callbackMessage = async(change, context) => {
  const { personId, testId } = context.params
  console.log(`The params is ${JSON.stringify(context.params, null, 2)}`)

  const person = await admin.firestore()
    .collection('person').doc(personId).get()

  console.log(`PersonId from DB: ${person.id}`)
  const personData = person.data()
  const pubsubElement = {
    personId,
    clinical_data: personData['clinical-data'],
    personal_data: personData['personal-data'],
    test: change.after.data(),
  }
  pubsubElement.test.id = testId

  const pubSubMessageString = JSON.stringify(pubsubElement)
  console.log('Stringing the object to pass to PubSub')
  const pubSubMessage = Buffer.from(pubSubMessageString).toString('base64')
  console.log('Publishing element')
  const backProjectPubSubConfiguration = await getBackProjectConfiguration()
  const messageId = await publishMessage(pubSubMessage, backProjectPubSubConfiguration)
  console.log(`Published with executionId: ${messageId}`)
  return messageId
}

module.exports = {
  callbackMessage,
  getBackProjectConfiguration,
}
