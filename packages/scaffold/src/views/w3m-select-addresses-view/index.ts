/* eslint-disable no-console */
import {
  AccountController,
  ConnectionController,
  ModalController,
  OptionsController,
  RouterController,
  type AccountType
} from '@web3modal/core'
import { customElement } from '@web3modal/ui'
import { LitElement, html } from 'lit'
import { state } from 'lit/decorators.js'
import { ifDefined } from 'lit/directives/if-defined.js'
import styles from './styles.js'

@customElement('w3m-select-addresses-view')
export class W3mSelectAddressesView extends LitElement {
  public static override styles = styles
  // -- Members ------------------------------------------- //
  private readonly metadata = OptionsController.state.metadata
  public allAccounts: AccountType[] = AccountController.state.allAccounts
  private selectedAccounts: AccountType[] = []
  // Private selectAll = false

  @state() private isApproving = false
  constructor() {
    super()
    AccountController.subscribeKey('allAccounts', allAccounts => {
      this.allAccounts = allAccounts
    })
    console.log('W3mSelectAddressesView')
    console.log('metadata', this.metadata)
    console.log('selectedAccounts', this.selectedAccounts)
    console.log('allAccounts', this.allAccounts)
  }

  onSelectAll = (event: Event) => {
    console.log('onSelectAll', event)
  }

  onSelect = (account: AccountType, add: boolean) => {
    if (add) {
      this.selectedAccounts.push(account)
    } else {
      this.selectedAccounts = this.selectedAccounts.filter(a => a.address !== account.address)
    }
    console.log('selectedAccounts', this.selectedAccounts)
  }

  // -- Render -------------------------------------------- //
  public override render() {
    return html`
    <wui-flex justifyContent="center" .padding=${['xl', '0', 'xl', '0'] as const}>
      <wui-banner-img imageSrc="${ifDefined(this.metadata?.icons[0])}" text="${ifDefined(
        this.metadata?.url
      )}" size="sm"></wui-banner>
    </wui-flex>
    <wui-flex .padding=${['0', '2xl', '0', 'xl'] as const} justifyContent="space-between">
        <wui-text variant="paragraph-400" color="fg-200">Select all</wui-text>
        <input type="checkbox" @click=${this.onSelectAll.bind(this)} />
    </wui-flex>
      <wui-flex flexDirection="column" .padding=${['l', 'xl', 'xl', 'xl'] as const}>
        ${this.allAccounts.map(account => {
          return html` <wui-list-account
            accountAddress="${account.address}"
            accountType="${account.type}"
          >
            <input
              slot="action"
              type="checkbox"
              ?checked=${this.selectedAccounts.includes(account)}
              @click="${this.handleClick(account)}"
            />
          </wui-list-account>`
        })}
      </wui-flex>
      <wui-flex .padding=${['l', 'xl', 'xl', 'xl'] as const} gap="s" justifyContent="space-between">
        <wui-button
          size="md"
          ?fullwidth=${true}
          variant="neutral"
          @click=${this.onCancel.bind(this)}
          data-testid="w3m-connecting-siwe-cancel"
        >
          Cancel
        </wui-button>
        <wui-button
          size="md"
          ?fullwidth=${true}
          variant="main"
          @click=${this.onContinue.bind(this)}
          ?loading=${this.isApproving}
        >
          ${this.isApproving ? 'Signing...' : 'Continue'}
        </wui-button>
      </wui-flex>
    `
  }

  // -- Private ------------------------------------------- //

  private handleClick = (account: AccountType) => (event: Event) => {
    const target = event.target as HTMLInputElement
    console.log('handleClick', event, this.onSelect)
    this.onSelect?.({ ...account }, target?.checked)
  }

  private onContinue() {
    if (this.selectedAccounts.length !== 0) {
      this.isApproving = true
      AccountController.setAllAccounts(this.selectedAccounts)
      AccountController.setShouldUpdateToAddress(this.selectedAccounts[0]?.address ?? '')
      this.isApproving = false
    }
    ModalController.close()
  }

  private async onCancel() {
    const { isConnected } = AccountController.state
    if (isConnected) {
      await ConnectionController.disconnect()
      ModalController.close()
    } else {
      RouterController.push('Connect')
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'w3m-select-addresses-view': W3mSelectAddressesView
  }
}
