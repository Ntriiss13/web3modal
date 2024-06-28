import type { Connector } from '@web3modal/scaffold'
import { BackpackWalletAdapter } from '@solana/wallet-adapter-backpack'
import { ConstantsUtil } from '@web3modal/common'

import type { BaseWalletAdapter } from '@solana/wallet-adapter-base'

export function syncInjectedWallets(w3mConnectors: Connector[], adapters: BaseWalletAdapter[]) {
  for (const adapter of adapters) {
    const name = adapter.name.toLocaleLowerCase() as keyof Window
    if (window[name]) {
      w3mConnectors.push({
        id: adapter.name,
        type: 'ANNOUNCED',
        imageUrl: adapter.icon,
        name: adapter.name,
        provider: adapter,
        chain: ConstantsUtil.CHAIN.SOLANA
      })
    }
  }

  if (window.backpack) {
    const adapter = new BackpackWalletAdapter()
    w3mConnectors.push({
      id: adapter.name,
      type: 'ANNOUNCED',
      imageUrl: adapter.icon,
      name: adapter.name,
      provider: adapter,
      chain: ConstantsUtil.CHAIN.SOLANA
    })
  }
}
