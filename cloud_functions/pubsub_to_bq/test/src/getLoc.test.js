/* global describe, before, it*/
const {getLoc} = require('./../../src/getLoc')
const {expect} = require('chai')
const path = require('path')

describe('Testing the location implementation', () => {
  before('Configure environment variables', () => {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = path.join(__dirname, '..', 'resources', 'credentials.json')
  })
  it('It should get the response for Bogota, Colombia', async() => {
    const response = await getLoc('4.671722', '-74.0833787')
    expect(response).to.be.an('Object')
    expect(response.postal_code)
      .to.be.equal('Bogota, Colombia')
  })
  it('It should get the response for Madrid SOL', async() => {
    const response = await getLoc('40.417174', '-3.7044367')
    expect(response).to.be.an('Object')
    expect(response.postal_code)
      .to.be.equal('28013 Madrid, Spain')
  })
  it('It should get the response for Barcelona Sagrada Familia', async() => {
    const response = await getLoc('41.40403', '2.1744263')
    expect(response).to.be.an('Object')
    expect(response.postal_code)
      .to.be.equal('08013 Barcelona, Spain')
  })
  it('It should get the response for EEUU New York', async() => {
    const response = await getLoc('40.641582', '-74.0049057')
    expect(response).to.be.an('Object')
    expect(response.postal_code)
      .to.be.equal('Brooklyn, NY 11220, USA')
  })
  it('It should get the response for Mojados', async() => {
    const response = await getLoc('41.4278414', '-4.6692421')
    expect(response).to.be.an('Object')
    expect(response.postal_code)
      .to.be.equal('47250 Mojados, Valladolid, Spain')
  })
})