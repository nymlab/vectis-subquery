import { CosmosEvent } from '@subql/types-cosmos';
import { Wallet } from '../types';

export async function onUpdateLabel({ event, msg }: CosmosEvent): Promise<void> {
  const { value: label } = event.attributes.find((attr) => attr.key === 'label');
  const walletId = msg.msg.decodedMsg.contract;

  const wallet = await Wallet.get(walletId);
  wallet.label = label;
  await wallet.save();
}
