import * as anchor from "@coral-xyz/anchor";
import * as spl from "@solana/spl-token"

const provider = anchor.AnchorProvider.env();

export const createToken = async (mintAuthority, burnAuthority, decimals) => {
    const tokenAddress = new anchor.web3.Keypair();
  
    const rentExempt =  await provider.connection.getMinimumBalanceForRentExemption(spl.MintLayout.span);
  
    let tx = new anchor.web3.Transaction();
        tx.add(
            anchor.web3.SystemProgram.createAccount({
                programId: spl.TOKEN_PROGRAM_ID,
                space: spl.MintLayout.span,
                fromPubkey: provider.wallet.publicKey,
                newAccountPubkey: tokenAddress.publicKey,
                lamports: rentExempt,
            })
        )
        tx.add(
            spl.createInitializeMintInstruction(
                tokenAddress.publicKey,
                decimals,
                mintAuthority,
                burnAuthority,
                spl.TOKEN_PROGRAM_ID
            )
        );
  
        const signature = await provider.sendAndConfirm(tx, [tokenAddress]);
  
        return tokenAddress;
  }
  
  export const createTokenAccount = async (mintAddress) => {
    const tokenAccount = new anchor.web3.Keypair();
  
    const rentExempt =  await provider.connection.getMinimumBalanceForRentExemption(spl.AccountLayout.span);
  
    let tx = new anchor.web3.Transaction();
    tx.add(
        anchor.web3.SystemProgram.createAccount({
            programId: spl.TOKEN_PROGRAM_ID,
            space: spl.AccountLayout.span,
            fromPubkey: provider.wallet.publicKey,
            newAccountPubkey: tokenAccount.publicKey,
            lamports: rentExempt,
        })
    );
  
    tx.add(
      spl.createInitializeAccountInstruction(
          tokenAccount.publicKey,
          mintAddress,
          provider.wallet.publicKey,
          spl.TOKEN_PROGRAM_ID
      )
    );
  
  
    const signature = await provider.sendAndConfirm(tx, [tokenAccount]);
    return tokenAccount;
  
  }
  
  export const mintTo = async (accountAddress, mint, amount) => {
  
    let tx = new anchor.web3.Transaction();
    tx.add(
      spl.createMintToInstruction(
        mint.publicKey,
        accountAddress,
        provider.wallet.publicKey,
        amount,
      )
    );
  
    const signature = await provider.sendAndConfirm(tx, []);
  
  }