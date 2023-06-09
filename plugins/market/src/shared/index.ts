import { Context, Dict, Logger, Time } from 'koishi'
import { DataService } from '@koishijs/plugin-console'
import { AnalyzedPackage, MarketResult, RemotePackage } from '@koishijs/registry'

declare module '@koishijs/plugin-console' {
  interface Events {
    'market/refresh'(): void
  }

  namespace Console {
    interface Services {
      market: MarketProvider
    }
  }
}

export interface Dependency {
  /**
   * requested semver range
   * @example `^1.2.3` -> `1.2.3`
   */
  request: string
  /**
   * installed package version
   * @example `1.2.5`
   */
  resolved?: string
  /** whether it is a workspace package */
  workspace?: boolean
  /** all available versions */
  versions?: Dict<Pick<RemotePackage, typeof Dependency.keys[number]>>
  /** latest version */
  latest?: string
  /** valid (unsupported) syntax */
  invalid?: boolean
}

export namespace Dependency {
  export const keys = ['peerDependencies', 'peerDependenciesMeta', 'deprecated'] as const
}

const logger = new Logger('market')

export abstract class MarketProvider extends DataService<MarketProvider.Payload> {
  private _task: Promise<any>
  private _timestamp = 0
  protected _error: any

  constructor(ctx: Context) {
    super(ctx, 'market', { authority: 4 })

    ctx.console.addListener('market/refresh', () => this.start(), { authority: 4 })

    ctx.on('console/connection', async (client) => {
      if (!ctx.console.clients[client.id]) return
      if (Date.now() - this._timestamp <= Time.hour * 12) return
      if (await this.ctx.serial('console/intercept', client, { authority: 4 })) return
      this.start()
    })
  }

  start() {
    this._task = null
    this._timestamp = Date.now()
  }

  abstract collect(): Promise<void | MarketResult>

  async prepare(): Promise<MarketResult> {
    return this._task ||= this.collect().catch((error) => {
      logger.warn(error)
      this._error = error
    })
  }
}

export namespace MarketProvider {
  export interface Payload {
    data: Dict<AnalyzedPackage>
    total: number
    failed: number
    progress: number
    gravatar?: string
  }
}
