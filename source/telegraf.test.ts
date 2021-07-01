import {Telegraf} from 'telegraf'

import {generateUpdateMiddleware, generateBeforeMiddleware, generateAfterMiddleware} from '.'

const bot = new Telegraf('')

bot.use(generateUpdateMiddleware())

bot.use(generateBeforeMiddleware())
bot.use(generateAfterMiddleware())
