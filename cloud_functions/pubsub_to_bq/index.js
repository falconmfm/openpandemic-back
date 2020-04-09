/**
 * Triggered from a message on a Cloud Pub/Sub topic.
 *
 * @param {!Object} event Event payload.
 * @param {!Object} context Metadata for the event.
 */
const { google } = require('googleapis')
const { Datastore } = require('@google-cloud/datastore')
const { BigQuery } = require('@google-cloud/bigquery')
const { getLoc } = require('./src/getLoc')
const { decrypt } = require('./src/decrypt')
const moment = require('moment')

const bigQuery = new BigQuery()
const datastore = new Datastore({
  namespace: 'default'
})
const kind = 'ExportBQFromPubSub'
const datasetId = 'Bolivia'
const keyRingId = 'crypto-key'
const criptoKeyId = 'corona-key'
let errors = undefined


const getPubSubMessage = async(data) => {
  let out = undefined
  try {
    const buff = data.data ? Buffer.from(data.data, 'base64') : data
    out = JSON.parse(buff.toString())
  } catch (error) {
    console.error(error)
  }
  return out
}

const insertRows = async(rows, tableId) => {
  try {
    await bigQuery
      .dataset(datasetId)
      .table(tableId).insert(rows)
    return { result: 200, count: rows.length }
  } catch (error) {
    console.error(JSON.stringify(error, null, 2))
    return { result: 500 }
  }
}

const getQuestions = request => {
  const testsValues = Object.entries(request.test.test).map(([key, value]) => {
    return { KEY: key, VALUE: value.toString() }
  })
  return testsValues
}

const getRowsForModeling = (request, testLocation) => ([ {
  PERSON_ID: request.personId,
  POSTAL_CODE: request.personal_data.postalCode,
  REGION: request.personal_data.region,
  COUNTRY: 'Bolivia',
  TEST: {
    ID: request.test.id,
    RESULT: request.test.result,
    TIME: moment(request.test.time).format('YYYY-MM-DD HH:mm:ss'),
    QUESTIONS: getQuestions(request),
    LOCATION: {
      NEIGHBORHOOD: testLocation.neighborhood,
      POSTAL_CODE: testLocation.postal_code,
      POLITICAL: testLocation.political
    }
  }
} ])

const insertInBQModeling = async request => {
  const tableId = 'Modeling'
  const testLocation = request.test.location ? await getLoc(request.test.location.lat, request.test.location.long) : {}
  return insertRows(getRowsForModeling(request, testLocation), tableId)
}

const getRowsForTracking = request => ([ {
  PERSON_ID: request.personId,
  GENDER: request.clinical_data.gender,
  BIRTHDAY: `${request.clinical_data.birthYear}-${request.clinical_data.birthMonth}-${request.clinical_data.birthDay}`,
  ADDRESS: request.personal_data.address,
  ID_NUMBER: request.personal_data.idNumber,
  NAME: request.personal_data.name,
  POSTAL_CODE: request.personal_data.postalCode,
  REGION: request.personal_data.region,
  TEST: {
    ID: request.test.id,
    RESULT: request.test.result,
    TIME: moment(request.test.time).format('YYYY-MM-DD HH:mm:ss'),
    QUESTIONS: getQuestions(request),
    LOCATION: {
      LATITUDE: request.test.location ? request.test.location.lat : null,
      LONGITUDE: request.test.location ? request.test.location.long : null
    }
  }
} ])

const insertInBQTracking = (request) => {
  const tableId = 'Tracking'
  return insertRows(getRowsForTracking(request), tableId)
}

const exportToBigQuery = async(data, context) => {
  console.log('Starting CF ETBQ')
  let pubSubMessage = ''
  try {
    const projectId = await google.auth.getProjectId()
    /* Decrypt */
    console.log('pre decrypt')
    const decData = await decrypt(projectId, keyRingId, criptoKeyId, data.data)
    console.log('post decrypt')
    pubSubMessage = await getPubSubMessage(decData)

    console.log(context)

    /* Avoid duplicate eventId or executionId */

    const executionId = context.eventId
    const key = datastore.key([kind, executionId])

    console.log('************************************************')
    console.log('* Before check executionId: ' + executionId + '   *')
    console.log('************************************************')


    const entity = await datastore.get(key)
    if (!entity || entity[0] === undefined) {
      console.log('NOT EXISTS - CREATE')
      const taskKey = datastore.key([kind, executionId])
      const task = {
        key: taskKey,
        data: [
          {
            name: 'created',
            value: new Date(),
          },
          {
            name: 'testId',
            value: pubSubMessage.test.id
          }
        ],
      }
      datastore.save(task)
      console.log(`Saved ${kind}: ${task.key.name}`)
    } else {
      console.log('EXISTS - return')
      console.log(entity)
      errors = [ 'ExecutionId processed' ]
      return { errors }
    }
  } catch (error) {
    console.error(error)
    errors = [ error ]
    return { errors }
  }

  const [tracking, modeling] = await Promise.all([
    insertInBQTracking(pubSubMessage),
    insertInBQModeling(pubSubMessage)
  ])
  console.log('Inserted in BQ')
  console.log(tracking)
  console.log(modeling)
  console.log('Ending ok the CF')
  return { tracking, modeling, errors }
}

module.exports = {
  exportToBigQuery,
  insertInBQTracking,
  insertInBQModeling
}