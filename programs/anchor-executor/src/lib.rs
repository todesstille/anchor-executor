use anchor_lang::prelude::{*};
use solana_program::instruction::{Instruction, AccountMeta};
use solana_program::program::{invoke, invoke_signed};

declare_id!("FN3asVygEpi3NXFJVrn2SSdvB3PQkKfRNMSR3HJGpofd");

#[program]
pub mod anchor_executor {
    use super::*;

    pub fn execute(ctx: Context<Execute>, ixs: InstructionsData) -> Result<()> {
        ixs.execute(&ctx.remaining_accounts)?;

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Execute<'info> {
    #[account(mut)]
    signer: Signer<'info>,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct AccountsMetadata {
    pub pubkey: Pubkey,
    pub is_signer: bool,
    pub is_writable: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InstructionData {
    pub program_id: Pubkey,
    pub keys: Vec<AccountsMetadata>,
    pub data: Vec<u8>,
    pub indexes: Vec<u8>,
    pub pda_seeds: Vec<Vec<Vec<u8>>>
}

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct InstructionsData {
    pub list: Vec<InstructionData>
}

impl InstructionData {
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

        if self.pda_seeds.len() == 0 {
            invoke(&instruction, &ix_accounts)?;
        } else {
            let pda_vec: Vec<Vec<&[u8]>> = self.pda_seeds.iter().map(
                |v| v.iter().map(
                    |v1| v1.as_slice()
                ).collect()
            ).collect();

            let pda: Vec<&[&[u8]]> = pda_vec.iter().map(|v| v.as_slice()).collect();

            invoke_signed(&instruction, &ix_accounts, pda.as_slice())?;
        }

        Ok(())
    }
}

impl InstructionsData {
    fn execute(&self, infos: &[AccountInfo]) -> Result<()> {
        for ix in &self.list {
            ix.execute(&infos)?
        }

        Ok(())
    }
}

pub fn test() {
    let mut x = vec![vec!(vec!(0 as u8))];
    
    let y = x.iter().map(
        |u| u.iter().map(|v| v.as_slice()).collect::<Vec<&[u8]>>().as_slice()
    ).collect::<Vec<&[&[u8]]>>();
}
