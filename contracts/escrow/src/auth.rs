use crate::storage::read_admin;
use crate::types::Project;
use crate::errors::EscrowError;
use soroban_sdk::{Address, Env};

pub fn is_admin(env: &Env, address: &Address) -> bool {
    if let Some(admin) = read_admin(env) {
        admin == *address
    } else {
        false
    }
}

pub fn check_admin(env: &Env) -> Result<Address, EscrowError> {
    if let Some(admin) = read_admin(env) {
        admin.require_auth();
        Ok(admin)
    } else {
        Err(EscrowError::NotInitialized)
    }
}

pub fn check_client(project: &Project) -> Result<(), EscrowError> {
    project.client.require_auth();
    Ok(())
}

pub fn check_freelancer(project: &Project) -> Result<(), EscrowError> {
    project.freelancer.require_auth();
    Ok(())
}
