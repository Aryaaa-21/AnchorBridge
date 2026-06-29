use crate::storage::{read_project, write_project, read_milestone, write_milestone};
use crate::types::{ProjectStatus, MilestoneStatus};
use crate::errors::EscrowError;
use crate::events;
use crate::payment;
use soroban_sdk::{Address, Env, String};

pub fn dispute_milestone(
    env: &Env,
    caller: Address,
    project_id: u64,
    idx: u32,
    reason: String,
) -> Result<(), EscrowError> {
    caller.require_auth();

    let mut project = read_project(env, project_id).ok_or(EscrowError::InvalidProject)?;
    if project.client != caller && project.freelancer != caller {
        return Err(EscrowError::Unauthorized);
    }

    let mut milestone = read_milestone(env, project_id, idx).ok_or(EscrowError::InvalidMilestone)?;
    if milestone.status == MilestoneStatus::Approved {
        return Err(EscrowError::MilestoneAlreadyApproved);
    }

    milestone.status = MilestoneStatus::Disputed;
    milestone.submission_text = reason; // Override submission text as dispute details
    write_milestone(env, project_id, idx, &milestone);

    project.updated_at = env.ledger().timestamp();
    write_project(env, project_id, &project);

    // Emit event
    let topics = (soroban_sdk::Symbol::new(env, "milestone_disputed"), project_id);
    env.events().publish(topics, (idx, caller.clone(), env.ledger().timestamp()));

    Ok(())
}

pub fn refund_client(env: &Env, client: Address, project_id: u64) -> Result<(), EscrowError> {
    client.require_auth();

    let mut project = read_project(env, project_id).ok_or(EscrowError::InvalidProject)?;
    if project.client != client {
        return Err(EscrowError::Unauthorized);
    }

    if project.status == ProjectStatus::Completed || project.status == ProjectStatus::Closed {
        return Err(EscrowError::ProjectAlreadyClosed);
    }

    let refund_amount = project.locked_escrow;
    if refund_amount <= 0 {
        return Err(EscrowError::InsufficientBalance);
    }

    // Refund client
    payment::transfer_from_contract(env, &project.client, refund_amount)?;

    project.locked_escrow = 0;
    project.status = ProjectStatus::Refunded;
    project.updated_at = env.ledger().timestamp();

    write_project(env, project_id, &project);
    events::refund_issued(env, project_id, &client, refund_amount);

    Ok(())
}
