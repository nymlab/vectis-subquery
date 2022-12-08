import { CosmosEvent } from '@subql/types-cosmos';
import { Wallet } from '../types';

export async function onRemoveRelayer({ event }: CosmosEvent): Promise<void> {
  const { value: address } = event.attributes.find((attr) => attr.key === 'address');
  const { value: walletId } = event.attributes.find((attr) => attr.key === 'contract_address');

  const wallet = await Wallet.get(walletId);
  wallet.relayers = wallet.relayers.filter((relayer) => relayer !== address);
  await wallet.save();
}
