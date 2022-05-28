// Callback Data is max 64 -> that should be still visible
const DEFAULT_MAX_CONTENT_LENGTH = 64

interface MinimalContext {
	readonly update: {
		readonly update_id: number;
	};
}

interface MinimalIdentifierContext extends MinimalContext {
	readonly chat?: {} | {
		readonly title?: string;
	};
	readonly from?: {
		readonly first_name?: string;
	};
	readonly callbackQuery?: {} | {
		readonly data?: string;
	};
	readonly message?: {} | {
		readonly text?: string;
		readonly caption?: string;
	};
	readonly inlineQuery?: {
		readonly query?: string;
	};
}

type MiddlewareFn<Context> = (ctx: Context, next: () => Promise<void>) => Promise<void>

export function generateUpdateMiddleware(label = '', maxContentLength = DEFAULT_MAX_CONTENT_LENGTH): MiddlewareFn<MinimalIdentifierContext> {
	return async (ctx, next) => {
		const identifier = contextIdentifier(ctx, label, maxContentLength)

		console.time(identifier)
		try {
			if (next) {
				await next()
			}
		} finally {
			console.timeEnd(identifier)
		}
	}
}

export function contextIdentifier(ctx: MinimalIdentifierContext, label = '', maxContentLength = DEFAULT_MAX_CONTENT_LENGTH): string {
	const updateId = ctx.update.update_id.toString(36)
	const updateType = Object.keys(ctx.update).filter(o => o !== 'update_id').join('|')

	const identifierPartsRaw: Array<string | undefined | false> = [
		new Date().toISOString(),
		updateId,
		updateType,
		ctx.chat && 'title' in ctx.chat && ctx.chat.title,
		ctx.from?.first_name,
		label,
		...contextIdentifierContentPart(ctx, maxContentLength),
	]
	const identifierParts = identifierPartsRaw.filter(Boolean) as string[]
	const identifier = identifierParts.join(' ')
	return identifier
}

function contentFromContext(ctx: MinimalIdentifierContext): string | undefined {
	if (ctx.callbackQuery && 'data' in ctx.callbackQuery) {
		return ctx.callbackQuery.data
	}

	if (ctx.message) {
		if ('text' in ctx.message) {
			return ctx.message.text
		}

		if ('caption' in ctx.message) {
			return ctx.message.caption
		}

		// TODO: implement different messages
	}

	return ctx.inlineQuery?.query
}

function contextIdentifierContentPart(ctx: MinimalIdentifierContext, maxContentLength: number): string[] {
	const content = contentFromContext(ctx)
	if (!content) {
		return []
	}

	const lengthString = String(content.length)

	const withoutNewlines = content.replace(/\n/g, '\\n')
	const contentString = withoutNewlines.slice(0, maxContentLength) + (withoutNewlines.length > maxContentLength ? '…' : '')

	return [lengthString, contentString]
}

export function generateBeforeMiddleware(label = ''): MiddlewareFn<MinimalContext> {
	return async (ctx, next) => {
		const updateId = ctx.update.update_id.toString(36)
		console.time(`${updateId} ${label} total`)
		console.time(`${updateId} ${label} before`)
		try {
			if (next) {
				await next()
			}
		} finally {
			console.timeEnd(`${updateId} ${label} after`)
			console.timeEnd(`${updateId} ${label} total`)
		}
	}
}

export function generateAfterMiddleware(label = ''): MiddlewareFn<MinimalContext> {
	return async (ctx, next) => {
		const updateId = ctx.update.update_id.toString(36)
		console.timeEnd(`${updateId} ${label} before`)
		console.time(`${updateId} ${label} inner`)
		try {
			if (next) {
				await next()
			}
		} finally {
			console.timeEnd(`${updateId} ${label} inner`)
			console.time(`${updateId} ${label} after`)
		}
	}
}
