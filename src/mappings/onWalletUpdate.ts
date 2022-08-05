import { CosmosMessage } from '@subql/types-cosmos';
import { SCWallet } from '../types';

export async function onWalletUpdate(cmsg: CosmosMessage): Promise<void> {
  const { contract, msg: decodedMsg } = cmsg.msg.decodedMsg;
  const scwallet = await SCWallet.get(contract);
  if (!scwallet) return;
  const [msg] = Object.keys(decodedMsg);
  switch (msg) {
    case 'add_relayer':
      return addRelayer(scwallet, decodedMsg.add_relayer);
    case 'remove_relayer':
      return removeRelayer(scwallet, decodedMsg.remove_relayer);
    case 'update_guardians':
      return updateGuardians(scwallet, decodedMsg.update_guardians);
    case 'revert_freeze_status':
      return revertFreezeStatus(scwallet);
    case 'rotate_user_key':
      return rotateUserKey(scwallet, decodedMsg.rotate_user_key);
    case 'update_label':
      return updateLabel(scwallet, decodedMsg.update_label);
  }
}

async function addRelayer(wallet: SCWallet, { new_relayer_address }): Promise<void> {
  wallet.relayers.push(new_relayer_address);
  await wallet.save();
}
async function removeRelayer(wallet: SCWallet, { relayer_address }): Promise<void> {
  wallet.relayers = wallet.relayers.filter((relayer) => relayer !== relayer_address);
  await wallet.save();
}
async function updateGuardians(wallet: SCWallet, { guardians }): Promise<void> {
  wallet.guardians = guardians.addresses;
  await wallet.save();
}
async function revertFreezeStatus(wallet: SCWallet): Promise<void> {
  wallet.frozen = !wallet.frozen;
  await wallet.save();
}

async function rotateUserKey(wallet: SCWallet, { new_user_address }): Promise<void> {
  wallet.user_address = new_user_address;
  await wallet.save();
}

async function updateLabel(wallet: SCWallet, { new_label }): Promise<void> {
  wallet.label = new_label;
  await wallet.save();
}
