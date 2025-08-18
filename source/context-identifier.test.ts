import {strictEqual} from 'node:assert';
import {test} from 'node:test';
import {contextIdentifier} from './index.ts';

await test('content shortening works', () => {
	const identifier = contextIdentifier(
		{update: {update_id: 3}, message: {text: 'blablabla'}},
		undefined,
		5,
	);
	const dateRemoved = identifier.replaceAll(/^[-.:\dT]+Z/g, 'date');
	strictEqual(dateRemoved, 'date 3 9 blabl…');
});
