use anchor_lang::prelude::*;

declare_id!("FN3asVygEpi3NXFJVrn2SSdvB3PQkKfRNMSR3HJGpofd");

#[program]
pub mod anchor_executor {
    use super::*;

    pub fn execute(ctx: Context<Execute>) -> Result<()> {
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Execute<'info> {
    #[account(mut)]
    signer: Signer<'info>
}
