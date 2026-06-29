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
    use soroban_sdk::Symbol;
    use crate::storage::{read_admin, read_token};

    // 1. Verify contract initialization
    env.events().publish((Symbol::new(env, "diag_check_init"),), ());
    if read_admin(env).is_none() || read_token(env).is_none() {
        return Err(EscrowError::NotInitialized);
    }

    // 2. Verify authorization
    env.events().publish((Symbol::new(env, "diag_check_auth"), client.clone()), ());
    client.require_auth();

    // 3. Verify parameters validation
    env.events().publish((Symbol::new(env, "diag_check_params"), total_escrow, milestone_count), ());
    if milestone_count == 0 || milestone_count > 100 {
        return Err(EscrowError::InvalidMilestoneCount);
    }
    if total_escrow <= 0 {
        return Err(EscrowError::InsufficientBalance);
    }

    // 4. Verify project counter read and write
    let next_id = read_project_count(env) + 1;
    env.events().publish((Symbol::new(env, "diag_write_counter"), next_id), ());
    write_project_count(env, next_id);

    // 5. Verify storage writes
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

    env.events().publish((Symbol::new(env, "diag_write_project"), next_id), ());
    write_project(env, next_id, &project);

    // 6. Update global stats safely
    env.events().publish((Symbol::new(env, "diag_write_stats"),), ());
    let mut stats = read_stats(env);
    stats.total_projects = stats.total_projects.checked_add(1)
        .ok_or(EscrowError::ReputationOverflow)?;
    stats.total_volume = stats.total_volume.checked_add(total_escrow)
        .ok_or(EscrowError::ReputationOverflow)?;
    write_stats(env, &stats);

    // 7. Emit success event
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
