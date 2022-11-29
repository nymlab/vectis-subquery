import { CosmosMessage } from '@subql/types-cosmos';
import { VectisAccount } from '../types';
import { chains } from 'chain-registry';
import { CosmWasmClient } from '@cosmjs/cosmwasm-stargate';

export async function onAccountUpdate(cmsg: CosmosMessage): Promise<void> {
  const { contract, msg: decodedMsg } = cmsg.msg.decodedMsg;
  const account = await VectisAccount.get(contract);
  if (!account) return;
  const [msg] = Object.keys(decodedMsg);
  switch (msg) {
    case 'add_relayer':
      return addRelayer(account, decodedMsg.add_relayer);
    case 'remove_relayer':
      return removeRelayer(account, decodedMsg.remove_relayer);
    case 'update_guardians':
      return updateGuardians(account);
    case 'revert_freeze_status':
      return revertFreezeStatus(account);
    case 'rotate_controller_key':
      return rotateUserKey(account, decodedMsg.rotate_controller_key);
    case 'update_label':
      return updateLabel(account, decodedMsg.update_label);
  }
}

async function addRelayer(account: VectisAccount, { new_relayer_address }): Promise<void> {
  account.relayers.push(new_relayer_address);
  await account.save();
}
async function removeRelayer(account: VectisAccount, { relayer_address }): Promise<void> {
  account.relayers = account.relayers.filter((relayer) => relayer !== relayer_address);
  await account.save();
}
async function updateGuardians(account: VectisAccount): Promise<void> {
  const [prefix] = account.id.split('1');
  const chain = chains.find((c) => c.bech32_prefix === prefix);
  const client = await CosmWasmClient.connect(chain.apis.rpc[0].address);
  const { guardians } = await client.queryContractSmart(account.id, { info: {} });
  account.guardians = guardians;
  await account.save();
}
async function revertFreezeStatus(account: VectisAccount): Promise<void> {
  account.frozen = !account.frozen;
  await account.save();
}

async function rotateUserKey(account: VectisAccount, { new_controller_address }): Promise<void> {
  account.controller_addr = new_controller_address;
  await account.save();
}

async function updateLabel(account: VectisAccount, { new_label }): Promise<void> {
  account.label = new_label;
  await account.save();
}
