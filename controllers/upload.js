const {SecretId,SecretKey,Bucket,Region} = require('../config');
const randomWord = require('../utils/randomName');
const fs = require('fs')
const path = require('path')
const COS = require('cos-nodejs-sdk-v5');
const request = require('request');
let cos = new COS({
  SecretId: SecretId,
  SecretKey: SecretKey,
  FileParallelLimit:10
})
class Upload {
    // 获取图片列表
    async list(ctx) {
      const requestPromise = new Promise((resolve,reject) =>{
        cos.getBucket({
          Bucket, /* 必须 */
          Region,     /* 必须 */
        }, function(err, data) {
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        });
      })
      try {
        const result = await requestPromise;
        ctx.body ={
          code:0,
          message:'success',
          error:null,
          data:{
            list:result.Contents
          }
        }
      } catch(err) {
        ctx.body ={
          code:1,
          message:'fail',
          error:err,
          data:{
            list:[]
          }
        }
      }

    }
    // 上传接口
    async upload(ctx) {
    // 获取上传的图片,imgSrc参数存在为网络连接
      let file,postfix,tmpPath
      if (ctx.request.body.imgSrc) {
        postfix='jpg'
        const requestPromise = new Promise((resolve,reject) => {
          // 云函数写入只能写入到tmp的临时文件夹中
          if (process.env.SERVERLESS == 1) {
            tmpPath = '/tmp/image.jpg'
          } else {
            tmpPath = '../public/uploads/image.jpg'
          }
          request(ctx.request.body.imgSrc).pipe(fs.createWriteStream(path.resolve(__dirname, tmpPath)).on('finish',() => {
            resolve(true)
          }))
        })
        await requestPromise
        file = fs.readFileSync(path.resolve(__dirname, tmpPath)) /**'../public/uploads/image.jpg' */
      } else {
        file = fs.readFileSync(ctx.request.files.file.path)
        postfix = ctx.request.files.file.type.split('/')[1]
      }
      
      // 将图片转为base64在转为Buffer流
      const dataBuffer = new Buffer.from(file, 'base64');
      const requestPromise = new Promise((resolve,reject) => {
        cos.putObject({
          Bucket,  // 存储桶 必须
          Region,  // 地区识别  必须
          Key: `${randomWord(false,32)}.${postfix}`,  // 文件名字（这里需要注意的是，如果名字是一样的，那么后面的会覆盖前面的，所以这个名字不可以重复）（必须）
          Body: dataBuffer, // 上传文件对象（可以不写）支持 Buffer|Stream|String
        }, (err, data) =>{
          if (err) {
            reject(err)
          } else {
            resolve(data)
          }
        });
      })
     
      try {
        const result = await requestPromise;
        ctx.body ={
          code:0,
          message:'success',
          error:null,
          data:{
            url:'https://'+result.Location
          }
        }
      } catch(err) {
        ctx.body ={
          code:1,
          message:'fail',
          error:err,
          data:{
            url:''
          }
        }
      }
    //  上传完成清空上传的文件夹 本地测试
    if (process.env.SERVERLESS != 1) {
      let tmpUploadPath = '../public/uploads'
      const images = fs.readdirSync(path.resolve(__dirname,tmpUploadPath));
      images.forEach((v) => {
        let imagePath = path.resolve(__dirname,`${tmpUploadPath}/${v}`)
        fs.unlinkSync(imagePath); 
      })
    }
  }
  // 删除单个cos对象
  async deleteCos(ctx) {
    let deleteRequestPromise = new Promise((resolve,reject) =>{
      cos.deleteObject({
        Bucket, /* 必须 */
        Region,   /* 必须 */
        Key: ctx.request.query.key                            /* 必须 */
      }, (err, data) => {
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      });
    })
    try {
      const result = await deleteRequestPromise;
      ctx.body ={
        code:0,
        message:'success',
        error:null
      }
    } catch(err) {
      ctx.body ={
        code:1,
        message:'fail',
        error:err
      }
    }
    
  }
}

module.exports = new Upload()