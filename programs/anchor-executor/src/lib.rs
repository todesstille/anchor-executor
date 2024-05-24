use anchor_lang::prelude::{*};
use solana_program::instruction::{Instruction, AccountMeta};
use solana_program::program::invoke;

declare_id!("FN3asVygEpi3NXFJVrn2SSdvB3PQkKfRNMSR3HJGpofd");

#[program]
pub mod anchor_executor {
    use super::*;

    pub fn execute(ctx: Context<Execute>, ix: InstrictionData) -> Result<()> {
        ix.execute(ctx.remaining_accounts)?;
        
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
pub struct AccountsMetadata {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

// #[derive(BorshSerialize, BorshDeserialize)]
#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InstrictionData {
    pub program_id: Pubkey,
    pub keys: Vec<AccountsMetadata>,
    pub data: Vec<u8>,
    pub indexes: Vec<u8>
}

impl InstrictionData {
    fn execute(&self, infos: &[AccountInfo]) -> Result<()> {
        let mut cpi_accounts = Vec::new();

        for meta in &self.keys {
            cpi_accounts.push(
                AccountMeta{
                    pubkey: meta.pubkey,
                    is_signer: meta.is_signer,
                    is_writable: meta.is_writable
                }
            );
        }
        let instruction = Instruction { 
            program_id: self.program_id.key(), 
            accounts: cpi_accounts, 
            data: self.data.clone()
        };

        let mut ix_accounts = Vec::new();
        for index in &self.indexes {
            ix_accounts.push(infos[index.to_owned() as usize].clone());
        }

        invoke(&instruction, &ix_accounts)?;

        Ok(())
    }
}
