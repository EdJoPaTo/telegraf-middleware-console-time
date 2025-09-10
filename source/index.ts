// Callback Data is max 64 -> that should be still visible
const DEFAULT_MAX_CONTENT_LENGTH = 64;

type MinimalContext = {
	readonly update: {
		readonly update_id: number;
	};
};

type MinimalIdentifierContext = MinimalContext & {
	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	readonly chat?: undefined | object | {
		readonly title?: string;
	};
	readonly from?: undefined | {
		readonly first_name?: string;
	};
	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	readonly callbackQuery?: undefined | object | {
		readonly data?: string;
	};
	// eslint-disable-next-line @typescript-eslint/no-restricted-types
	readonly message?: undefined | object | {
		readonly text?: string;
		readonly caption?: string;
	};
	readonly inlineQuery?: undefined | {
		readonly query?: string;
	};
};

type MiddlewareFunction<Context> = (
	ctx: Context,
	next: () => Promise<void>,
) => Promise<void>;

export function generateUpdateMiddleware(
	label = '',
	maxContentLength = DEFAULT_MAX_CONTENT_LENGTH,
): MiddlewareFunction<MinimalIdentifierContext> {
	return async (ctx, next) => {
		const identifier = contextIdentifier(ctx, label, maxContentLength);

		console.time(identifier);
		try {
			if (next) {
				await next();
			}
		} finally {
			console.timeEnd(identifier);
		}
	};
}

export function contextIdentifier(
	ctx: MinimalIdentifierContext,
	label = '',
	maxContentLength = DEFAULT_MAX_CONTENT_LENGTH,
): string {
	const updateId = ctx.update.update_id.toString(36);
	const updateType = Object.keys(ctx.update)
		.filter(o => o !== 'update_id')
		.join('|');

	const identifierPartsRaw: Array<string | undefined | false> = [
		new Date().toISOString(),
		updateId,
		updateType,
		ctx.chat && 'title' in ctx.chat && ctx.chat.title,
		ctx.from?.first_name,
		label,
		...contextIdentifierContentPart(ctx, maxContentLength),
	];
	const identifierParts = identifierPartsRaw.filter(Boolean) as string[];
	const identifier = identifierParts.join(' ');
	return identifier;
}

function contentFromContext(ctx: MinimalIdentifierContext): string | undefined {
	if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
		return ctx.callbackQuery.data;
	}

	if (ctx.message) {
		if ('text' in ctx.message) {
			return ctx.message.text;
		}

		if ('caption' in ctx.message) {
			return ctx.message.caption;
		}

		// TODO: implement different messages
	}

	return ctx.inlineQuery?.query;
}

function contextIdentifierContentPart(
	ctx: MinimalIdentifierContext,
	maxContentLength: number,
): string[] {
	const content = contentFromContext(ctx);
	if (!content) {
		return [];
	}

	const lengthString = String(content.length);

	const withoutNewlines = content.replaceAll('\n', String.raw`\n`);
	const suffix = withoutNewlines.length > maxContentLength ? '…' : '';
	const contentString = withoutNewlines.slice(0, maxContentLength) + suffix;

	return [lengthString, contentString];
}

export function generateBeforeMiddleware(label = ''): MiddlewareFunction<MinimalContext> {
	return async (ctx, next) => {
		const updateId = ctx.update.update_id.toString(36);
		console.time(`${updateId} ${label} total`);
		console.time(`${updateId} ${label} before`);
		try {
			if (next) {
				await next();
			}
		} finally {
			console.timeEnd(`${updateId} ${label} after`);
			console.timeEnd(`${updateId} ${label} total`);
		}
	};
}

export function generateAfterMiddleware(label = ''): MiddlewareFunction<MinimalContext> {
	return async (ctx, next) => {
		const updateId = ctx.update.update_id.toString(36);
		console.timeEnd(`${updateId} ${label} before`);
		console.time(`${updateId} ${label} inner`);
		try {
			if (next) {
				await next();
			}
		} finally {
			console.timeEnd(`${updateId} ${label} inner`);
			console.time(`${updateId} ${label} after`);
		}
	};
}
