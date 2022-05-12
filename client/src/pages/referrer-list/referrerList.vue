<template>
  <view
    class="referrer-list">
    <nut-collapse v-model:active="activeNames" icon="down-arrow">
      <nut-collapse-item
        v-for="item in list"
        :key="item._id"
        :title="item.name"
        :name="item.name">
        <template v-slot:sTitle>
          <view>
            <text>足球连{{item.current_football_red ? '红' : '黑'}}:
              {{item.current_football_red ? item.current_football_red : item.current_football_black}}&nbsp;&nbsp;
            </text>
            <text v-if="item.basketball_total">篮球连{{item.current_basketball_red ? '红' : '黑'}}:
              {{item.current_basketball_red ? item.current_basketball_red : item.current_basketball_black}}
            </text>
          </view>
        </template>
        <view class="football-info flex">
          <view class="item">足球当前连红: {{item.current_football_red}}</view>
          <view class="item">足球当前连黑: {{item.current_football_black}}</view>
          <nut-button
            class="detail-btn"
            size="mini"
            @click="toDetail(item, 'football')"
            color="linear-gradient(to right, #ff6034, #ee0a24)">
            详情
          </nut-button>
        </view>
        <view class="flex">
          <view class="item">足球胜率: {{computedFootball(item)}}%</view>
          <view class="item">场数: {{item.football_total}}</view>
        </view>
        <nut-divider v-if="item.basketball_total" dashed></nut-divider>
        <view
          class="basketball-info flex"
          v-if="item.basketball_total">
          <view class="item">篮球当前连红: {{item.current_basketball_red}}</view>
          <view class="item">篮球当前连黑: {{item.current_basketball_black}}</view>
          <nut-button
            class="detail-btn"
            size="mini"
            @click="toDetail(item, 'football')"
            color="linear-gradient(to right, #ff6034, #ee0a24)">
            详情
          </nut-button>
        </view>
        <view class="flex" v-if="item.basketball_total">
          <view class="item">篮球胜率: {{computedBasketball(item)}}%</view>
          <view class="item">场数: {{item.basketball_total}}</view>
        </view>
      </nut-collapse-item>
    </nut-collapse>
  </view>
</template>

<script>
import { reactive, toRefs, ref, computed, onBeforeMount } from "vue";
import Taro from "@tarojs/taro";
import utils from "@utils/index";
export default {
  name: "ReferrerList",
  components: {},
  setup() {
    const activeNames = reactive([1, 2]);
    const state = reactive({
      list: [],
    })
    const title = reactive({
      title1: '标题1',
      title2: '标题2',
      title3: '标题3',
    })

    const getList = () => {
      utils.request({
        name: "referrer",
        loadingMessage: '加载中...',
        options: {
          $url: "list",
        }
      }).then(({ list }) => {
        state.list = list
      })
    }

    const computedFootball = ({ football_total, football_red_total }) => {
      return Math.round(football_red_total / football_total * 100)
    }

    const computedBasketball = ({ basketball_total, basketball_red_total }) => {
      return Math.round(basketball_red_total / basketball_total * 100)
    }

    const toDetail = (item, type) => {
      Taro.navigateTo({
        url: `/pages/referrer-statistics/referrerStatistics?id=${item['_id']}&type=${type}`,
      });
    }

    onBeforeMount(() => {
      getList()
    });

    return {
      activeNames,
      ...toRefs(title),
      ...toRefs(state),
      computedFootball,
      computedBasketball,
      toDetail,
    };
  },
};
</script>

<style lang="scss">
  .referrer-list {
    .flex {
      width: 100%;
      position: relative;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .detail-btn {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
      }
      .item {
        width: 50%;
      }
    }
  }
</style>
