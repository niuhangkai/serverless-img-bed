const Router = require('koa-router');
const router = new Router();
const sendFile = require('koa-sendfile')
const path = require('path')
const { upload,list,deleteCos} = require('../controllers/upload')

//返回页面上传静态资源页面
router.get('/', async (ctx, next) => {
  await sendFile(ctx, path.join(__dirname, '../views/index.html'))
})

router.get("/list",list);
router.get('/delete',deleteCos)
router.post("/upload",upload);
module.exports = router;
