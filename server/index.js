const Koa = require('koa')
const path = require('path')
const send = require('koa-send')
const session = require('koa-session')
const body = require('koa-body')
const Router = require('koa-router')
const superagent = require('superagent')
const R = require('ramda')

const { PORT = 8001, HOST = 'localhost' } = process.env

const app = new Koa()
const router = new Router()

app.keys = ['foo barbaz 12345']

app.use(session({
  key: 'r-saved',
  rolling: true,
}, app))

app.use(async (ctx, next) => {
  const start = Date.now()
  await next()
  const time = `${Date.now() - start}ms`
  console.log(`${ctx.method} ${ctx.url} ${ctx.status} - ${time}`)
})

app.use(async (ctx, next) => {
  if (process.env.NODE_ENV !== 'production') {
    return next()
  }
  try {
    if (ctx.path === '/') {
      return await send(ctx, './build/index.html')
    }
    return await send(ctx, ctx.path, { root: path.join(`${__dirname}`, '../build') })
  } catch (e) { /* fallthrough */ }
  return next()
})

app.use(body())

const Reddit = async ({
  method = 'get',
  url,
  token,
  data = {},
  query = {},
}) => {
  console.log(`fetching from reddit: ${url}`, { data, query })
  return superagent(method, `https://oauth.reddit.com/${url}`)
    .set({
      Authorization: `bearer ${token}`,
      'user-agent': 'web:r-saved:0.0.1 (by /u/danielfgray)',
    })
    .query({ raw_json: 1, ...query })
    .send(data)
    .then(x => x.body)
}

router.post('/api/clearToken', async ctx => {
  ctx.session.token = null
  ctx.body = 'null'
})

router.post('/api/setToken', async ctx => {
  const { token } = ctx.request.body
  ctx.session.token = token
  ctx.body = await Reddit({ url: '/api/v1/me', token: ctx.session.token })
    .then(R.tap(u => console.log(u.name)))
    .catch(e => console.log({ e, ...ctx }))
})

const needToken = async (ctx, next) => {
  if (ctx.session.token) {
    return next()
  }
  ctx.body = 'missing token'
}

router.all('/api/reddit/*', needToken, async ctx => {
  const url = ctx.path.slice('/api/reddit'.length)
  const data = ctx.request.body || {}
  const { query, method } = ctx.request
  const { token } = ctx.session
  ctx.body = await Reddit({
    method,
    token,
    url,
    data,
    query,
  })
})

app.use(router.routes())

app.listen(PORT, HOST, () => {
  console.log(`server running at http://${HOST}:${PORT}`)
})
