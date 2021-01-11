import {Middleware, Context as TelegrafContext} from 'telegraf'

// Callback Data is max 64 -> that should be still visible
const DEFAULT_MAX_CONTENT_LENGTH = 64

export function generateUpdateMiddleware<TContext extends TelegrafContext>(label = '', maxContentLength = DEFAULT_MAX_CONTENT_LENGTH): Middleware<TContext> {
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

export function contextIdentifier(ctx: TelegrafContext, label = '', maxContentLength = DEFAULT_MAX_CONTENT_LENGTH): string {
	const updateId = ctx.update.update_id.toString(36)

	const identifierPartsRaw: Array<string | undefined | false> = [
		new Date().toISOString(),
		updateId,
		ctx.updateType,
		ctx.chat && 'title' in ctx.chat && ctx.chat.title,
		ctx.from?.first_name,
		label,
		...contextIdentifierContentPart(ctx, maxContentLength)
	]
	const identifierParts = identifierPartsRaw.filter(o => o) as string[]
	const identifier = identifierParts.join(' ')
	return identifier
}

function contentFromContext(ctx: TelegrafContext): string | undefined {
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

function contextIdentifierContentPart(ctx: TelegrafContext, maxContentLength: number): string[] {
	const content = contentFromContext(ctx)
	if (!content) {
		return []
	}

	const lengthString = String(content.length)

	const withoutNewlines = content.replace(/\n/g, '\\n')
	const contentString = withoutNewlines.slice(0, maxContentLength) + (withoutNewlines.length > maxContentLength ? '…' : '')

	return [lengthString, contentString]
}

export function generateBeforeMiddleware<TContext extends TelegrafContext>(label = ''): Middleware<TContext> {
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

export function generateAfterMiddleware<TContext extends TelegrafContext>(label = ''): Middleware<TContext> {
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
