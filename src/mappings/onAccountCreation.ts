import { CosmosMessage } from '@subql/types-cosmos';
import { VectisAccount } from '../types';

export async function onAccountCreation(cmsg: CosmosMessage): Promise<void> {
  const [{ events }] = JSON.parse(cmsg.tx.tx.log);

  const { attributes } = events.find((event) => event.type === 'instantiate');

  const [{ value: accountAddress }, { value: codeId }] = attributes;

  // Smart contract proxy codeId
  if (codeId !== '1264') return;

  const { msg } = cmsg.msg.decodedMsg;

  const { label, guardians, relayers, controller_addr } = msg.create_wallet.create_wallet_msg;

  const vectisAccount = VectisAccount.create({
    id: accountAddress as string,
    label,
    frozen: false,
    controller_addr,
    guardians: guardians.addresses,
    relayers
  });

  await vectisAccount.save();
}
