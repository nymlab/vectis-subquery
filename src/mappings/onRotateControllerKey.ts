import { CosmosEvent } from '@subql/types-cosmos';
import { Wallet } from '../types';

export async function onRotateControllerKey({ event, msg }: CosmosEvent): Promise<void> {
  const { value: controller_address } = event.attributes.find((attr) => attr.key === 'new_address');
  const walletId = msg.msg.decodedMsg.contract;

  const wallet = await Wallet.get(walletId);
  wallet.controller_addr = controller_address;
  await wallet.save();
}
