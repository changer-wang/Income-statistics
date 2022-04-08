// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database({
  env: 'cloud1-0ggsoqf7cc0d89ea',
});

const statistics = db.collection('statistics')

// 云函数入口函数
exports.main = async (event, context) => {
  statistics.add({
    data: {
      ...params,
      create_time: db.serverDate(),
      update_time: db.serverDate(),
    }
  })

  return true
}