import { $, Context, noop, Schema, Time } from 'koishi'
import { DataService } from '@koishijs/console'
import type Assets from '@koishijs/assets'

class MetaProvider extends DataService<MetaProvider.Payload> {
  timestamp = 0
  cached: Promise<MetaProvider.Payload>
  callbacks: MetaProvider.Extension[] = []

  constructor(ctx: Context, private config: MetaProvider.Config) {
    super(ctx, 'meta')

    this.extend(async () => ctx.get('assets')?.stats())

    this.extend(async () => {
      const activeUsers = await ctx.get('database')?.eval('user', row => $.count(row.id), {
        lastCall: { $gt: new Date(new Date().getTime() - Time.day) },
      })
      return { activeUsers }
    })

    this.extend(async () => {
      const activeGuilds = await ctx.get('database')?.eval('channel', row => $.count(row.id), {
        assignee: { $ne: null },
      })
      return { activeGuilds }
    })
  }

  async get() {
    const now = Date.now()
    if (this.timestamp > now) return this.cached
    this.timestamp = now + this.config.metaInterval
    return this.cached = Promise
      .all(this.callbacks.map(cb => cb().catch(noop)))
      .then(data => Object.assign({}, ...data))
  }

  extend(callback: MetaProvider.Extension) {
    this.timestamp = 0
    this.callbacks.push(callback)
  }
}

namespace MetaProvider {
  export interface Config {
    metaInterval?: number
  }

  export const Config: Schema<Config> = Schema.object({
    metaInterval: Schema.natural().role('ms').description('元数据推送的时间间隔。').default(Time.hour),
  })

  export interface Payload extends Assets.Stats {
    activeUsers: number
    activeGuilds: number
    databaseSize: number
  }

  export type Extension = () => Promise<Partial<Payload>>
}

export default MetaProvider
