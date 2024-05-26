import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token"

const provider = anchor.AnchorProvider.env();

export const getCreateFundingAccountInstruction = async (from, account) => {
    const rentExemptionAmount = await provider.connection.getMinimumBalanceForRentExemption(0);
  
    const createAccountParams = {
      fromPubkey: from,
      newAccountPubkey: account,
      lamports: rentExemptionAmount,
      space: 0,
      programId: anchor.web3.SystemProgram.programId
    };
  
    const tx = new anchor.web3.Transaction().add(
      anchor.web3.SystemProgram.createAccount(createAccountParams),
    );
  
    return tx.instructions[0];
  }

  export const getCreateTokenAccountInstruction = async (from, account) => {
    const tokenAccount = new anchor.web3.Keypair();
  
    const rentExempt =  await provider.connection.getMinimumBalanceForRentExemption(spl.AccountLayout.span);
  
    let tx = new anchor.web3.Transaction();
    tx.add(
        anchor.web3.SystemProgram.createAccount({
            programId: spl.TOKEN_PROGRAM_ID,
            space: spl.AccountLayout.span,
            fromPubkey: from,
            newAccountPubkey: account,
            lamports: rentExempt,
        })
    );

    return tx.instructions[0];
  }
  
  export const getInitializeTokenAccountInstruction = async (from, account, mint) => {
    let tx = new anchor.web3.Transaction();

    tx.add(
        spl.createInitializeAccountInstruction(
            account,
            mint,
            from,
            spl.TOKEN_PROGRAM_ID
        )
      );

    return tx.instructions[0];
  }

  export const getMintToInstruction = async (accountAddress, tokenAddress, authorityAddress, amount) => {
    let tx = new anchor.web3.Transaction();

    tx.add(
      spl.createMintToInstruction(
        tokenAddress,
        accountAddress,
        authorityAddress,
        amount,
      )
    );

    return tx.instructions[0];
  }