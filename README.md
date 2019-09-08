# Tradingview-listener

A simple service converting tradingview webhooks into exchange orders.

## .env

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

## run

```
npm install
npm run api
```

## TradingView Event Format

```javascript
{
  "type": "LONG", //LONG or SHORT
  "provider": "rainmaker", //indicator name / event name
  "timeframe": "4h" //timeframe its listening to
}
```

## Tutorial

1. clone the repository
2. create a [.env](#.env) file (example above.)
3. configure the app
4. [install and run](#.run)
5. point a domain to the app.
6. input that domain into tradingview.