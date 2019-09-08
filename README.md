# Tradingview-listener

A simple service converting tradingview webhooks into exchange orders.

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

* `type` - The event position type.
* `provider` - Defined name for the event.
* `timeframe` - Timeframe the event is listening to.


```javascript
{
  "type": "LONG",
  "provider": "rainmaker",
  "timeframe": "4h"
}
```

## Tutorial

1. clone the repository
2. create a [.env](#.env) file (example above.)
3. configure the app
4. [install and run](#.run)
5. point a domain to the app.
6. input that domain into tradingview.