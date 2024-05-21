import { html, LitElement } from 'lit'
import { property } from 'lit/decorators.js'
import '../../components/wui-text/index.js'
import '../../components/wui-image/index.js'
import '../../layout/wui-flex/index.js'
import { elementStyles, resetStyles } from '../../utils/ThemeUtil.js'
import { customElement } from '../../utils/WebComponentsUtil.js'
import styles from './styles.js'
import { UiHelperUtil } from '../../utils/UiHelperUtil.js'
import { W3mFrameRpcConstants } from '@web3modal/wallet'
import { AccountController, OptionsController, StorageUtil } from '@web3modal/core'

@customElement('wui-list-account')
export class WuiListAccount extends LitElement {
  public static override styles = [resetStyles, elementStyles, styles]

  // -- State & Properties -------------------------------- //
  @property() public accountAddress = ''

  @property() public accountType = ''

  // Fetch balance from the blockchain
  @property({ type: Number }) public balance = 23.18

  private readonly connectedConnector = StorageUtil.getConnectedConnector()
  private readonly enableWalletFeatures = OptionsController.state.enableWalletFeatures
  private readonly labels = AccountController.state.addressLabels

  @property({ type: Boolean }) public selected = false

  @property({ type: Function }) public onSelect?: (
    { address, type }: { address: string; type: string },
    selected: boolean
  ) => void

  handleClick = (event: Event) => {
    console.log('handleClick', event, this.onSelect)
    this.onSelect?.(
      { address: this.accountAddress, type: this.accountType },
      // @ts-expect-error - checked is available on the event
      event?.target?.checked
    )
  }
  // -- Render -------------------------------------------- //
  public override render() {
    let label = this.labels?.get(this.accountAddress)
    console.log('WuiListAccount', this.accountAddress, this.accountType, label)

    // If there is no provided label, set one depending on the account type
    if (!label && this.enableWalletFeatures && this.connectedConnector === 'AUTH') {
      label = `${this.accountType === 'eoa' ? 'Email' : 'Smart'} Account`
    }

    return html`
      <wui-flex
        flexDirection="row"
        justifyContent="space-between"
        .padding=${['s', 'xs', 's', '1xs'] as const}
      >
        <wui-flex alignItems="center">
          <wui-avatar address=${this.accountAddress}></wui-avatar>
          <wui-icon-box
            size="sm"
            iconcolor="fg-200"
            backgroundcolor="fg-300"
            icon=${this.accountType === W3mFrameRpcConstants.ACCOUNT_TYPES.EOA
              ? 'mail'
              : 'lightbulb'}
            background="fg-300"
          ></wui-icon-box>
          <wui-flex flexDirection="column">
            <wui-text class="address" variant="paragraph-500" color="fg-100"
              >${UiHelperUtil.getTruncateString({
                string: this.accountAddress,
                charsStart: 4,
                charsEnd: 6,
                truncate: 'middle'
              })}</wui-text
            >
            <wui-text class="address-description" variant="small-400">${label}</wui-text></wui-flex
          >
        </wui-flex>
        <wui-flex gap="s" alignItems="center">
          <wui-text variant="small-400">$${this.balance.toFixed(2)}</wui-text>
          <slot name="action"></slot>
        </wui-flex>
      </wui-flex>
    `
  }

  /*
   * Private templateIcon() {
   *   // Const color: 'accent-100' | 'error-100' | 'success-100' | 'inverse-100' = 'accent-100'
   */

  //   Const icon = 'mail'

  /*
   *   Return html`
   *     <wui-icon-box
   *       size="xxs"
   *       background=""
   *       color="accent-100"
   *       icon=${icon}
   *       ?border=${true}
   *       borderColor="wui-color-bg-125"
   *     ></wui-icon-box>
   *   `
   * }
   */
}

declare global {
  interface HTMLElementTagNameMap {
    'wui-list-account': WuiListAccount
  }
}
