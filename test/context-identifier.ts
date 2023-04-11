import test from 'ava';
import {contextIdentifier} from '../source/index.js';

test('content shortening works', t => {
	const identifier = contextIdentifier(
		{update: {update_id: 3}, message: {text: 'blablabla'}},
		undefined,
		5,
	);
	const dateRemoved = identifier.replace(/^[-.:\dT]+Z/g, 'date');
	t.is(dateRemoved, 'date 3 9 blabl…');
});
