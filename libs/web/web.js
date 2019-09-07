const uWS = require('uWebSockets.js')
const assert = require('assert')
const { readJson } = require('./utils')
const url = require('url')
const qs = require('querystring');


module.exports = ({ port=9001 }, actions) => {
  assert(actions, 'actions required.')

  const app = uWS.App({
    // key_file_name: 'misc/key.pem',
    // cert_file_name: 'misc/cert.pem',
    // passphrase: '1234',
  })

  app.get('/:action', async (res, req) => {
    res.onAborted(() => {
      res.aborted = true
    })

    const action = req.getParameter(0)
    if (!actions[action]) return res.end(`Invalid Action: ${action}`)

    // const query = req.getQuery().replace(/^.*\?/, '')
    // const params = qs.parse(query)
    // console.log(params)

    console.log('GET', 'calling action', action)
    const result = await actions[action]().then(JSON.stringify)

    if (!res.aborted) {
      res.writeHeader('Access-Control-Allow-Origin', '*')
      res.writeHeader('Content-Type', 'application/json')
      res.end(result)
    }
  })

  app.post('/:action', async (res, req) => {
    res.onAborted(() => {
      res.aborted = true
    })

    const action = req.getParameter(0)
    if (!actions[action]) return res.end(`Invalid Action: ${action}`)

    try {
      const params = await readJson(res)
      console.log('POST', 'calling action', action, params)
      const result = await actions[action](params).then(JSON.stringify)
      res.writeHeader('Access-Control-Allow-Origin', '*')
      res.writeHeader('Content-Type', 'application/json')
      res.end(result)
    } catch (e) {
      res.writeStatus('500')
      res.end(e.message)
      // res.close()
      return
    }
  })

  app.get('/*', (res, req) => {
    /* Wildcards - make sure to catch them last */
    res.writeHeader('Access-Control-Allow-Origin', '*')
    res.writeHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(Object.keys(actions)))
  })

  app.listen(port, token => {
    if (token) {
      console.log('Listening to port ' + port)
    } else {
      console.log('Failed to listen to port ' + port)
    }
  })
}
