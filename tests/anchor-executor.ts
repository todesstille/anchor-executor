import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token"
import { Program } from "@coral-xyz/anchor";
import { AnchorExecutor } from "../target/types/anchor_executor";
import { expect } from "chai";

import {
  getCreateFundingAccountInstruction,
  getCreateTokenAccountInstruction,
  getInitializeTokenAccountInstruction
} from "./helpers/instructions";
import {createToken} from "./helpers/token";

const provider = anchor.AnchorProvider.env();

describe("anchor-executor", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(provider);

  const program = anchor.workspace.AnchorExecutor as Program<AnchorExecutor>;

  it("could create multiple regular accounts", async () => {

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

  it("could create token accounts", async () => {
    const token = await createToken(18);

    const account0 = new anchor.web3.Keypair();

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
        pubkey: token.publicKey,
        isSigner: false,
        isWritable: true
      },
      {
        pubkey: anchor.web3.SystemProgram.programId,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: anchor.web3.SYSVAR_RENT_PUBKEY,
        isSigner: false,
        isWritable: false
      },
      {
        pubkey: spl.TOKEN_PROGRAM_ID,
        isSigner: false,
        isWritable: false
      }
    ]

    let newAccountInfo = await provider.connection.getAccountInfo(account0.publicKey);
    expect(newAccountInfo).to.be.a('null');

    const ix0 = await getCreateTokenAccountInstruction(provider.wallet, account0)
    ix0["indexes"] = Buffer.from([0, 1]);

    const ix1 = await getInitializeTokenAccountInstruction(provider.wallet, account0, token)
    ix1["indexes"] = Buffer.from([0, 1, 2, 4]);

    const ixs = {
      list: [ix0, ix1]
    }

    const tx = await program.methods.execute(ixs)
      .remainingAccounts(accountsMeta)
      .signers([account0])
      .rpc()
      .catch(e => console.error(e));

    newAccountInfo = await provider.connection.getAccountInfo(account0.publicKey);
    expect(newAccountInfo.owner).to.deep.equal(spl.TOKEN_PROGRAM_ID)

  });
});
