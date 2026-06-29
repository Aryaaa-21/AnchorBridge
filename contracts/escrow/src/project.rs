use crate::storage::{
    read_project_count, write_project_count, read_project, write_project, read_stats, write_stats
};
use crate::types::{Project, ProjectStatus, ContractStats};
use crate::errors::EscrowError;
use crate::events;
use crate::payment;
use soroban_sdk::{Address, Env, String};

pub fn create_project(
    env: &Env,
    client: Address,
    freelancer: Address,
    title: String,
    description: String,
    total_escrow: i128,
    milestone_count: u32,
) -> Result<u64, EscrowError> {
    client.require_auth();
    
    if milestone_count == 0 {
        return Err(EscrowError::InvalidMilestoneCount);
    }
    if total_escrow <= 0 {
        return Err(EscrowError::InsufficientBalance);
    }

    let next_id = read_project_count(env) + 1;
    write_project_count(env, next_id);

    let timestamp = env.ledger().timestamp();
    let project = Project {
        id: next_id,
        title,
        description,
        client: client.clone(),
        freelancer: freelancer.clone(),
        total_escrow,
        locked_escrow: 0,
        released_funds: 0,
        status: ProjectStatus::Created,
        created_at: timestamp,
        updated_at: timestamp,
        milestone_count,
        reputation_reward: 10,
    };

    write_project(env, next_id, &project);

    // Update global stats
    let mut stats = read_stats(env);
    stats.total_projects += 1;
    stats.total_volume = stats.total_volume.checked_add(total_escrow)
        .ok_or(EscrowError::ReputationOverflow)?;
    write_stats(env, &stats);

    events::project_created(env, next_id, &client, total_escrow);

    Ok(next_id)
}

pub fn fund_project(env: &Env, client: Address, project_id: u64) -> Result<(), EscrowError> {
    client.require_auth();

    let mut project = read_project(env, project_id).ok_or(EscrowError::InvalidProject)?;
    
    if project.client != client {
        return Err(EscrowError::Unauthorized);
    }
    if project.status != ProjectStatus::Created {
        return Err(EscrowError::ProjectAlreadyFunded);
    }

    // Call payment module to lock tokens
    payment::transfer_to_contract(env, &client, project.total_escrow)?;

    project.locked_escrow = project.total_escrow;
    project.status = ProjectStatus::Funded;
    project.updated_at = env.ledger().timestamp();
    
    write_project(env, project_id, &project);
    events::escrow_funded(env, project_id, &client, project.total_escrow);

    Ok(())
}

pub fn cancel_project(env: &Env, client: Address, project_id: u64) -> Result<(), EscrowError> {
    client.require_auth();

    let mut project = read_project(env, project_id).ok_or(EscrowError::InvalidProject)?;
    
    if project.client != client {
        return Err(EscrowError::Unauthorized);
    }

    if project.status == ProjectStatus::Closed || project.status == ProjectStatus::Completed {
        return Err(EscrowError::ProjectAlreadyClosed);
    }

    // Return funds if they were locked
    if project.status == ProjectStatus::Funded || project.status == ProjectStatus::Accepted {
        payment::transfer_from_contract(env, &project.client, project.locked_escrow)?;
        project.released_funds += project.locked_escrow;
        project.locked_escrow = 0;
    }

    project.status = ProjectStatus::Cancelled;
    project.updated_at = env.ledger().timestamp();

    write_project(env, project_id, &project);
    events::project_cancelled(env, project_id);

    Ok(())
}
