import { CosmosEvent } from '@subql/types-cosmos';
import { GuardianGroup, Wallet } from '../types';
import { v4 as uuidv4 } from 'uuid';

export async function onUpdateGuardian({ event, msg }: CosmosEvent): Promise<void> {
  const { value: guaridans } = event.attributes.find((attr) => attr.key === 'guaridans');
  const walletId = msg.msg.decodedMsg.contract;

  const wallet = await Wallet.get(walletId);
  await GuardianGroup.remove(wallet.guardiansId);
  const guardian = GuardianGroup.create({
    id: uuidv4(),
    walletId: wallet.id,
    guardians: JSON.parse(guaridans),
    multisig_code_id: 0,
    multisig_address: '',
    created_at: new Date()
  });
  wallet.guardiansId = guardian.id;
  await wallet.save();
  await guardian.save();
}
