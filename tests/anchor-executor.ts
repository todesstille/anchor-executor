import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorExecutor } from "../target/types/anchor_executor";
import {createToken, createTokenAccount, mintTo} from "./helpers/token";

const provider = anchor.AnchorProvider.env();

describe("anchor-executor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorExecutor as Program<AnchorExecutor>;

  it("Is initialized!", async () => {

    const newAccount = new anchor.web3.Keypair();

    // Add your test here.
    const tx = await program.methods.execute()
      .remainingAccounts([{
        pubkey: newAccount.publicKey,
        isSigner: false,
        isWritable: false
      }])
      .rpc();
    console.log("Your transaction signature", tx);
  });
});
