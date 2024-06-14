import {
  AccountController,
  AssetUtil,
  ChainController,
  CoreHelperUtil,
  ModalController,
  NetworkController
} from '@web3modal/core'

import type { WuiAccountButton } from '@web3modal/ui'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { property, state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'

@customElement('w3m-account-button')
export class W3mAccountButton extends LitElement {
  // -- Members ------------------------------------------- //
  private unsubscribe: (() => void)[] = []

  // -- State & Properties -------------------------------- //
  @property({ type: Boolean }) public disabled?: WuiAccountButton['disabled'] = false

  @property() public balance?: 'show' | 'hide' = 'show'

  @property() public charsStart?: WuiAccountButton['charsStart'] = 4

  @property() public charsEnd?: WuiAccountButton['charsEnd'] = 6

  @state() private address = AccountController.getProperty('address')

  @state() private balanceVal = AccountController.getProperty('balance')

  @state() private balanceSymbol = AccountController.getProperty('balanceSymbol')

  @state() private profileName = AccountController.getProperty('profileName')

  @state() private profileImage = AccountController.getProperty('profileImage')

  @state() private network = NetworkController.activeNetwork()

  @state() private isUnsupportedChain = NetworkController.state.isUnsupportedChain

  // -- Lifecycle ----------------------------------------- //
  public constructor() {
    super()
    this.unsubscribe.push(
      ...[
        ChainController.subscribe(val => {
          const accountState = val.activeChain
            ? val.chains[val.activeChain]?.accountState
            : undefined
          if (accountState && accountState.isConnected) {
            this.address = accountState.address
            this.balanceVal = accountState.balance
            this.profileName = accountState.profileName
            this.profileImage = accountState.profileImage
            this.balanceSymbol = accountState.balanceSymbol
          } else {
            this.address = ''
            this.balanceVal = ''
            this.profileName = ''
            this.profileImage = ''
            this.balanceSymbol = ''
          }
        }),
        NetworkController.subscribe(val => {
          this.network = NetworkController.activeNetwork()
          this.isUnsupportedChain = val.isUnsupportedChain
        })
      ]
    )
  }

  public override disconnectedCallback() {
    this.unsubscribe.forEach(unsubscribe => unsubscribe())
  }

  // -- Render -------------------------------------------- //
  public override render() {
    const networkImage = AssetUtil.getNetworkImage(this.network)
    const showBalance = this.balance === 'show'

    return html`
      <wui-account-button
        .disabled=${Boolean(this.disabled)}
        .isUnsupportedChain=${this.isUnsupportedChain}
        address=${ifDefined(this.address)}
        profileName=${ifDefined(this.profileName)}
        networkSrc=${ifDefined(networkImage)}
        avatarSrc=${ifDefined(this.profileImage)}
        balance=${showBalance
          ? CoreHelperUtil.formatBalance(this.balanceVal, this.balanceSymbol)
          : ''}
        @click=${this.onClick.bind(this)}
        data-testid="account-button"
        .charsStart=${this.charsStart}
        .charsEnd=${this.charsEnd}
      >
      </wui-account-button>
    `
  }

  // -- Private ------------------------------------------- //
  private onClick() {
    if (this.isUnsupportedChain) {
      ModalController.open({ view: 'UnsupportedChain' })
    } else {
      ModalController.open()
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-account-button': W3mAccountButton
  }
}