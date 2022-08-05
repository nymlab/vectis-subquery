import { SCWallet } from "../types";
import { CosmosMessage } from "@subql/types-cosmos";

// export async function handleBlock(block: CosmosBlock): Promise<void> {}

export async function onWalletCreation(cmsg: CosmosMessage): Promise<void> {
  const [{ events }] = JSON.parse(cmsg.tx.tx.log);

  const { attributes } = events.find(
    (event: any) => event.type === "instantiate"
  );

  const [{ value: scwalletAddress }, { value: codeId }] = attributes;

  if (codeId !== "1264") return;

  const { sender, msg } = cmsg.msg.decodedMsg;

  const { label, guardians, relayers, proxy_initial_funds } =
    msg.create_wallet.create_wallet_msg;

  const scwallet = SCWallet.create({
    id: scwalletAddress as string,
    label,
    frozen: false,
    user_address: sender,
    guardians: guardians.addresses,
    relayers,
    funds: proxy_initial_funds,
  });

  await scwallet.save();
}

export async function onWalletUpdate(cmsg: CosmosMessage): Promise<void> {
  const { contract, msg: decodedMsg } = cmsg.msg.decodedMsg;
  const scwallet = await SCWallet.get(contract);
  if (!scwallet) return;
  const [msg] = Object.keys(decodedMsg);
  switch (msg) {
    case "add_relayer":
      return addRelayer(scwallet, decodedMsg.add_relayer);
    case "remove_relayer":
      return removeRelayer(scwallet, decodedMsg.remove_relayer);
    case "update_guardians":
      return updateGuardians(scwallet, decodedMsg.update_guardians);
    case "revert_freeze_status":
      return revertFreezeStatus(scwallet);
    case "rotate_user_key":
      return rotateUserKey(scwallet, decodedMsg.rotate_user_key);
    case "update_label":
      return updateLabel(scwallet, decodedMsg.update_label);
  }
}

async function addRelayer(wallet: SCWallet, msg: any): Promise<void> {
  const { new_relayer_address } = msg;
  wallet.relayers.push(new_relayer_address);
  await wallet.save();
}
async function removeRelayer(wallet: SCWallet, msg: any): Promise<void> {
  const { relayer_address } = msg;
  wallet.relayers = wallet.relayers.filter(
    (relayer) => relayer !== relayer_address
  );
  await wallet.save();
}
async function updateGuardians(wallet: SCWallet, msg: any): Promise<void> {
  const { guardians } = msg;
  wallet.guardians = guardians.addresses;
  await wallet.save();
}
async function revertFreezeStatus(wallet: SCWallet): Promise<void> {
  wallet.frozen = !wallet.frozen;
  await wallet.save();
}

async function rotateUserKey(wallet: SCWallet, msg: any): Promise<void> {
  const { new_user_address } = msg;
  wallet.user_address = new_user_address;
  await wallet.save();
}

async function updateLabel(wallet: SCWallet, msg: any): Promise<void> {
  const { new_label } = msg;
  wallet.label = new_label;
  await wallet.save();
}
