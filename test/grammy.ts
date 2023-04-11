import {Bot} from 'grammy';
import {
	generateAfterMiddleware,
	generateBeforeMiddleware,
	generateUpdateMiddleware,
} from '../source/index.js';

const bot = new Bot('');

bot.use(generateUpdateMiddleware());

bot.use(generateBeforeMiddleware());
bot.use(generateAfterMiddleware());
