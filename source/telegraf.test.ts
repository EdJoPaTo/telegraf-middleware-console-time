import {test} from 'node:test';
import {Telegraf} from 'telegraf';
import {
	generateAfterMiddleware,
	generateBeforeMiddleware,
	generateUpdateMiddleware,
} from './index.ts';

await test('Telegraf', () => {
	const bot = new Telegraf('');

	bot.use(generateUpdateMiddleware());

	bot.use(generateBeforeMiddleware());
	bot.use(generateAfterMiddleware());
});
