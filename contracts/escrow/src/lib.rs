#![no_std]

pub mod errors;
pub mod types;
pub mod storage;
pub mod events;
pub mod auth;
pub mod payment;
pub mod reputation;
pub mod project;
pub mod milestone;
pub mod escrow;
pub mod admin;
pub mod migration;
pub mod utils;

#[cfg(test)]
pub mod test;

#[cfg(test)]
pub mod integration_test;

use crate::errors::EscrowError;
use crate::types::{Project, Milestone, ContractStats};
use soroban_sdk::{contract, contractimpl, Address, Env, String, BytesN};

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn initialize(env: Env, admin: Address, token: Address) -> Result<(), EscrowError> {
        admin::initialize(&env, admin, token)
    }

    pub fn create_project(
        env: Env,
        client: Address,
        freelancer: Address,
        title: String,
        description: String,
        total_escrow: i128,
        milestone_count: u32,
    ) -> Result<u64, EscrowError> {
        project::create_project(&env, client, freelancer, title, description, total_escrow, milestone_count)
    }

    pub fn fund_project(env: Env, client: Address, project_id: u64) -> Result<(), EscrowError> {
        project::fund_project(&env, client, project_id)
    }

    pub fn create_milestone(
        env: Env,
        client: Address,
        project_id: u64,
        idx: u32,
        title: String,
        amount: i128,
        due_date: u64,
    ) -> Result<(), EscrowError> {
        milestone::create_milestone(&env, client, project_id, idx, title, amount, due_date)
    }

    pub fn submit_milestone(
        env: Env,
        freelancer: Address,
        project_id: u64,
        idx: u32,
        submission_text: String,
    ) -> Result<(), EscrowError> {
        milestone::submit_milestone(&env, freelancer, project_id, idx, submission_text)
    }

    pub fn approve_milestone(env: Env, client: Address, project_id: u64, idx: u32) -> Result<(), EscrowError> {
        milestone::approve_milestone(&env, client, project_id, idx)
    }

    pub fn reject_milestone(env: Env, client: Address, project_id: u64, idx: u32) -> Result<(), EscrowError> {
        milestone::reject_milestone(&env, client, project_id, idx)
    }

    pub fn dispute_milestone(
        env: Env,
        caller: Address,
        project_id: u64,
        idx: u32,
        reason: String,
    ) -> Result<(), EscrowError> {
        escrow::dispute_milestone(&env, caller, project_id, idx, reason)
    }

    pub fn refund_client(env: Env, client: Address, project_id: u64) -> Result<(), EscrowError> {
        escrow::refund_client(&env, client, project_id)
    }

    pub fn cancel_project(env: Env, client: Address, project_id: u64) -> Result<(), EscrowError> {
        project::cancel_project(&env, client, project_id)
    }

    pub fn get_project(env: Env, id: u64) -> Option<Project> {
        storage::read_project(&env, id)
    }

    pub fn get_milestone(env: Env, project_id: u64, idx: u32) -> Option<Milestone> {
        storage::read_milestone(&env, project_id, idx)
    }

    pub fn get_reputation(env: Env, address: Address) -> u32 {
        storage::read_reputation(&env, &address)
    }

    pub fn get_statistics(env: Env) -> ContractStats {
        storage::read_stats(&env)
    }

    pub fn get_version(env: Env) -> u32 {
        storage::read_version(&env)
    }

    pub fn upgrade(env: Env, new_wasm_hash: BytesN<32>) -> Result<(), EscrowError> {
        admin::upgrade(&env, new_wasm_hash)
    }
}
