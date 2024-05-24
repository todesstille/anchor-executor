import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorExecutor } from "../target/types/anchor_executor";
import { expect } from "chai";

const provider = anchor.AnchorProvider.env();

const getCreateFundingAccountInstruction = async (from, account) => {
  const rentExemptionAmount = await provider.connection.getMinimumBalanceForRentExemption(0);

  const createAccountParams = {
    fromPubkey: from.publicKey,
    newAccountPubkey: account.publicKey,
    lamports: rentExemptionAmount,
    space: 0,
    programId: anchor.web3.SystemProgram.programId
  };

  const createAccountTransaction = new anchor.web3.Transaction().add(
    anchor.web3.SystemProgram.createAccount(createAccountParams),
  );

  return createAccountTransaction.instructions[0];
}

describe("anchor-executor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorExecutor as Program<AnchorExecutor>;

  it("could create regular account", async () => {

    const account0 = new anchor.web3.Keypair();
    const account1 = new anchor.web3.Keypair();

    const accountsMeta = [
      {
        pubkey: provider.wallet.publicKey,
        isSigner: true,
        isWritable: true
      },
      {
        pubkey: account0.publicKey,
        isSigner: true,
        isWritable: true
      },
      {
        pubkey: account1.publicKey,
        isSigner: true,
        isWritable: true
      },
      {
        pubkey: anchor.web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false
      }
    ]
    
    let newAccountInfo = await provider.connection.getAccountInfo(account0.publicKey);
    expect(newAccountInfo).to.be.a('null');

    newAccountInfo = await provider.connection.getAccountInfo(account1.publicKey);
    expect(newAccountInfo).to.be.a('null');

    const ix0 = await getCreateFundingAccountInstruction(provider.wallet, account0)
    ix0["indexes"] = Buffer.from([0, 1]);

    const ix1 = await getCreateFundingAccountInstruction(provider.wallet, account1)
    ix1["indexes"] = Buffer.from([0, 2]);

    const ixs = {
      list: [ix0, ix1]
    }

    const tx = await program.methods.execute(ixs)
      .remainingAccounts(accountsMeta)
      .signers([account0, account1])
      .rpc()
      .catch(e => console.error(e));

      newAccountInfo = await provider.connection.getAccountInfo(account0.publicKey);
      expect(newAccountInfo.owner).to.deep.equal(anchor.web3.SystemProgram.programId)

      newAccountInfo = await provider.connection.getAccountInfo(account1.publicKey);
      expect(newAccountInfo.owner).to.deep.equal(anchor.web3.SystemProgram.programId)

  });
});
