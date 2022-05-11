<template>
  <view
    class="referrer-statistics"
    @click="closeOverlay"
    :class="[state.showBasic ? '' : 'hide-overlay']">
    <nut-menu>
      <nut-menu-item v-model="state.limit"
        :options="state.month"
        @change="handleChange"
       />
      <nut-menu-item
        v-model="state.type"
        @change="handleChange"
        :options="state.typeList"
        :use-window="false"
      />
    </nut-menu>
    <nut-popup
      pop-class="analyse-wrapper"
      position="left"
      :z-index="9999"
      :visible="state.showBasic">
      <view class="analyse-content">
        <view class="analyse-title">分析情况</view>
        <nut-cell-group
          :title="`近${state.list.length}场收益记录`"
          :desc="`${state.list.length}中${winCount}`">
          <nut-cell title="最高连红">
            <template v-slot:link>
              <nut-price
              :price="winningStreak"
              size="normal"
              position="after"
              :decimal-digits="0"
              :need-symbol="false"
              :thousands="true" />
            </template>
          </nut-cell>
          <nut-cell title="最高连黑">
            <template v-slot:link>
              <nut-price
              :price="losingStreak"
              size="normal"
              :decimal-digits="0"
              :need-symbol="false" />
            </template>
          </nut-cell>
          <nut-cell title="胜率">
            <template v-slot:link>
              <nut-price
              :price="winCount / state.list.length * 100"
              size="normal"
              position="after"
              symbol="%"
              :decimal-digits="2"
              :need-symbol="true"
              :thousands="true" />
            </template>
          </nut-cell>
        </nut-cell-group>
      </view>
    </nut-popup>
    <nut-drag
      class="analyse-btn-wrapper"
      direction="y">
      <nut-button
        class="analyse-btn"
        shape="square"
        type="info"
        @click="openPop"
        >查看分析</nut-button>
    </nut-drag>
    <view class="table-head">
      <view class="date">日期</view>
      <view class="into">赔率</view>
      <view class="type">类型</view>
    </view>
    <ul class="infiniteUl" id="scroll">
      <nut-infiniteloading
        containerId="scroll"
        :use-window="false"
        :is-open-refresh="true"
        @refresh="refresh"
        @load-more="loadMore"
        :has-more="state.hasMore">
        <nut-empty
          v-if="!state.list.length"
          image="error"
          description="无数据"></nut-empty>
        <nut-swipe
          class="item" v-for="(item, index) in state.list"
          v-else
          :key="item._id"
        >
          <view
            round-radius="0"
            :style="{ background: item.is_win ? 'rgba(233, 59, 38, 0.8)' : 'rgba(45, 45, 45, 1)' }"
            class="item-content">
            <view class="date">{{formDate(item.date)}}</view>
            <view>{{item.invest}}</view>
            <view class="type">
              <img
                v-if="item.type !== 'basketball'"
                mode="widthFix"
                src="https://vanthink.oss-cn-qingdao.aliyuncs.com/23ead818aa66f09b9a63fa7455187c38.png" alt="">
              <img
                v-else
                mode="widthFix"
                src="https://vanthink.oss-cn-qingdao.aliyuncs.com/1e1415d447b366b1fa3c46bed151ef91.png" alt="">
            </view>
          </view>
          <template #right>
            <nut-button
              shape="square"
              style="height:100%"
              @click="deleteItem(item, index)"
              type="danger">删除</nut-button>
          </template>
        </nut-swipe>
      </nut-infiniteloading>
    </ul>
  </view>
</template>

