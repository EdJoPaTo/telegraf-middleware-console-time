import {test} from 'node:test';
import {Bot} from 'grammy';
import {
	generateAfterMiddleware,
	generateBeforeMiddleware,
	generateUpdateMiddleware,
} from './index.js';

await test('grammY', () => {
	const bot = new Bot('123:ABC');

	bot.use(generateUpdateMiddleware());

	bot.use(generateBeforeMiddleware());
	bot.use(generateAfterMiddleware());
});
