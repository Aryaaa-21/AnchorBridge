use crate::types::{Project, Milestone, ContractStats};
use soroban_sdk::{contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum DataKey {
    Admin,
    Token,
    ProjectCount,
    Project(u64),
    Milestone(u64, u32),
    Reputation(Address),
    Stats,
    Version,
}

// TTL configuration (in ledgers)
const MIN_TTL: u32 = 10_000;
const MAX_TTL: u32 = 100_000;

pub fn read_admin(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Admin)
}

pub fn write_admin(env: &Env, address: &Address) {
    env.storage().instance().set(&DataKey::Admin, address);
}

pub fn read_token(env: &Env) -> Option<Address> {
    env.storage().instance().get(&DataKey::Token)
}

pub fn write_token(env: &Env, address: &Address) {
    env.storage().instance().set(&DataKey::Token, address);
}

pub fn read_project_count(env: &Env) -> u64 {
    if !env.storage().instance().has(&DataKey::ProjectCount) {
        env.storage().instance().set(&DataKey::ProjectCount, &0u64);
        0
    } else {
        env.storage().instance().get(&DataKey::ProjectCount).unwrap_or(0)
    }
}

pub fn write_project_count(env: &Env, count: u64) {
    env.storage().instance().set(&DataKey::ProjectCount, &count);
}

pub fn read_project(env: &Env, id: u64) -> Option<Project> {
    let key = DataKey::Project(id);
    if let Some(project) = env.storage().persistent().get::<DataKey, Project>(&key) {
        env.storage().persistent().extend_ttl(&key, MIN_TTL, MAX_TTL);
        Some(project)
    } else {
        None
    }
}

pub fn write_project(env: &Env, id: u64, project: &Project) {
    let key = DataKey::Project(id);
    env.storage().persistent().set(&key, project);
    env.storage().persistent().extend_ttl(&key, MIN_TTL, MAX_TTL);
}

pub fn read_milestone(env: &Env, project_id: u64, idx: u32) -> Option<Milestone> {
    let key = DataKey::Milestone(project_id, idx);
    if let Some(milestone) = env.storage().persistent().get::<DataKey, Milestone>(&key) {
        env.storage().persistent().extend_ttl(&key, MIN_TTL, MAX_TTL);
        Some(milestone)
    } else {
        None
    }
}

pub fn write_milestone(env: &Env, project_id: u64, idx: u32, milestone: &Milestone) {
    let key = DataKey::Milestone(project_id, idx);
    env.storage().persistent().set(&key, milestone);
    env.storage().persistent().extend_ttl(&key, MIN_TTL, MAX_TTL);
}

pub fn read_reputation(env: &Env, address: &Address) -> u32 {
    let key = DataKey::Reputation(address.clone());
    if let Some(score) = env.storage().persistent().get::<DataKey, u32>(&key) {
        env.storage().persistent().extend_ttl(&key, MIN_TTL, MAX_TTL);
        score
    } else {
        0
    }
}

pub fn write_reputation(env: &Env, address: &Address, score: u32) {
    let key = DataKey::Reputation(address.clone());
    env.storage().persistent().set(&key, &score);
    env.storage().persistent().extend_ttl(&key, MIN_TTL, MAX_TTL);
}

pub fn read_stats(env: &Env) -> ContractStats {
    env.storage().instance().get(&DataKey::Stats).unwrap_or(ContractStats {
        total_projects: 0,
        total_volume: 0,
        total_released: 0,
    })
}

pub fn write_stats(env: &Env, stats: &ContractStats) {
    env.storage().instance().set(&DataKey::Stats, stats);
}

pub fn read_version(env: &Env) -> u32 {
    env.storage().instance().get(&DataKey::Version).unwrap_or(3)
}

pub fn write_version(env: &Env, version: u32) {
    env.storage().instance().set(&DataKey::Version, &version);
}
