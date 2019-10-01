# Tradingview-listener

A simple service converting tradingview webhooks into exchange orders. Once started, the end user is able to submit commands via http.

## Software Dependancies

> Below are the required software dependancies.

- `RethinkDB` - [RethinkDB 2.3.6](https://rethinkdb.com/docs/install/)

## .env

> The .env contains all the app's configuration details.

```env
  name=api
  port=9001

  # database
  rethink.db=tradingview
  rethink.host=localhost
  # rethink.port=32769
  # rethink.user=
  # rethink.password=

  # bitmex api key
  bitmex.key=
  bitmex.secret=

  # bybit api key
  bybit.key=
  bybit.secret=
```

## Install & Run

> Install the dependancies and startup the app.

```
npm install
npm run api
```

## TradingView Event Format

> Below is the format the bot expects.

- `type` - The event position type.
- `provider` - Defined name for the event.
- `timeframe` - Timeframe the event is listening to.

```javascript
{
  "token": "4432424-d9b3-433d-9388-19650eb7bf2a",
  "type": "LONG",
  "condition": "Whale",
  "description": "Price can still go up",
  "provider": "Market Liberator A",
  "timeframe": "5m"
}
```

## Setup Tutorial

> Below is a short tutorial on how to setup the app.

1. Clone the repository.
2. Create a [.env](#env) file (example above.).
3. Configure the app.
4. [install and run](#install--run).
5. Point a domain to the app.
6. Input that domain into tradingview.
7. Create events using [the format](#tradingview-event-format).

## HTTP Interface

> Below is an example of how to use the http interface exposed by the app.

```js
import axios from 'axios'
import assert from 'assert'

export default async baseURL => {
  const api = axios.create({
    baseURL,
    transformResponse: [
      function(data) {
        return JSON.parse(data)
      },
    ],
  })
  const { data } = await api.get('/')
  console.log(data)
  return data.reduce(
    (memo, action) => {
      return {
        ...memo,
        [action]: async params => {
          const { data } = await api.post(`/${action}`, params)
          console.log(action, params, data)
          return data
        },
      }
    },
    {
      _api: api,
      _post: async (endpoint, params) => {
        const { data } = await api.post(endpoint, params)
        return data
      },
      _get: async (endpoint, params) => {
        const { data } = await api.get(endpoint, params)
        return data
      },
    }
  )
}
```

### Actions
> Below is a list of the available api endpoints.

#### echo(params)

> returns back whatever is posted to it.

- `params` - optional params.

#### ping()

> returns 200 ok message.

#### me({token})

> returns the user valided by the token.

- `token` - a user token.

#### getTicker()

> returns the current bybit ticker information.

#### registerUsername({username})

> returns user token and creates userid.

- `username` - desired username.

#### listUsers()

> list all registered users.

#### listTraders()

> list all users who are active traders.

#### consumeEvent({token, ...params})

> returns the created event.

- `token` - a user token.
- `params` - optional event params.

#### listMyTrades({token})

> returns list of created trades.

- `token` - a user token.

#### getMyStats({token})

> list my current trade stats.

- `token` - a user token.

#### listMyTokens({token})

> list all my created tokens.

- `token` - a user token.
