<template>
  <view class="record">
    <nut-form :model-value="formData" ref="ruleForm">
      <nut-form-item
        required
        label="选择日期:"
        prop="date"
        :rules="[{ required: true, message: '请填写投注日期' }]"
      >
        <view @click="isShowCalendar = true">{{
          formData.date || "请选择日期"
        }}</view>
      </nut-form-item>
      <nut-form-item required label="类型选择" prop="type">
        <nut-radiogroup v-model="formData.type" direction="horizontal">
          <nut-radio shape="button" label="basketball">篮球</nut-radio>
          <nut-radio shape="button" label="football">足球</nut-radio>
        </nut-radiogroup>
      </nut-form-item>
      <nut-form-item
        required
        prop="invest"
        label="赔率"
        :rules="[{ required: true, message: '请填写投注金额' }]"
      >
        <nut-input
          class="nut-input-text"
          v-model="formData.invest"
          placeholder="请输入赔率"
          @blur="customBlurValidate('invest')"
          type="number"
        />
      </nut-form-item>
      <nut-form-item required label="红黑" prop="type">
        <nut-radiogroup v-model="formData.isWin" direction="horizontal">
          <nut-radio shape="button" :label="0">黑</nut-radio>
          <nut-radio shape="button" :label="1">红</nut-radio>
        </nut-radiogroup>
      </nut-form-item>
      <nut-form-item
        required
        label="推荐人"
        prop="referrerName"
        :rules="[{ required: true, message: '请选择推荐人' }]">
        <view @click="showReferrerList = true">{{!formData.referrerName ? '请选择推荐人' : formData.referrerName}}</view>
      </nut-form-item>
    </nut-form>
    <nut-button
      class="sumbit-btn"
      shape="square"
      type="primary"
      @click="submit"
      size="large"
      >提交</nut-button
    >
    <nut-calendar
      :visible="isShowCalendar"
      @close="closeSwitch"
      @choose="setChooseValue"
      :start-date="'2022-01-01'"
      :end-date="'2033-12-31'"
      :is-auto-back-fill="true"
    >
    </nut-calendar>
    <view>
      <nut-picker
        :visible="showReferrerList"
        :columns="referrerList"
        title="选择推荐人"
        @close="showReferrerList = false"
        @confirm="confirmReferrer"
      >
      </nut-picker>
    </view>
  </view>
</template>

<script>
import { reactive, toRefs, ref, computed, onBeforeMount, toRaw } from "vue";
import utils from "@utils/index";
export default {
  name: "BillRecord",
  components: {},
  setup() {
    const state = reactive({
      isShowCalendar: false,
      referrerList: [],
      showReferrerList: false,
      referrerName: '',
      referrerId: null,
    });
    const desc = ref("");

    let formData = reactive({
      invest: null,
      type: "football",
      isWin: 1,
      date: "",
      dateWeek: "",
      referrer: "",
      referrerName: "",
      referrerId: null,
    });

    const ruleForm = ref(null);
    const customBlurValidate = (prop) => {
      ruleForm.value.validate(prop).then(({ valid, errors }) => {
        if (valid) {
          console.log("success", formData);
        } else {
          console.log("error submit!!", errors);
        }
      });
    };

    const setChooseValue = (param) => {
      formData.date = param[3];
      formData.dateWeek = param[4];
    };

    const closeSwitch = () => {
      state.isShowCalendar = false;
    };

    const submit = () => {
      ruleForm.value.validate().then(({ valid, errors }) => {
        if (valid) {
          const { openid, nickname, id } = utils.getAccount();
          utils
            .request({
              name: "referrer",
              loadingMessage: "加载中...",
              options: {
                $url: "add",
                form: {
                  ...formData,
                  openid,
                  nickname,
                  user_id: id,
                },
              },
            })
            .then((res) => {
              console.log(res)
              utils.message("添加成功", "success");
            });
        } else {
          console.log("error submit!!", errors);
        }
      });
    };

    const confirmReferrer = ({ selectedValue, selectedOptions }) => {
      formData.referrerName = selectedOptions[0].text;
      formData.referrerId = selectedOptions[0].value;
      state.showReferrerList = false;
    };

    onBeforeMount(() => {
      utils
        .request({
          name: "referrer",
          loadingMessage: "加载中...",
          options: {
            $url: "list",
          },
        })
        .then(({ list }) => {
          state.referrerList = list.map((item) => ({
            text: item.name,
            value: item._id,
          }));
        });
    });

    return {
      ...toRefs(state),
      formData,
      ruleForm,
      customBlurValidate,
      setChooseValue,
      closeSwitch,
      submit,
      desc,
      confirmReferrer,
    };
  },
};
</script>

<style lang="scss">
.record {
  width: 100%;
  height: 100%;
  overflow: hidden;
  .nut-input {
    padding: 0;
  }
  .sumbit-btn {
    position: absolute;
    bottom: 0;
  }
}
</style>
