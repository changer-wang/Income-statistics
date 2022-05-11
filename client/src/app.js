import { createApp } from 'vue'
import Taro from '@tarojs/taro'
import {
  Button,
  Toast,
  Form,
  FormItem,
  Cell,
  CellGroup,
  Price,
  Input,
  Radio,
  RadioGroup,
  Calendar,
  Popup,
  Icon,
  OverLay,
  Popover,
  InfiniteLoading,
  Menu,
  MenuItem,
  Swipe,
  Empty,
  Drag,
  Picker,
  Collapse,
  CollapseItem,
  Divider,
} from '@nutui/nutui-taro';

import './app.scss'
import './assets/font/iconfont.css';

const App = createApp({
  onShow (options) {
    if (process.env.TARO_ENV === 'weapp') {
      Taro.cloud.init({
        env: 'cloud1-0ggsoqf7cc0d89ea',
        traceUser: true,
      })
    }
  },
  // 入口组件不需要实现 render 方法，即使实现了也会被 taro 所覆盖
})


App.use(Button)
App.use(Toast)
App.use(Form)
App.use(FormItem)
App.use(Cell)
App.use(CellGroup)
App.use(Input)
App.use(Radio)
App.use(RadioGroup)
App.use(Calendar)
App.use(Popup)
App.use(Icon)
App.use(Popover)
App.use(InfiniteLoading)
App.use(Menu)
App.use(MenuItem)
App.use(Swipe)
App.use(Empty)
App.use(Drag)
App.use(OverLay)
App.use(Price)
App.use(Picker)
App.use(Collapse)
App.use(CollapseItem)
App.use(Divider)



export default App
