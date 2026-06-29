use soroban_sdk::{symbol_short, Address, Env, Symbol};

pub fn project_created(env: &Env, project_id: u64, client: &Address, total_escrow: i128) {
    let topics = (Symbol::new(env, "project_created"), project_id);
    env.events().publish(topics, (client.clone(), total_escrow, env.ledger().timestamp()));
}

pub fn escrow_funded(env: &Env, project_id: u64, client: &Address, amount: i128) {
    let topics = (Symbol::new(env, "escrow_funded"), project_id);
    env.events().publish(topics, (client.clone(), amount, env.ledger().timestamp()));
}

pub fn milestone_created(env: &Env, project_id: u64, idx: u32, amount: i128) {
    let topics = (Symbol::new(env, "milestone_created"), project_id);
    env.events().publish(topics, (idx, amount, env.ledger().timestamp()));
}

pub fn milestone_submitted(env: &Env, project_id: u64, idx: u32, freelancer: &Address) {
    let topics = (Symbol::new(env, "milestone_submitted"), project_id);
    env.events().publish(topics, (idx, freelancer.clone(), env.ledger().timestamp()));
}

pub fn milestone_approved(env: &Env, project_id: u64, idx: u32, client: &Address) {
    let topics = (Symbol::new(env, "milestone_approved"), project_id);
    env.events().publish(topics, (idx, client.clone(), env.ledger().timestamp()));
}

pub fn milestone_rejected(env: &Env, project_id: u64, idx: u32, client: &Address) {
    let topics = (Symbol::new(env, "milestone_rejected"), project_id);
    env.events().publish(topics, (idx, client.clone(), env.ledger().timestamp()));
}

pub fn funds_released(env: &Env, project_id: u64, idx: u32, freelancer: &Address, amount: i128) {
    let topics = (Symbol::new(env, "funds_released"), project_id);
    env.events().publish(topics, (idx, freelancer.clone(), amount, env.ledger().timestamp()));
}

pub fn refund_issued(env: &Env, project_id: u64, client: &Address, amount: i128) {
    let topics = (Symbol::new(env, "refund_issued"), project_id);
    env.events().publish(topics, (client.clone(), amount, env.ledger().timestamp()));
}

pub fn project_cancelled(env: &Env, project_id: u64) {
    let topics = (Symbol::new(env, "project_cancelled"), project_id);
    env.events().publish(topics, env.ledger().timestamp());
}

pub fn project_completed(env: &Env, project_id: u64) {
    let topics = (Symbol::new(env, "project_completed"), project_id);
    env.events().publish(topics, env.ledger().timestamp());
}

pub fn reputation_updated(env: &Env, address: &Address, score: u32) {
    let topics = (Symbol::new(env, "reputation_updated"), address.clone());
    env.events().publish(topics, (score, env.ledger().timestamp()));
}

pub fn contract_initialized(env: &Env, admin: &Address, token: &Address) {
    let topics = (symbol_short!("init"), env.ledger().timestamp());
    env.events().publish(topics, (admin.clone(), token.clone()));
}

pub fn storage_migrated(env: &Env, old_version: u32, new_version: u32) {
    let topics = (Symbol::new(env, "storage_migrated"), env.ledger().timestamp());
    env.events().publish(topics, (old_version, new_version));
}
