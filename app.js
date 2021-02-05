const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const KoaBody = require('koa-body')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const htmlRender = require("koa-html-render") // 引入koa-html-render
const index = require('./routes/index')
const routing = require('./routes')
const KoaStatic = require('koa-static')
const path =  require('path')
// error handler
onerror(app)
let dir
if (process.env.SERVERLESS == 1) {
  dir = path.resolve(__dirname,'/tmp')
} else {
  dir = path.resolve(__dirname,'./public/uploads')
}
app.use(KoaBody({multipart:true, formidable:{
  uploadDir:dir, // 设置上传目录
  keepExtensions: true   // 保留拓展名
}}))
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))
app.use(htmlRender())
app.use(KoaStatic(path.join(__dirname,'public')))
// app.use(views(__dirname + '/views', {
//   extension: 'html'
// }))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
// app.use(index.routes(), index.allowedMethods())

// error-handling

app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});
routing(app)
module.exports = app