<script>
import { reactive, computed, onBeforeMount, toRaw } from "vue";
import Taro from "@tarojs/taro";
import utils from "@utils/index";
export default {
  name: "ReferrerStatistics",
  components: {},
  setup() {
    const state = reactive({
      month: [
        { text: "全部", value: "all" },
        { text: "近30次", value: 30 },
        { text: "近60次", value: 60 },
        { text: "近90次", value: 90 },
      ],
      typeList: [
        { text: "全部", value: "all" },
        { text: "篮球", value: "basketball" },
        { text: "足球", value: "football" },
      ],
      limit: 30,
      type: "all",
      list: [],
      navVisible: false,
      hasMore: true,
      showBasic: false,
      site: 0,
      id: null,
    });

    const handleChange = () => {
      getList()
    };

    const formDate = (date) => {
      return utils.Date.format(new Date(date), 'MM-dd')
    }

    const deleteItem = (item, index) => {
      utils.request({
        name: "referrer",
        loadingMessage: '删除中...',
        options: {
          $url: "delete",
          id: item._id,
          is_win: item.is_win,
          referrer_Id: item.referrer_Id,
          site: index + 1,
          type: item.type,
        }
      }).then((res) => {
        if (res) {
          utils.message('删除成功', 'success')
          getList()
        }
      })
    }

    const getList = (type, callback) => {
      utils
        .request({
          name: "referrer",
          loadingMessage: "加载中...",
          options: {
            $url: "statisticsList",
            options: {
              limit: state.limit,
              type: state.type,
              id: state.id,
            }
          },
        })
        .then(({ list }) => {
          state.list = list
          state.hasMore = false;
          if (type === 'refresh' && callback) {
            callback()
            utils.message('刷新成功!', 'success')
          }
        })
    }

    const getReferrer = (id) => {
      utils.request({
          name: "referrer",
          loadingMessage: "加载中...",
          options: {
            $url: "referrer",
            options: {
              id: state.id,
            }
          },
        }).then((res) => {
          console.log(res)
        })
    }

    const loadMore = (e) => {
      console.log(e)
    }

    const refresh = (done) => {
      getList('refresh', done)
    }

    const openPop = (e) => {
      e.stopPropagation()
      state.showBasic = !state.showBasic
    }

    const closeOverlay = () => {
      state.showBasic = false;
    }

    const investTotal = computed(() => {
      const list = toRaw(state.list)
      if (list.length) {
        return list.reduce((pre, cur) => {
          return pre + cur.invest
        }, 0)
      }
      return 0
    })

    const incomeTotal = computed(() => {
      const list = toRaw(state.list)
      if (list.length) {
        return list.reduce((pre, cur) => {
          return pre + cur.income
        }, 0)
      }
      return 0
    })

    const winningStreak = computed(() => {
      const list = toRaw(state.list)
      let max = 0
      let total = 0
      for (let i = 0; i < list.length; i+=1) {
        if (list[i].is_win > 0) {
          total += 1
        }
        if (!list[i + 1] || (list[i + 1] && !list[i + 1].is_win)) {
          if (total && total > max) {
            state.redSite = i;
            max = total
          }
          total = 0
        }
      }
      return max
    })

    const losingStreak = computed(() => {
      const list = toRaw(state.list)
      let max = 0
      let total = 0
      for (let i = 0; i < list.length; i+=1) {
        if (!list[i].is_win) {
          total += 1
        }
        if (!list[i + 1] || (list[i + 1] && list[i + 1].is_win)) {
          if (total && total > max) {
            state.blackSite = i;
            max = total
          }
          total = 0
        }
      }
      return max
    })

    const winCount = computed(() => {
      const list = toRaw(state.list)
      return list.filter(item => item.is_win).length
    })

    onBeforeMount(() => {
      const { params: { id, type: ballType } } = Taro.getCurrentInstance().router;
      state.type = ballType
      state.id = id
      getReferrer()
      getList()
    })

    return {
      state,
      handleChange,
      formDate,
      deleteItem,
      loadMore,
      refresh,
      openPop,
      closeOverlay,
      investTotal,
      incomeTotal,
      winningStreak,
      losingStreak,
      winCount,
    };
  },
};
</script>

<style lang="scss">
.referrer-statistics {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .table-head {
    display: flex;
    text-align: center;
    background: #eeeeee;
    view {
      box-sizing: border-box;
      width: 25%;
      height: 30px;
      line-height: 30px;
    }
  }
  .analyse-wrapper {
    position: absolute;
    width: 65%;
    height: 100%;
    .analyse-content {
      .analyse-title {
        margin-top: 5px;
        font-size: 16px;
        font-weight: 700;
        text-align: center;
      }
      .nut-cell-group__desc {
        font-size: 16px;
        color: red;
      }
    }
  }
  .analyse-btn-wrapper {
    .analyse-btn {
      position: absolute;
      left: calc(100vw - 100px);
      width: 100px;
      height: 50px;
      line-height: 50px;
      border-radius: 45px 0 0 45px;
    }
  }
  .infiniteUl {
    flex: 1;
    width: 100%;
    padding: 0;
    margin: 0;
    overflow-y: auto;
    overflow-x: hidden;
    background: #eee;
    .nut-empty {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .item {
      margin-bottom: 10px;
      .item-content {
        display: flex;
        height: 60px;
        line-height: 60px;
        font-size: 16px;
        text-align: center;
        color: #fff;
        view {
          width: 25%;
        }
        .type {
          display: flex;
          justify-content: center;
          align-items: center;
          img {
            width: 20px;
            height: auto;
          }
        }
      }
    }
  }
}
.hide-overlay {
  .nut-overlay {
    display: none;
  }
}
</style>
