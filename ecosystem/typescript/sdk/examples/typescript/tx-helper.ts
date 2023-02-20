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
  const MARKET = 'c525b9881ca5d1887c8340b06d30a596ea6ec45e0a621d2ed85a5ec63f23f64a'
  const MARKET_PK = '02889366abe51d51c172e672bc58289b93807ce22183f1610ccbfd8c9d97ab7d'

  const client = new AptosClient(NODE_URL);
  const faucetClient = new FaucetClient(NODE_URL, FAUCET_URL);
  const feeAcc = '0x811bf5b10cfb58280e70995ed0f6e4a52c6f2806bc81eaa39bddeade7a8e13ed'


  // Generates key pair for a new account
  // const account1 = new AptosAccount();
  // const acc = new AptosAccount(Buffer.from(MARKET_PK, 'hex'), MARKET);
  // const acc = /*seller*/new AptosAccount(Buffer.from('e02d26d9124f1086518bf4d1706505fc2dab6a2930c36c8ec46c3f4ed77eb186', 'hex'), '5964cbf9198fb32e601657b1e31eba60c227c682306b657ac16fb584feefca66');
  const acc = /*buyer*/ new AptosAccount(Buffer.from('785aeed5f114b8651dd768980b0fb0e192aeabaa2c1c6b6c341669a12617a8e9', 'hex'), 'fb9431aa8fda0e007a4eb0f8ca8a19b89705753398c75e7b1377f7f9030e8123');
 
  // console.log({acc: seller.address().toString()})
  const token = new TypeTagStruct(StructTag.fromString("0x1::aptos_coin::AptosCoin"));

  // TS SDK support 3 types of transaction payloads: `EntryFunction`, `Script` and `Module`.
  // See https://aptos-labs.github.io/ts-sdk-doc/ for the details.  
  // const entryFunctionPayload = new TransactionPayloadEntryFunction(
  //   EntryFunction.natural(
  //     // Fully qualified module name, `AccountAddress::ModuleName`
  //     `${MARKET}::marketplace_v1`,
  //     // Module function
  //     "initialize_market",
  //     // The coin type to transfer
  //     [],
  //     // Arguments for function `transfer`: receiver account address and amount to transfer
  //     [
  //       BCS.bcsSerializeUint64(75),
  //       BCS.bcsSerializeUint64(1000),
  //       BCS.bcsToBytes(AccountAddress.fromHex(feeAcc))
  //     ],
  //   ),
  // );

  // const entryFunctionPayload = new TransactionPayloadEntryFunction(
  //   EntryFunction.natural(
  //     // Fully qualified module name, `AccountAddress::ModuleName`
  //     `${MARKET}::marketplace_v1`,
  //     // Module function
  //     "create_listing",
  //     // The coin type to transfer
  //     [token],
  //     // Arguments for function `transfer`: receiver account address and amount to transfer
  //     [
  //       BCS.bcsToBytes(AccountAddress.fromHex('0x5964cbf9198fb32e601657b1e31eba60c227c682306b657ac16fb584feefca66')),
  //       BCS.bcsSerializeBytes(Buffer.from('Martian Testnet72878')),
  //       BCS.bcsSerializeBytes(Buffer.from('Martian NFT #72878')),
  //       BCS.bcsSerializeUint64(0),
  //       // BCS.bcsSerializeUint64(1),
  //       BCS.bcsSerializeUint64(35000000),
  //       // BCS.bcsSerializeUint64(0),
  //       // BCS.bcsSerializeUint64(10000000000000),
  //       // BCS.bcsSerializeUint64(10000000000001),
  //     ],
  //   ),
  // );
  const entryFunctionPayload = new TransactionPayloadEntryFunction(
    EntryFunction.natural(
      // Fully qualified module name, `AccountAddress::ModuleName`
      `${MARKET}::marketplace_v1`,
      // Module function
      "buy_listing",
      // The coin type to transfer
      [token],
      // Arguments for function `transfer`: receiver account address and amount to transfer
      [
        BCS.bcsToBytes(AccountAddress.fromHex('0x5964cbf9198fb32e601657b1e31eba60c227c682306b657ac16fb584feefca66')),
        // BCS.bcsToBytes(AccountAddress.fromHex('0xe02d26d9124f1086518bf4d1706505fc2dab6a2930c36c8ec46c3f4ed77eb186')),
        BCS.bcsSerializeUint64(24),
      ],
    ),
  );


  // const entryFunctionPayload = new TransactionPayloadEntryFunction(
  //   EntryFunction.natural(
  //     // Fully qualified module name, `AccountAddress::ModuleName`
  //     `${MARKET}::marketplace_v1`,
  //     // Module function
  //     "remove_listing",
  //     // The coin type to transfer
  //     [token],
  //     // Arguments for function `transfer`: receiver account address and amount to transfer
  //     [
  //       // BCS.bcsToBytes(AccountAddress.fromHex('0x5964cbf9198fb32e601657b1e31eba60c227c682306b657ac16fb584feefca66')),
  //       // BCS.bcsToBytes(AccountAddress.fromHex('0xe02d26d9124f1086518bf4d1706505fc2dab6a2930c36c8ec46c3f4ed77eb186')),
  //       BCS.bcsSerializeUint64(15),
  //     ],
  //   ),
  // );

  // const entryFunctionPayload = new TransactionPayloadEntryFunction(
  //   EntryFunction.natural(
  //     // Fully qualified module name, `AccountAddress::ModuleName`
  //     `${MARKET}::marketplace_v1`,
  //     // Module function
  //     "change_listing",
  //     // The coin type to transfer
  //     [token],
  //     // Arguments for function `transfer`: receiver account address and amount to transfer
  //     [
  //       // BCS.bcsToBytes(AccountAddress.fromHex('0x5964cbf9198fb32e601657b1e31eba60c227c682306b657ac16fb584feefca66')),
  //       // BCS.bcsToBytes(AccountAddress.fromHex('0xe02d26d9124f1086518bf4d1706505fc2dab6a2930c36c8ec46c3f4ed77eb186')),
  //       BCS.bcsSerializeUint64(15),
  //       BCS.bcsSerializeUint64(45000000),
  //     ],
  //   ),
  // );

  const [{ sequence_number: sequenceNumber }, chainId] = await Promise.all([
    client.getAccount(acc.address()),
    client.getChainId(),
  ]);

  // const rawTx = createRawTransaction(alice, collectionName)

// client.signTransaction(alice, rawTx)

  // See class definiton here
  // https://aptos-labs.github.io/ts-sdk-doc/classes/TxnBuilderTypes.RawTransaction.html#constructor.
  const rawTxn = new RawTransaction(
    // Transaction sender account address
    AccountAddress.fromHex(acc.address()),
    BigInt(sequenceNumber),
    entryFunctionPayload,
    // Max gas unit to spend
    BigInt(20000),
    // Gas price per unit
    BigInt(100),
    // Expiration timestamp. Transaction is discarded if it is not executed within 10 seconds from now.
    BigInt(Math.floor(Date.now() / 1000) + 10),
    new ChainId(chainId),
  );

  // Sign the raw transaction with account1's private key
  const bcsTxn = AptosClient.generateBCSTransaction(acc, rawTxn);

  const transactionRes = await client.submitSignedBCSTransaction(bcsTxn);

  console.log({tx: transactionRes.hash})

  const response = await client.waitForTransactionWithResult(transactionRes.hash);
  console.log({status: (response as any)?.success, log: (response as any)?.vm_status})
})();
