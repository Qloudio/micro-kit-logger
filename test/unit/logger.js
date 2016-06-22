'use strict'

require('chai').should()
const sinon = require('sinon')
const MicroLogger = require('../../src/index.js')

describe('MicroLogger class', () => {
  let logger = null,
    sandbox = null;

  beforeEach( () => {
    logger = new MicroLogger('Test component')
    sandbox = sinon.sandbox.create();
    MicroLogger.config = {
      stringify: false,
      logLevel: 'info'
    }
  })

  afterEach( () => {
    sandbox.restore();
  })
  
  describe("configuration options", () => {
    it("should log stringified messages when stringify is set to true", () => {
      MicroLogger.config = {
        stringify: true
      }
      let stub = sandbox.stub(console, 'info', () => {})
      logger.info({message: "test"})
      stub.firstCall.args.length.should.eql(1)
      stub.firstCall.args[0].should.be.a('string')
    })

    it("should log a json object when stringify is set to false", () => {
      MicroLogger.config = {
        stringify: false
      }
      let stub = sandbox.stub(console, 'info', () => {})
      logger.info({message: "test"})
      stub.firstCall.args.length.should.eql(1)
      stub.firstCall.args[0].should.be.an('object')
    })

    it("shouldn't log anything if the log level is lower then the limit", () => {
      MicroLogger.config = {
        logLevel: 'warn'
      }
      let stub = sandbox.stub(console, 'info', () => {})
      logger.info({message: "test"});
      stub.called.should.eql(false);
    })
  })
  
  describe("message formating", () => {
    it("should add the component name to the message", () => {
      let stub = sandbox.stub(console, 'info', () => {})
      logger.info({message: "test"})
      stub.firstCall.args[0].should.have.property('component')
      .that.equals('Test component')
    })

    it("should add request headers, url, method, http version and request id to the message if a request object is passed", () => {
      let stub = sandbox.stub(console, 'info', () => {})
      let req = {
        id: 1,
        headers: [
          {authorization: 'Bearer asdkfjas123123lj12l3'}
        ],
        method: 'get',
        url: '/test',
        httpVersion: 1
      }
      logger.info({message: "test"}, req)
      stub.firstCall.args[0].should.have.property('request')
      .that.deep.equals(req)
    })

    it("Should convert a string message into an object", () => {
      let stub = sandbox.stub(console, 'info', () => {})
      logger.info("Creating fancy stuff");
      stub.firstCall.args[0].should.be.an('object')
      .that.has.property('message')
      .that.equals('Creating fancy stuff');
    })
    
    it("Should convert an error object into a log message", () => {
      let stub = sandbox.stub(console, 'error', () => {})
      let error = new Error("Something went wrong")
      error.id = '0a59972d-d029-441d-8658-d93faa7e1b7d'
      
      logger.error(error)
      stub.firstCall.args[0].should.be.an('object')
      stub.firstCall.args[0].should.have.property('message', 'Something went wrong')      
      stub.firstCall.args[0].should.have.property('code', 'Error')
      stub.firstCall.args[0].should.have.property('id', '0a59972d-d029-441d-8658-d93faa7e1b7d')
    })

    it("should autogenerate an error id if not present", () => {
      let stub = sandbox.stub(console, 'error', () => {})
      let error = new Error("Something went wrong")
      
      logger.error(error)
      stub.firstCall.args[0].should.be.an('object')
      .that.has.property('id')
    })

    it("Should call console.error when calling logger.fatal", () => {
      let stub = sandbox.stub(console, 'error', () => {})
      logger.fatal(new Error("FatalError"));
      stub.called.should.equal(true);
    })
    
  })
})
