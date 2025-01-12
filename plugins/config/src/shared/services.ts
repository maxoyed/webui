import { DataService } from '@koishijs/console'
import { Context, Dict } from 'koishi'

export class ServiceProvider extends DataService<Dict<number>> {
  constructor(ctx: Context) {
    super(ctx, 'services')
    ctx.on('internal/service', () => this.refresh())
  }

  async get() {
    const services = {} as Dict<number>
    const attach = (internal: Context[typeof Context.internal]) => {
      if (!internal) return
      attach(Object.getPrototypeOf(internal))
      for (const [key, { type }] of Object.entries(internal)) {
        if (type !== 'service') continue
        const ctx: Context = this.ctx.get(key)?.[Context.source]
        if (ctx) {
          const name = key.replace(/^__/, '').replace(/__$/, '')
          services[name] = ctx.scope.uid
        }
      }
    }
    attach(this.ctx.root[Context.internal])
    return services
  }
}
