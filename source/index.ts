import {Middleware, Context as TelegrafContext} from 'telegraf'

export function generateUpdateMiddleware<TContext extends TelegrafContext>(label = ''): Middleware<TContext> {
	return async (ctx, next) => {
		const identifier = contextIdentifier(ctx, label)

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

export function contextIdentifier(ctx: TelegrafContext, label = ''): string {
	const updateId = ctx.update.update_id.toString(36)
	const content = ctx.callbackQuery?.data ?? ctx.inlineQuery?.query ?? ctx.message?.text
	const identifierPartsRaw: Array<string | undefined> = [
		new Date().toISOString(),
		updateId,
		ctx.updateType,
		...ctx.updateSubTypes,
		ctx.chat?.title,
		ctx.from?.first_name,
		label,
		String(content?.length),
		content?.replace(/\n/g, '\\n')?.slice(0, 20)
	]
	const identifierParts = identifierPartsRaw.filter(o => o) as string[]
	const identifier = identifierParts.join(' ')
	return identifier
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
