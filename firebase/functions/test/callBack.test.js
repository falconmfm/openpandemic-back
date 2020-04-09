/* global describe, it, before */
const { expect } = require('chai')
const { getBackProjectConfiguration } = require('../src/callBack')

describe('Testing get project configuration', () => {
  it('Should get the project configuration', async() => {
    const bprojectConfiguration = await getBackProjectConfiguration()
    expect(bprojectConfiguration.projectId).to.be.an('string')
    expect(bprojectConfiguration.keyRingId).to.be.equal('crypto-key')
  })
})
