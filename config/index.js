const config = {
  // SecretId和SecretKey生产环境请从环境变量中获取
  SecretId: process.env.SecretId,
  SecretKey: process.env.SecretKey,
  // 存储桶
  Bucket: 'img-bed-1302216408',
  // 地区
  Region: 'ap-guangzhou'
}
module.exports = config