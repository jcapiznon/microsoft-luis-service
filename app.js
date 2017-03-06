'use strict'

const reekoh = require('reekoh')
const _plugin = new reekoh.plugins.Service()

const request = require('request')
const isEmpty = require('lodash.isempty')
const isPlainObject = require('lodash.isplainobject')

_plugin.on('data', (data) => {
  if (!isPlainObject(data) || isEmpty(data)) {
    _plugin.logException(new Error(`Invalid data received. Data must be a valid JSON Object or a collection of objects. Data: ${data}`))
  }

  request.get({
    url: `https://westus.api.cognitive.microsoft.com/luis/v1.0/prog/apps/${_plugin.config.appId}/predict?example=${data.example}`,
    headers: {
      'Ocp-Apim-Subscription-Key': _plugin.config.apiKey
    },
    json: true
  }, (error, response, body) => {
    if (error) {
      console.error(error)
      _plugin.logException(error)
    } else {
      _plugin.pipe(data, JSON.stringify({result: body}))
        .then(() => {
          _plugin.log(JSON.stringify({
            title: 'Microsoft LUIS Service Result',
            data: data,
            result: body
          }))
        })
        .catch((error) => {
          _plugin.logException(error)
        })
    }
  })
})

_plugin.once('ready', () => {
  _plugin.log('Micrsoft Language Understanding Intelligent Service has been initialized.')
  _plugin.emit('init')
})

module.exports = _plugin
