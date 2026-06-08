/**
 * Shared XLM payment gateway used by the subscription + template-purchase flows.
 *
 * Builds a native-asset payment, signs it through the connected wallet, submits
 * it to Horizon, and returns the tx hash — with funding checks, a sane fee, the
 * 28-byte memo guard, and human-readable error decoding (never a raw SDK throw).
 */

type SignFn = (xdr: string, networkPassphrase?: string) => Promise<string>

export interface PayParams {
  signTransaction: SignFn
  payerAddress: string
  destination: string
  amount: string | number
  memo: string
  /** 'testnet' | 'mainnet' (or the WalletNetwork enum value). Defaults to testnet. */
  network?: string
}

const TESTNET_HORIZON = 'https://horizon-testnet.stellar.org'
const MAINNET_HORIZON = 'https://horizon.stellar.org'

function isTestnetNetwork(network?: string): boolean {
  if (!network) return true
  const n = String(network).toLowerCase()
  return n.includes('test') // 'testnet' | 'TESTNET' | WalletNetwork.TESTNET passphrase
}

/** Map a Horizon/SDK failure into a clear, actionable message. */
export function decodeStellarError(err: any): string {
  const rc = err?.response?.data?.extras?.result_codes
  if (rc) {
    const codes = [rc.transaction, ...(rc.operations || [])].filter(Boolean).join(', ')
    if (/underfunded|insufficient|low_reserve/i.test(codes))
      return 'Insufficient XLM balance to cover the payment and network fee.'
    if (/tx_bad_seq/i.test(codes)) return 'Wallet sequence is out of date — please retry.'
    if (/bad_auth|tx_bad_auth/i.test(codes)) return 'The signature was rejected by the network.'
    if (/no_destination/i.test(codes)) return 'The destination account does not exist on this network.'
    if (codes) return `Payment rejected by the network (${codes}).`
  }
  const msg = String(err?.message || '')
  if (/user rejected|denied|declined|cancel/i.test(msg)) return 'You cancelled the signing request.'
  if (/not found|404|Resource Missing/i.test(msg))
    return 'Your wallet account is not funded on this network. Fund it first, then retry.'
  if (/memo/i.test(msg)) return 'Payment reference is invalid. Please restart the purchase.'
  return msg || 'Payment failed. Please try again.'
}

export async function payWithWallet({
  signTransaction,
  payerAddress,
  destination,
  amount,
  memo,
  network,
}: PayParams): Promise<{ hash: string }> {
  // Stellar text memos are capped at 28 bytes.
  if (new TextEncoder().encode(memo).length > 28) {
    throw new Error('Payment reference is invalid (too long). Please restart the purchase.')
  }

  const StellarSdk: any = await import('@stellar/stellar-sdk')
  const { Asset, Networks, TransactionBuilder, Operation, Memo } = StellarSdk

  const testnet = isTestnetNetwork(network)
  const horizonUrl = testnet ? TESTNET_HORIZON : MAINNET_HORIZON
  const networkPassphrase = testnet ? Networks.TESTNET : Networks.PUBLIC
  const Server = StellarSdk.Horizon?.Server || StellarSdk.Server
  const server = new Server(horizonUrl)

  // Load the source account (clear message if unfunded on this network).
  let account: any
  try {
    account = await server.loadAccount(payerAddress)
  } catch {
    throw new Error(
      `Your wallet (${payerAddress.slice(0, 6)}…) is not funded on ${testnet ? 'testnet' : 'mainnet'}. ` +
        'Fund it first, then retry.',
    )
  }

  // Use the current network base fee (with a safe floor) instead of a hardcoded 100.
  let fee = '1000'
  try {
    const base = await server.fetchBaseFee()
    fee = String(Math.max(1000, Number(base) || 100))
  } catch {
    /* fall back to the floor */
  }

  const tx = new TransactionBuilder(account, { fee, networkPassphrase })
    .addOperation(Operation.payment({ destination, asset: Asset.native(), amount: String(amount) }))
    .addMemo(Memo.text(memo))
    .setTimeout(120)
    .build()

  let signedXdr: string
  try {
    signedXdr = await signTransaction(tx.toXDR(), networkPassphrase)
  } catch (err: any) {
    throw new Error(decodeStellarError(err))
  }
  if (!signedXdr) throw new Error('The wallet did not return a signed transaction.')

  try {
    const signed = TransactionBuilder.fromXDR(signedXdr, networkPassphrase)
    const result = await server.submitTransaction(signed)
    if (!result?.hash) throw new Error('Transaction was not accepted by the network.')
    return { hash: result.hash }
  } catch (err: any) {
    throw new Error(decodeStellarError(err))
  }
}
