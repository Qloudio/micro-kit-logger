'use strict'
const uuid = require('uuid');

const config = {
  logLevel: process.env.NODE_ENV == 'production' ? 'info' : 'debug',
  stringify: process.env.NODE_ENV == 'production'
};

const logLevels = {
  'debug': 1,
  'info': 5,
  'warn': 10,
  'error': 15,
  'fatal': 20
};

module.exports = class MicroLogger {
  
  
  constructor(component){
    this.component = component;
  }
  
  static get config(){
    return defaults;
  }
  
  static set config(newConfig){
    Object.assign(config, newConfig);
  }
  
  debug(message, request){
    this._log('debug', message, request)
  }

  info(message, request){
    this._log('info', message, request)
  }

  warn(message, request){
    this._log('warn', message, request)
  }

  error(message, request){
    this._log('error', message, request)
  }

  info(message, request){
    this._log('info', message, request)
  }

  fatal(message, request){
    this._log('fatal', message, request)
  }

  _generateMessage(level, message, req){
    if(typeof message == 'string'){
      message = {
        message: message
      }
    }
    if(message instanceof Error){
      if(!message.id){
        message.id = uuid.v4() 
      }

      message = {
        code: message.name,
        message: message.message,
        error: message,
        id: message.id
      }
    }
    if(req){
      message.request = {
        method: req.method,
        headers: req.headers,
        id: req.id || null,
        url: req.url,
        httpVersion: req.httpVersion
      };
    }
    message.component = this.component;
    message.level = level
    return message;
  }
  
  _log(level, message, request){
    if(logLevels[level] >= logLevels[config.logLevel]){
      let payload = this._generateMessage(level, message, request)
      let out = console[level] ? console[level] : console.error
      if(config.stringify){
        payload = JSON.stringify(payload);
      }
      out(payload)
    }
  }
}

