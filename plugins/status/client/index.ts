import { Context } from '@koishijs/client'
import {} from '@koishijs/plugin-status/src'
import Bots from './bots'
import Load from './load'
import Analytics from './analytics.vue'
import Config from './config.vue'
import EnvInfo from './envinfo.vue'
import './icons'

import 'virtual:uno.css'

export default (ctx: Context) => {
  ctx.plugin(Bots)
  ctx.plugin(Load)

  ctx.slot({
    type: 'status-left',
    component: EnvInfo,
  })

  ctx.slot({
    type: 'analytic-number',
    component: Analytics,
  })

  ctx.slot({
    type: 'plugin-details',
    component: Config,
    order: -500,
  })
}
