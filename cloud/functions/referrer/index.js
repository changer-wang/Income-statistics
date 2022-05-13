// 云函数入口文件
const cloud = require('wx-server-sdk')
const TcbRouter = require('tcb-router')

cloud.init()

const db = cloud.database({
  env: 'cloud1-0ggsoqf7cc0d89ea',
});
const _ = db.command

const referrer = db.collection('referrer')
const referrerStatistics = db.collection('referrer_statistics')

// 云函数入口函数
exports.main = async (event, context) => {
  const app = new TcbRouter({
    event
  })

  app.router('list', async(ctx, next) => {

    const list = await referrer.get()

    ctx.body = {
      code: 200,
      list: list.data,
    }

  })

  app.router('add', async(ctx, nemxt) => {
    const { _req: { event: { form, openid } } } = ctx
    const { referrerId, invest, type, isWin, date, dateWeek } = form
    const options = {}
    const { data: currentData } = await referrer.doc(referrerId).get()
    if (!currentData[`history_${type}_red`]) {
      options[`history_${type}_red`] = 0
    }
    if (!currentData[`history_${type}_black`]) {
      options[`history_${type}_black`] = 0
    }
    options[`${type}_total`] = _.inc(1)
    if (isWin) {
      options[`${type}_red_total`] = _.inc(1)
      options[`current_${type}_red`] = _.inc(1)
      options[`current_${type}_black`] = 0

      if (currentData[`current_${type}_red`] + 1 > currentData[`history_${type}_red`]) {
        options[`history_${type}_red`] = currentData[`current_${type}_red`] + 1
      }
    } else {
      options[`current_${type}_black`] = _.inc(1)
      options[`current_${type}_red`] = 0
      if (currentData[`current_${type}_black`] + 1 > currentData[`history_${type}_black`]) {
        options[`history_${type}_black`] = currentData[`current_${type}_black`] + 1
      }
    }
    await referrer.doc(referrerId).update({
      data: options,
    })
    await referrerStatistics.add({
      data: {
        referrer_Id: referrerId,
        invest: Number(invest),
        type,
        is_win: isWin,
        date,
        openid,
        date_week: dateWeek,
      }
    })
    ctx.body = {
      code: 200,
      data: true,
    }
  })

  app.router('statisticsList', async(ctx, next) => {
    const { _req: { event: { options: { limit, type, id } } } } = ctx
    const querySize = limit === 'all' ? 1000 : limit

    const params = {
      referrer_Id: id,
    }

    if (type !== 'all') {
      params.type = type
    }
    
    const list = await referrerStatistics.where(params).limit(querySize).orderBy('date', 'desc').get()

    ctx.body = {
      code: 200,
      list: list.data,
    }
    
  })

  app.router('delete', async(ctx, next) => {
    const { _req: { event: { referrer_Id, is_win, site, type, id } } } = ctx
    const { data: currentData } = await referrer.doc(referrer_Id).get()

    const options = {}


    if (is_win && site <= currentData[`current_${type}_red`]) {
      options[`current_${type}_red`] = _.inc(-1)
      options[`${type}_total`] = _.inc(-1)
    } else if (!is_win && site <= currentData[`current_${type}_black`]) {
      options[`current_${type}_black`] = _.inc(-1)
      options[`${type}_total`] = _.inc(-1)
    }

    if (Object.keys(options).length) {
      await referrer.doc(referrer_Id).update({
        data: options,
      })
    }

    const result = await referrerStatistics.doc(id).remove()
    ctx.body = result.stats.removed
  })

  app.router('referrer', async(ctx, next) => {
    const id = ctx._req.event.options.id
    const result = await referrer.doc(id).get()
    ctx.body = {
      code: 200,
      referrer: result.data
    }
  })

  return app.serve();
}