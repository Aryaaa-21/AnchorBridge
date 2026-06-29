use crate::storage::{read_reputation, write_reputation};
use crate::events::reputation_updated;
use crate::errors::EscrowError;
use soroban_sdk::{Address, Env};

pub fn increase_reputation(env: &Env, freelancer: &Address, points: u32) -> Result<u32, EscrowError> {
    let current_score = read_reputation(env, freelancer);
    
    // Checked addition to prevent overflow attacks!
    let new_score = current_score.checked_add(points)
        .ok_or(EscrowError::ReputationOverflow)?;
        
    write_reputation(env, freelancer, new_score);
    reputation_updated(env, freelancer, new_score);
    
    Ok(new_score)
}
