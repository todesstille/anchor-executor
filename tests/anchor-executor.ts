import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorExecutor } from "../target/types/anchor_executor";
import { expect } from "chai";

const provider = anchor.AnchorProvider.env();

describe("anchor-executor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorExecutor as Program<AnchorExecutor>;

  it("Is initialized!", async () => {

    const newAccount = new anchor.web3.Keypair();
    const ownerAccount = new anchor.web3.Keypair();
    
    const rentExemptionAmount = await provider.connection.getMinimumBalanceForRentExemption(0);

    const createAccountParams = {
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: newAccount.publicKey,
      lamports: rentExemptionAmount,
      space: 0,
      programId: anchor.web3.SystemProgram.programId
    };
 
    const createAccountTransaction = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount(createAccountParams),
    );

    // console.log(createAccountTransaction.instructions[0])

    let newAccountInfo = await provider.connection.getAccountInfo(newAccount.publicKey);
    expect(newAccountInfo).to.be.a('null');

    // Add your test here.
    const tx = await program.methods.execute(createAccountTransaction.instructions[0])
      .remainingAccounts([
        {
          pubkey: provider.wallet.publicKey,
          isSigner: true,
          isWritable: true
        },
        {
          pubkey: newAccount.publicKey,
          isSigner: true,
          isWritable: true
        }
      ])
      .signers([newAccount])
      .rpc()
      .catch(e => console.error(e));

      newAccountInfo = await provider.connection.getAccountInfo(newAccount.publicKey);
      expect(newAccountInfo.owner).to.deep.equal(anchor.web3.SystemProgram.programId)
  
    // console.log("Your transaction signature", tx);
  });
});
