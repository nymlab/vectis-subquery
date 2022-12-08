import { CosmosEvent } from '@subql/types-cosmos';
import { Wallet } from '../types';

export async function onRevertFreezeStatus({ event }: CosmosEvent): Promise<void> {
  const { value: status } = event.attributes.find((attr) => attr.key === 'status');
  const { value: walletId } = event.attributes.find((attr) => attr.key === 'contract_address');

  const wallet = await Wallet.get(walletId);
  wallet.frozen = status === 'frozen' ? true : false;
  await wallet.save();
}
