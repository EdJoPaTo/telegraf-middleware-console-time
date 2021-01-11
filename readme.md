# telegraf-middleware-console-time

[![NPM Version](https://img.shields.io/npm/v/telegraf-middleware-console-time.svg)](https://www.npmjs.com/package/telegraf-middleware-console-time)
[![node](https://img.shields.io/node/v/telegraf-middleware-console-time.svg)](https://www.npmjs.com/package/telegraf-middleware-console-time)
[![Dependency Status](https://david-dm.org/EdJoPaTo/telegraf-middleware-console-time/status.svg)](https://david-dm.org/EdJoPaTo/telegraf-middleware-console-time)
[![Dev Dependency Status](https://david-dm.org/EdJoPaTo/telegraf-middleware-console-time/dev-status.svg)](https://david-dm.org/EdJoPaTo/telegraf-middleware-console-time?type=dev)

> Quick and dirty way to see whats incoming to your Telegraf Telegram bot while developing

When testing your bot its nice to know whats coming in and how long it did take to process this request.

This library is not meant for usage in production.
It's meant for debugging purposes.

In production the individual request wouldnt be as interesting as the general kind of request.
For example not taking a look onto a specific '/start' command but onto all /start messages.
This is kind of the opposite of what this library tries to achieve: Helping with understanding individual requests.

## Install

```
$ npm install telegraf-middleware-console-time
```


## Usage

### Test your implementation

```js
const {generateUpdateMiddleware} = require('telegraf-middleware-console-time');

const bot = new Telegraf(…);

// Other middlewares unrelated to your code
bot.use(…);

// Check your implementation for each telegram update (only when not in production)
if (process.env.NODE_ENV !== 'production') {
    bot.use(generateUpdateMiddleware());
}

// Your implementation
bot.command('start', …);
```

This will output something like this:

```
2020-03-31T14:32:36.974Z 490af message text Edgar 6 /start: 926.247ms
2020-03-31T14:32:57.750Z 490ag message text Edgar 6 /start: 914.764ms
2020-03-31T14:33:01.188Z 490ah message text Edgar 5 /stop: 302.666ms
2020-03-31T14:46:11.385Z 490ai message text Edgar 6 /start: 892.452ms
```

The `490af` is the update id.

The number before the commands is the total length of the content.
This is helpful when considering max length for stuff like callback data.

The content itself is shortened in order to prevent log spamming.

### Test a middleware

When you create your own middleware or assume slow timings of another middleware you can use these middlewares to create a timing profile

```js
const {generateBeforeMiddleware, generateAfterMiddleware} = require('telegraf-middleware-console-time');

const bot = new Telegraf(…);

// Use BeforeMiddleware before loading the to be tested middleware
bot.use(generateBeforeMiddleware('foo'))

// Middleware to be tested
bot.use(…)

// Use AfterMiddleware after loading the to be tested middleware (with the same label)
bot.use(generateAfterMiddleware('foo'))

// Other middlewares / implementations (they will take the 'inner' amount of time when used)
bot.use(…)
bot.on(…, …)
```

This will output something like this:

```
490ai foo before: 304.185ms
490ai foo inner: 83.122ms
490ai foo after: 501.028ms
490ai foo total: 891.849ms
```

This indicates the checked middleware alone took 800ms and isnt as performant as maybe needed.
