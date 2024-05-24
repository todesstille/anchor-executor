import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorExecutor } from "../target/types/anchor_executor";
import { expect } from "chai";

const provider = anchor.AnchorProvider.env();

describe("anchor-executor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorExecutor as Program<AnchorExecutor>;

  it("could create regular account", async () => {

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

    let newAccountInfo = await provider.connection.getAccountInfo(newAccount.publicKey);
    expect(newAccountInfo).to.be.a('null');

    const ix0 = createAccountTransaction.instructions[0];
    ix0["indexes"] = Buffer.from([0, 1]);

    const tx = await program.methods.execute(ix0)
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
        },
        {
          pubkey: anchor.web3.SystemProgram.programId,
          isSigner: false,
          isWritable: false
        }
      ])
      .signers([newAccount])
      .rpc()
      .catch(e => console.error(e));

      newAccountInfo = await provider.connection.getAccountInfo(newAccount.publicKey);
      expect(newAccountInfo.owner).to.deep.equal(anchor.web3.SystemProgram.programId)
  
  });
});
