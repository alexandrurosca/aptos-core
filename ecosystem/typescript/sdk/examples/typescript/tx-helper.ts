/* eslint-disable no-console */

import dotenv from "dotenv";
dotenv.config();

import { AptosClient, AptosAccount, FaucetClient, BCS, TxnBuilderTypes } from "aptos";
import { aptosCoinStore } from "./common";
import assert from "assert";

const NODE_URL = process.env.APTOS_NODE_URL || "https://fullnode.devnet.aptoslabs.com";
const FAUCET_URL = process.env.APTOS_FAUCET_URL || "https://faucet.devnet.aptoslabs.com";

const {
  AccountAddress,
  TypeTagStruct,
  EntryFunction,
  StructTag,
  TransactionPayloadEntryFunction,
  RawTransaction,
  ChainId,
  TransactionPayload
} = TxnBuilderTypes;

/**
 * This code example demonstrates the process of moving test coins from one account to another.
 */
(async () => {
  const client = new AptosClient(NODE_URL);
  const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
  const feeAcc = '0x811bf5b10cfb58280e70995ed0f6e4a52c6f2806bc81eaa39bddeade7a8e13ed'


  // Generates key pair for a new account
  // const account1 = new AptosAccount();
  const account1 = new AptosAccount(Buffer.from('20fb5013959a3c6b90dca2855fecdff838e7f9c48a8fba8744997af31ef4ea51', 'hex'), 'ad18e2569e15023455410197cd0131b76e8893b7b9e68840f00282533e4babd9');
 
  console.log({acc: account1.address().toString()})
  const token = new TypeTagStruct(StructTag.fromString("0x1::aptos_coin::AptosCoin"));

  // TS SDK support 3 types of transaction payloads: `EntryFunction`, `Script` and `Module`.
  // See https://aptos-labs.github.io/ts-sdk-doc/ for the details.  
  const entryFunctionPayload = new TransactionPayloadEntryFunction(
    EntryFunction.natural(
      // Fully qualified module name, `AccountAddress::ModuleName`
      "0xad18e2569e15023455410197cd0131b76e8893b7b9e68840f00282533e4babd9::marketplace_instant_sale_example",
      // Module function
      "update_market_config",
      // The coin type to transfer
      [],
      // Arguments for function `transfer`: receiver account address and amount to transfer
      [
        BCS.bcsSerializeUint64(100),
        BCS.bcsSerializeUint64(1000),
        BCS.bcsToBytes(AccountAddress.fromHex(feeAcc))
      ],
    ),
  );

  const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
    client.getAccount(account1.address()),
    client.getChainId(),
  ]);

  // const rawTx = createRawTransaction(alice, collectionName)

// client.signTransaction(alice, rawTx)

  // See class definiton here
  // https://aptos-labs.github.io/ts-sdk-doc/classes/TxnBuilderTypes.RawTransaction.html#constructor.
  const rawTxn = new RawTransaction(
    // Transaction sender account address
    AccountAddress.fromHex(account1.address()),
    BigInt(sequenceNumber),
    entryFunctionPayload,
    // Max gas unit to spend
    BigInt(2000),
    // Gas price per unit
    BigInt(100),
    // Expiration timestamp. Transaction is discarded if it is not executed within 10 seconds from now.
    BigInt(Math.floor(Date.now() / 1000) + 10),
    new ChainId(chainId),
  );

  // Sign the raw transaction with account1's private key
  const bcsTxn = AptosClient.generateBCSTransaction(account1, rawTxn);

  const transactionRes = await client.submitSignedBCSTransaction(bcsTxn);

  console.log({tx: transactionRes.hash})

  await client.waitForTransaction(transactionRes.hash);
})();
