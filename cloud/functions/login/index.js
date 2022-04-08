const cloud = require('wx-server-sdk')

cloud.init({
  env: 'cloud1-0ggsoqf7cc0d89ea'
})

const db = cloud.database({
  env: 'cloud1-0ggsoqf7cc0d89ea',
});

const user = db.collection('user')


exports.main = async ({ nickname = '' }) => {
  const wxContext = cloud.getWXContext()

  let data = {}

  const res = await user.where({
      openid: wxContext.OPENID
    }).get()

  if (res.data.length) {
    data = res.data[0]
  } else {
    const res1 = await user.add({
      data: {
        openid: wxContext.OPENID,
        nickname,
      }
    })
    data = {
      _id: res1._id,
      openid: wxContext.OPENID,
      nickname,
    }
  }
  
  return data
}