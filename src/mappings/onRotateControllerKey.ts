import { CosmosEvent } from '@subql/types-cosmos';
import { Wallet } from '../types';

export async function onRotateControllerKey({ event }: CosmosEvent): Promise<void> {
  const { value: controller_address } = event.attributes.find((attr) => attr.key === 'new_address');
  const { value: walletId } = event.attributes.find((attr) => attr.key === 'contract_address');

  const wallet = await Wallet.get(walletId);
  wallet.controller_addr = controller_address;
  await wallet.save();
}
