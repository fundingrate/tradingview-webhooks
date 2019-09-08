# Tradingview-listener

A simple service converting tradingview webhooks into exchange orders.

![example1](https://uc2d1b1fa8999f8813752c9712ad.previews.dropboxusercontent.com/p/thumb/AAiMCEIw6rC7SnoH7O4sitowR1J7G9Oj1oGLE7LCx_gnyt0rTkdWn3aXvSPwg18NyB1muJglV8zVWMdQLXJRw3-ykkzvg2e4_zatfrr2TWMTxV-7KaasBJ3RPwVfegSl1vIHyawTKzAPwqEDbQTms2PFf0fsw5yQzS-pBTNQBvy-v_6caU3Vw1cLfhTbLku00jfavU8ASWkn3RGzSTVZNmVJHPUx_UZNJuvbTTYelCeYllLaGy9ZU0hbZphAphjTJIbpFvE0yzcH_kRIGvGvfkmjDBODeibV-zDlNXdb2P3WbDfBo3f-A-WPKEuhhBb5DKYSSkm_EJyyF9x8lmA1z47uUQ6pdR0ZHLUwWD7eeQ1bhpxkBTjz9ZU4uoxjcQ08ExBjBNnHZJ5LyT86VTroeWXBGTitg8UbMtDako5G2wn0jPEtyImqS4sGotY0cUIycBfoMqERxBm4esu2tp6aYS8biTSz1VT76ysi4ZyhiheU-w/p.png?fv_content=true&size_mode=5)

## run
``` 
npm install
npm run api 
```

## TradingView Event Format

```js
{
  "type": "LONG",
  "provider": "rainmaker",
  "timeframe": "4h"
}
```