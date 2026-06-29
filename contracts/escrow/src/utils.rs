use soroban_sdk::Env;

pub fn get_ledger_timestamp(env: &Env) -> u64 {
    env.ledger().timestamp()
}

pub fn check_deadline_expired(env: &Env, deadline: u64) -> bool {
    let now = get_ledger_timestamp(env);
    now >= deadline
}
