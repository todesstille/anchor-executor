use anchor_lang::prelude::{*};
use solana_program::instruction::{Instruction, AccountMeta};
use solana_program::program::invoke;

declare_id!("FN3asVygEpi3NXFJVrn2SSdvB3PQkKfRNMSR3HJGpofd");

#[program]
pub mod anchor_executor {
    use super::*;

    pub fn execute(ctx: Context<Execute>, ix: ProgramInstruction) -> Result<()> {
        let account_infos = ctx.remaining_accounts;
        let mut cpi_accounts = Vec::new();
        for i in ix.keys {
            cpi_accounts.push(
                AccountMeta{
                    pubkey: i.pubkey,
                    is_signer: i.is_signer,
                    is_writable: i.is_writable
                }
            );
        }
        let instruction = Instruction { 
            program_id: ix.program_id.key(), 
            accounts: cpi_accounts, 
            data: ix.data
        };

        msg!("Test");

        let l = account_infos.len() - 1;
        invoke(&instruction, &account_infos[0..l])?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Execute<'info> {
    #[account(mut)]
    signer: Signer<'info>,
}

// #[derive(BorshSerialize, BorshDeserialize)]
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct DataAccountMeta {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

// #[derive(BorshSerialize, BorshDeserialize)]
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct ProgramInstruction {
    pub program_id: Pubkey,
    pub keys: Vec<DataAccountMeta>,
    pub data: Vec<u8>,
}
