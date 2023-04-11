import {Bot} from 'grammy';
import test from 'ava';
import {
	generateAfterMiddleware,
	generateBeforeMiddleware,
	generateUpdateMiddleware,
} from '../source/index.js';

test.skip('compiles', () => {
	const bot = new Bot('');

	bot.use(generateUpdateMiddleware());

	bot.use(generateBeforeMiddleware());
	bot.use(generateAfterMiddleware());
});
