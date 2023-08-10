import * as anchor from "@project-serum/anchor";
import { Connection, Keypair, PublicKey } from "@solana/web3.js";
const { Transaction, SystemProgram } = require('@solana/web3.js');
const web3 = require("@solana/web3.js");

export const PROGRAM_ID = new PublicKey(
  "mrchTQnMvmPXgChNVHVNiHa8stHhmWJ5kMP9e1P3duY"
);

export const sendTestTransaction = async (
  program: anchor.Program,
  connection: Connection,
  walletKey: PublicKey,
//  Mint: PublicKey,
//  usdcMint: PublicKey
): Promise<string> => {
 // const Token = await getATokenAddr(connection, walletKey, Mint);
 // const Metadata = await getMetadata(Mint);
 // const sellerUsdcToken = await getATokenAddr(connection, seller, usdcMint);
 // const redeemerUsdcToken = await getATokenAddr(
 //   connection,
 //   program.provider.wallet.publicKey,
 //   usdcMint
 // );
  try {
    const publicKey = new PublicKey("KfhTt29eRXDLh6cYJcSMhhgizLwYtDtHZ8WPf3UYFs9");
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: walletKey,
        toPubkey: publicKey,
        lamports: 0.0001 * web3.LAMPORTS_PER_SOL,
      })
    );
    
    tx.feePayer = program.provider.wallet.publicKey;
    tx.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    const signed = await program.provider.wallet.signTransaction(tx);
  	const txid = await connection.sendRawTransaction(signed.serialize());
    return txid.toString();
  } catch (e) {
    console.error("raid failed:", e);
    throw e;
  }
};