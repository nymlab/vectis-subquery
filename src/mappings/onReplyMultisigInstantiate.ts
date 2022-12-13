import { CosmosEvent } from '@subql/types-cosmos';
import { GuardianGroup, Wallet } from '../types';

export async function onReplyMultisigInstantiate({ event, msg }: CosmosEvent): Promise<void> {
  const { value: multisig_address } = event.attributes.find((attr) => attr.key === 'multisig_address');
  const { value: multisig_code_id } = event.attributes.find((attr) => attr.key === 'multisig_code_id');
  const walletId = msg.msg.decodedMsg.contract;

  const wallet = await Wallet.get(walletId);
  const guardians = await GuardianGroup.get(wallet.guardiansId);
  guardians.multisig_address = multisig_address;
  guardians.multisig_code_id = parseInt(multisig_code_id);
  await wallet.save();
}
