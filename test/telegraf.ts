import {Telegraf} from 'telegraf';

import {
	generateAfterMiddleware,
	generateBeforeMiddleware,
	generateUpdateMiddleware,
} from '../source/index.js';

const bot = new Telegraf('');

bot.use(generateUpdateMiddleware());

bot.use(generateBeforeMiddleware());
bot.use(generateAfterMiddleware());
