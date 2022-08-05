import { CosmosMessage } from '@subql/types-cosmos';
import { SCWallet } from '../types';

export async function onWalletCreation(cmsg: CosmosMessage): Promise<void> {
  const [{ events }] = JSON.parse(cmsg.tx.tx.log);

  const { attributes } = events.find((event) => event.type === 'instantiate');

  const [{ value: scwalletAddress }, { value: codeId }] = attributes;

  // Smart contract proxy codeId
  if (codeId !== '1264') return;

  const { sender, msg } = cmsg.msg.decodedMsg;

  const { label, guardians, relayers } = msg.create_wallet.create_wallet_msg;

  const scwallet = SCWallet.create({
    id: scwalletAddress as string,
    label,
    frozen: false,
    user_address: sender,
    guardians: guardians.addresses,
    relayers
  });

  await scwallet.save();
}
