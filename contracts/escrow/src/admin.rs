use crate::storage::{read_admin, write_admin, write_token, read_version, write_version};
use crate::errors::EscrowError;
use crate::events;
use soroban_sdk::{Address, Env, BytesN};

pub fn initialize(env: &Env, admin: Address, token: Address) -> Result<(), EscrowError> {
    if read_admin(env).is_some() {
        return Err(EscrowError::AlreadyInitialized);
    }
    
    write_admin(env, &admin);
    write_token(env, &token);
    write_version(env, 3);
    crate::storage::write_project_count(env, 0);

    events::contract_initialized(env, &admin, &token);
    
    Ok(())
}

pub fn upgrade(env: &Env, new_wasm_hash: BytesN<32>) -> Result<(), EscrowError> {
    let admin = read_admin(env).ok_or(EscrowError::NotInitialized)?;
    admin.require_auth();

    // Call host to upgrade contract binary!
    env.deployer().update_current_contract_wasm(new_wasm_hash);

    let old_version = read_version(env);
    let new_version = old_version + 1;
    write_version(env, new_version);

    events::storage_migrated(env, old_version, new_version);

    Ok(())
}
