/* eslint-disable no-unused-expressions */
/* global describe, before, it*/
const {expect} = require('chai')
const {exportToBigQuery, insertInBQTracking, insertInBQModeling} = require('./../index')
const path = require('path')
const {v4} = require('uuid')
const {encrypt} = require('../src/encrypt')


describe('Index file', () => {
  before('Configure environment variables', () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'resources', 'credentials.json')
  })
  const request = {
    'personId': 'Persona de test1',
    'clinical_data': {
      'gender': 'man',
      'birthDay': '23',
      'birthMonth': '08',
      'birthYear': '1961'
    },
    'personal_data': {
      'idNumber': 'Y5689075q',
      'name': 'Alvaro ibarra',
      'address': 'Calle Buenavista 6',
      'postalCode': '28120',
      'region': '13'
    },
    'test': {
      'location': {
        'isHighAccuracy': true,
        'lat': 40.642550417912645,
        'long': -3.579127719135071
      },
      'result': 'no-symptoms',
      'test': {
        'contacto_positivo': false,
        'dolor_muscular': false,
        'falta_aire': false,
        'fiebre': false,
        'gastrointestinal': false,
        'mas_20_dias': false,
        'mucosidad': false,
        'tos': false
      },
      'time': 1585773092313,
      'id': '25lrIbDMDOwyecdumfuB'
    }
  }
  describe.skip('Testing the Tracking table in BQ', () => {
    it('Should create a new element', async() => {
      const result = await insertInBQTracking(request)
      expect(result.result).to.be.equal(200)
      expect(result.count).to.be.equal(1)
    })
  })

  describe.skip('Testing the Modeling table in BQ', () => {
    before('Configure environment variables', () => {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'resources', 'credentials.json')
    })
    it('Should create a new element', async() => {
      const result = await insertInBQModeling(request)
      expect(result.result).to.be.equal(200)
      expect(result.count).to.be.equal(1)
    })
  })

  describe('Testing export to BigQuery', () => {
    const context = {}
    before('Create the context', () => {
      context.eventId = v4()
      process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'resources', 'credentials.json')
    })
    it('Should export data to BQ', async() => {
      const pubSubMessageString = JSON.stringify(request)
      const pubSubMessage = Buffer.from(pubSubMessageString).toString('base64')
      const encData = await encrypt(
        'au-corona-app-sp',
        'crypto-key',
        'corona-key',
        pubSubMessage
      )
      const result = await exportToBigQuery({data: encData}, context)

      expect(result.modeling.result).to.be.equal(200)
      expect(result.tracking.result).to.be.equal(200)
    })
    it('Should not export a repeated executionId', async() => {
      const pubSubMessageString = JSON.stringify(request)
      const pubSubMessage = Buffer.from(pubSubMessageString).toString('base64')
      const encData = await encrypt(
        'au-corona-app-sp',
        'crypto-key',
        'corona-key',
        pubSubMessage
      )
      const result = await exportToBigQuery({data: encData}, context)
      expect(result.errors).to.be.an('Array')
      expect(result.errors[0]).to.be.equal('ExecutionId processed')
    })
  })
})