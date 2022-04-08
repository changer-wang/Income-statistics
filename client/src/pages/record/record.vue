<template>
  <view class="record">
    <nut-form :model-value="formData" ref="ruleForm">
      <nut-form-item
        required
        prop="invest"
        label="投注金额"
        :rules="[{ required: true, message: '请填写投注金额' }]"
      >
        <nut-input
          class="nut-input-text"
          v-model="formData.invest"
          placeholder="请输入投注金额"
          @blur="customBlurValidate('invest')"
          type="digit"
        />
      </nut-form-item>
      <nut-form-item
        required
        label="收益金额"
        prop="income"
        :rules="[{ required: true, message: '请填写收益金额' }]"
      >
        <nut-input
          class="nut-input-text"
          v-model="formData.income"
          placeholder="请输入收益金额"
          @blur="customBlurValidate('income')"
          type="digit"
        />
      </nut-form-item>
      <nut-form-item
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
      <nut-form-item label="收益倍率:">
        <text>{{ formData.invest && formData.income ? sp : "" }}</text>
      </nut-form-item>
      <nut-form-item label="收益率:">
        <text>{{ formData.invest && formData.income ? ratio : "" }}</text>
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
  </view>
</template>

<script>
import { reactive, toRefs, ref, computed } from "vue";
import utils from "@utils/index";
export default {
  name: "Record",
  components: {},
  setup() {
    const state = reactive({
      isShowCalendar: false,
    });

    let formData = reactive({
      invest: null,
      income: null,
      type: "basketball",
      date: "",
      dateWeek: "",
    });

    const ruleForm = ref(null);

    const sp = computed(() => {
      const { income, invest } = formData;
      return (income / invest).toFixed(2);
    });

    const ratio = computed(() => {
      const { income, invest } = formData;
      return `${(((income - invest) / invest) * 100).toFixed(2)}%`;
    });

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
      console.log(new Date(formData.date));
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
              name: "statistics",
              loadingMessage: "加载中...",
              options: {
                $url: "add",
                form: {
                  ...formData,
                  invest: Number(formData.invest),
                  income: Number(formData.income),
                  openid,
                  nickname,
                  user_id: id,
                },
              },
            })
            .then(() => {
              utils.message('添加成功', 'success');
            });
        } else {
          console.log("error submit!!", errors);
        }
      });
    };

    return {
      ...toRefs(state),
      formData,
      ruleForm,
      customBlurValidate,
      sp,
      setChooseValue,
      closeSwitch,
      ratio,
      submit,
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
