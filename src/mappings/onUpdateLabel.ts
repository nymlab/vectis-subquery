import { CosmosEvent } from '@subql/types-cosmos';
import { Wallet } from '../types';

export async function onUpdateLabel({ event }: CosmosEvent): Promise<void> {
  const { value: label } = event.attributes.find((attr) => attr.key === 'label');
  const { value: walletId } = event.attributes.find((attr) => attr.key === 'contract_address');

  const wallet = await Wallet.get(walletId);
  wallet.label = label;
  await wallet.save();
}
