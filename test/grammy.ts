import {Bot} from 'grammy'

import {generateUpdateMiddleware, generateBeforeMiddleware, generateAfterMiddleware} from '../source/index.js'

const bot = new Bot('')

bot.use(generateUpdateMiddleware())

bot.use(generateBeforeMiddleware())
bot.use(generateAfterMiddleware())
