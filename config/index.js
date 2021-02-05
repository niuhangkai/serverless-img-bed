const config = {
  // SecretId和SecretKey生产环境请从环境变量中获取
  // secretId: process.env.GROUP_SECRET_ID,   // 固定密钥
  // secretKey: process.env.GROUP_SECRET_KEY,  // 固定密钥
  SecretId: process.env.SecretId,
  SecretKey: process.env.SecretKey,
  // 存储桶
  Bucket: 'img-bed-1302216408',
  // 地区
  Region: 'ap-guangzhou'
}
module.exports = config