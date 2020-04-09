/* global describe, it, before */
const { expect } = require('chai')
const path = require('path')
const admin = require('firebase-admin')
const { callbackMessage } = require('../src/callBack')

describe('Test the CF end to end', () => {
  let testEl = {}
  const context = {
    params: {
      personId: 'YWmlSN3wMyM94ePKOkLkyy857bF2',
      testId: '6wHvFwZ6hhRqcfFWVnVB',
    },
  }
  before('Create the context', async() => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, 'resources', 'credentials.json')
    admin.initializeApp({}, '2')
    const test = await admin.firestore()
      .collection(`/person/${context.params.personId}/test`)
      .doc(context.params.testId).get()
    testEl = test.data()
    testEl.id = context.params.testId
    testEl.time = (new Date()).getTime()
  })
  it('Should call the CF OK', async() => {
    const change = {
      after: {
        data: () => testEl,
      },
    }
    const result = await callbackMessage(change, context)
    expect(result).to.be.a('string')
  })
})
