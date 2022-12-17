import {Telegraf} from 'telegraf';

import {generateUpdateMiddleware, generateBeforeMiddleware, generateAfterMiddleware} from '../source/index.js';

const bot = new Telegraf('');

bot.use(generateUpdateMiddleware());

bot.use(generateBeforeMiddleware());
bot.use(generateAfterMiddleware());
