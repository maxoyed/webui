import { Context, Dict, Runtime, Schema, State } from 'koishi'
import { DataService } from '@koishijs/plugin-console'
import { Manifest, PackageJson } from '@koishijs/registry'

export abstract class PackageProvider extends DataService<Dict<PackageProvider.Data>> {
  constructor(ctx: Context) {
    super(ctx, 'packages', { authority: 4 })

    ctx.on('internal/runtime', (runtime) => {
      this.update(runtime)
    })

    ctx.on('internal/fork', (fork) => {
      this.update(fork)
    })
  }

  abstract getManifest(name: string): Promise<Manifest>

  update(state: State) {
    this.refresh()
  }

  parseRuntime(runtime: Runtime, result: PackageProvider.Data) {
    result.id = runtime.uid
    result.forkable = runtime.isForkable
  }
}

export namespace PackageProvider {
  export interface Data extends Partial<PackageJson> {
    id?: number
    portable?: boolean
    forkable?: boolean
    shortname?: string
    schema?: Schema
    workspace?: boolean
    manifest?: Manifest
  }
}