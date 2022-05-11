<template>
  <view class="index">
    <view class="control-btn-wrapper">
      <view class="control-btn">
        <nut-button class="btn" type="primary" @click="toRecord"
          >收益记录</nut-button
        >
        <nut-button
          class="btn"
          type="info"
          @click="toStatistics"
          >收益统计</nut-button
        >
      </view>
      <view class="control-btn">
        <nut-button
          class="btn"
          type="primary"
          plain
          @click="toBillRecord"
          >推单记录</nut-button
        >
        <nut-button
          class="btn"
          type="info"
          plain
          @click="toReferrerStatistics"
          >推单统计</nut-button
        >
      </view>
    </view>
  </view>
</template>

<script>
import { reactive, toRefs, onBeforeMount } from "vue";
import Taro from "@tarojs/taro";
import utils from "@utils/index";

export default {
  name: "Index",
  components: {},
  setup() {
    const state = reactive({
      msg: "欢迎使用 NutUI3.0 开发小程序",
      msg2: "你成功了～",
      type: "text",
      show: false,
      cover: false,
      account: {},
    });

    const handleClick = (type, msg, cover = false) => {
      state.show = true;
      state.msg2 = msg;
      state.type = type;
      state.cover = cover;
    };

    const getLogin = () => {
      const account = utils.getAccount();
      if (!account || !account.nickname) {
        Taro.showModal({
          title: '提示',
          placeholderText: '请输入昵称',
          editable: true,
          success: ({ content }) => {
            utils
              .request({
                name: "login",
                loadingMessage: "加载中...",
                options: {
                  nickname: content,
                }
              })
              .then((result) => {
                utils.setAccount(result);
                state.account = result;
              });
          }
        })
      }
    };

    const toRecord = () => {
      Taro.navigateTo({ url: "/pages/record/record" });
    };

    const toBillRecord = () => {
      Taro.navigateTo({ url: "/pages/bill-record/billRecord" });
    };

    const toStatistics = () => {
      Taro.navigateTo({ url: "/pages/statistics/statistics" });
    }

    const toReferrerStatistics = () => {
      Taro.navigateTo({ url: "/pages/referrer-list/referrerList" });
    }

    onBeforeMount(() => {
      getLogin()
    })

    return {
      ...toRefs(state),
      handleClick,
      toRecord,
      toStatistics,
      toBillRecord,
      toReferrerStatistics,
    };
  },
};
</script>

<style lang="scss">
.index {
  position: relative;
  width: 100%;
  height: 100%;
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  background: url("https://vanthink.oss-cn-qingdao.aliyuncs.com/2775439e83f2d66b2ebca88d7e500372.jpeg")
    no-repeat center center/100% 100%;
  overflow: hidden;
  .control-btn-wrapper {
    position: relative;
    top: 200px;
    .control-btn {
      margin-bottom: 20px;
      display: flex;
      justify-content: space-around;
    }
    .btn {
      font-size: 20px;
    }
  }
}
</style>
