import { CosmosEvent } from '@subql/types-cosmos';
import { v4 as uuidv4 } from 'uuid';
import { GuardianGroup, Wallet } from '../types';

interface Attributes {
  contract_address: string;
  controller_address: string;
  multisig_code_id: string;
  code_id: string;
  label: string;
  relayers: string;
  guardians: string;
}

export async function onWalletInstantiation({ event, msg }: CosmosEvent): Promise<void> {
  const attributes = event.attributes.reduce((acc, attr) => {
    acc[attr.key] = attr.value;
    return acc;
  }, {} as Attributes);
  const walletId = msg.msg.decodedMsg.contract;

  const guardians = GuardianGroup.create({
    id: uuidv4(),
    walletId: attributes.contract_address,
    guardians: JSON.parse(attributes.guardians),
    multisig_address: '',
    multisig_code_id: 0,
    created_at: new Date()
  });

  const wallet = Wallet.create({
    id: walletId,
    controller_addr: attributes.controller_address,
    multisig_code_id: parseInt(attributes.multisig_code_id),
    code_id: parseInt(attributes.code_id),
    label: attributes.label,
    relayers: JSON.parse(attributes.relayers),
    guardiansId: guardians.id,
    frozen: false,
    created_at: new Date(),
    update_at: new Date()
  });

  await wallet.save();
  await guardians.save();
}
