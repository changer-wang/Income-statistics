// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

const db = cloud.database({
  env: 'cloud1-0ggsoqf7cc0d89ea',
});

const statistics = db.collection('statistics')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })


  app.router('add', async (ctx, next) => {
    const { _req: { event: { form, openid } } } = ctx
    await statistics.add({
      data: {
        ...form,
        openid,
        create_time: db.serverDate(),
        update_time: db.serverDate(),
      }
    })
    ctx.body = {
      code: 200,
      status: true,
    }
  })

  app.router('list', async(ctx, next) => {
    const { _req: { event: { options: { limit, type }, openid } } } = ctx
    const querySize = limit === 'all' ? 1000 : limit

    const params = {
      openid,
    }

    if (type !== 'all') {
      params.type = type
    }
    
    const list = await statistics.where(params).limit(querySize).orderBy('date', 'desc').get()

    ctx.body = {
      code: 200,
      list: list.data,
    }
    
  })

  app.router('delete', async(ctx, next) => {
    const id = ctx._req.event.id
    const result = await statistics.doc(id).remove()
    ctx.body = result.stats.removed
  })

  return app.serve();
}