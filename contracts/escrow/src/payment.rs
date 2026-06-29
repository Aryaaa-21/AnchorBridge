use crate::storage::read_token;
use crate::errors::EscrowError;
use soroban_sdk::{token, Address, Env};

pub fn transfer_to_contract(env: &Env, from: &Address, amount: i128) -> Result<(), EscrowError> {
    if amount <= 0 {
        return Err(EscrowError::InsufficientBalance);
    }
    let token_address = read_token(env).ok_or(EscrowError::NotInitialized)?;
    let client = token::Client::new(env, &token_address);
    client.transfer(from, &env.current_contract_address(), &amount);
    Ok(())
}

pub fn transfer_from_contract(env: &Env, to: &Address, amount: i128) -> Result<(), EscrowError> {
    if amount <= 0 {
        return Err(EscrowError::InsufficientBalance);
    }
    let token_address = read_token(env).ok_or(EscrowError::NotInitialized)?;
    let client = token::Client::new(env, &token_address);
    client.transfer(&env.current_contract_address(), to, &amount);
    Ok(())
}
