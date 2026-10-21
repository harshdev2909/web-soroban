// On-chain PayLoop actions. Loaded on demand so the Stellar SDK stays out of
// the page's initial bundle.
import {
  Address,
  Asset,
  Contract,
  Horizon,
  Operation,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  type xdr,
} from '@stellar/stellar-sdk'
import { getNetwork, type NetworkId } from '@/lib/networks'
import { HORIZON_URL, RPC_URL, USDC_ISSUER, type PayLoopConfig, type WalletFunds, type WalletSigner } from '@/lib/payloop'

/** Allowances stay valid ~100 days; the contract requires at least one day. */
const ALLOWANCE_LEDGERS = 100 * 17_280

async function rpcCall<T>(network: NetworkId, method: string, params: Record<string, unknown>): Promise<T> {
  const response = await fetch(RPC_URL[network], {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: Date.now(), method, params }),
  })
  const body = await response.json()
  if (body.error) throw new Error(body.error.message || `${method} failed.`)
  return body.result as T
}

/**
 * Submit a signed transaction and wait for it. Uses raw JSON-RPC for send and
 * status so newer ledger metadata formats never need decoding in the browser.
 */
async function sendAndConfirm(network: NetworkId, signedXdr: string): Promise<string> {
  const sent = await rpcCall<{ hash: string; status: string; errorResultXdr?: string }>(network, 'sendTransaction', { transaction: signedXdr })
  if (sent.status === 'ERROR') throw new Error('The network rejected the transaction. Check your balance and retry.')
  if (sent.status === 'TRY_AGAIN_LATER') throw new Error('The network is busy. Retry in a few seconds.')
  const deadline = Date.now() + 60_000
  while (Date.now() < deadline) {
    const result = await rpcCall<{ status: string }>(network, 'getTransaction', { hash: sent.hash })
    if (result.status === 'SUCCESS') return sent.hash
    if (result.status === 'FAILED') throw new Error(`Transaction ${sent.hash.slice(0, 8)}… failed on-chain.`)
    await new Promise((resolve) => setTimeout(resolve, 1_000))
  }
  throw new Error('The transaction was not confirmed in time. Check the explorer before retrying.')
}

export interface InvokeResult {
  hash: string
  /** Return value from simulation, decoded. */
  simulated: unknown
}

/** Simulate, have the wallet sign, submit, and confirm a PayLoop contract call. */
export async function invokePayLoop(
  config: PayLoopConfig,
  wallet: WalletSigner,
  method: string,
  args: xdr.ScVal[],
): Promise<InvokeResult> {
  if (!config.contractId) throw new Error('PayLoop is not deployed on this server.')
  const network = getNetwork(config.network)
  const server = new rpc.Server(RPC_URL[config.network])
  const account = await server.getAccount(wallet.address)
  const transaction = new TransactionBuilder(account, { fee: '10000', networkPassphrase: network.passphrase })
    .addOperation(new Contract(config.contractId).call(method, ...args))
    .setTimeout(120)
    .build()
  const simulation = await server.simulateTransaction(transaction)
  if (rpc.Api.isSimulationError(simulation)) throw new Error(simulation.error)
  const prepared = rpc.assembleTransaction(transaction, simulation).build()
  const signed = await wallet.signTransaction(prepared.toXDR(), network.passphrase)
  const hash = await sendAndConfirm(config.network, signed)
  return { hash, simulated: simulation.result ? scValToNative(simulation.result.retval) : undefined }
}

export async function allowanceLiveUntil(config: PayLoopConfig): Promise<number> {
  const latest = await new rpc.Server(RPC_URL[config.network]).getLatestLedger()
  return latest.sequence + ALLOWANCE_LEDGERS
}

export const scv = {
  address: (value: string) => nativeToScVal(Address.fromString(value), { type: 'address' }),
  u64: (value: bigint | string) => nativeToScVal(BigInt(value), { type: 'u64' }),
  u32: (value: number) => nativeToScVal(value, { type: 'u32' }),
  i128: (value: bigint) => nativeToScVal(value, { type: 'i128' }),
}

/**
 * Testnet only: fund a wallet for the demo. Friendbot provides XLM; one
 * wallet-signed transaction adds the USDC trustline and swaps XLM for test
 * USDC on the testnet DEX.
 */
export async function fundTestnetWallet(wallet: WalletSigner, funds: WalletFunds, swapXlm = '50') {
  if (!funds.exists) {
    const response = await fetch(`https://friendbot.stellar.org/?addr=${wallet.address}`)
    if (!response.ok) throw new Error('Friendbot could not fund this wallet. Retry in a minute.')
  }
  const network = getNetwork('testnet')
  const horizon = new Horizon.Server(HORIZON_URL.testnet)
  const usdc = new Asset('USDC', USDC_ISSUER.testnet)
  const builder = new TransactionBuilder(await horizon.loadAccount(wallet.address), { fee: '1000', networkPassphrase: network.passphrase })
  if (funds.usdc === null) builder.addOperation(Operation.changeTrust({ asset: usdc }))
  builder.addOperation(Operation.pathPaymentStrictSend({
    sendAsset: Asset.native(), sendAmount: swapXlm, destination: wallet.address, destAsset: usdc, destMin: '1', path: [],
  }))
  const signed = await wallet.signTransaction(builder.setTimeout(120).build().toXDR(), network.passphrase)
  await horizon.submitTransaction(TransactionBuilder.fromXDR(signed, network.passphrase))
}
