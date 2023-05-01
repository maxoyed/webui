import { App } from 'vue'
import form from 'schemastery-vue'
import Computed from './computed.vue'
import Comment from './k-comment.vue'
import Filter from './k-filter.vue'
import Form from './k-form.vue'

form.extensions.add({
  type: 'union',
  role: 'computed',
  component: Computed,
})

export * from 'schemastery-vue'

function components(app: App) {
  app.use(form)
  app.component('k-comment', Comment)
  app.component('k-filter', Filter)
  app.component('k-form', Form)
}

namespace components {
  export const extensions = form.extensions
  export type Extension = form.Extension
}

export default components