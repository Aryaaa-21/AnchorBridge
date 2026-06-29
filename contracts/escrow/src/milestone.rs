use crate::storage::{read_project, write_project, read_milestone, write_milestone, read_stats, write_stats};
use crate::types::{Milestone, MilestoneStatus, ProjectStatus};
use crate::errors::EscrowError;
use crate::events;
use crate::payment;
use crate::reputation;
use soroban_sdk::{Address, Env, String};

pub fn create_milestone(
    env: &Env,
    client: Address,
    project_id: u64,
    idx: u32,
    title: String,
    amount: i128,
    due_date: u64,
) -> Result<(), EscrowError> {
    client.require_auth();
    let project = read_project(env, project_id).ok_or(EscrowError::InvalidProject)?;

    if project.client != client {
        return Err(EscrowError::Unauthorized);
    }
    if idx >= project.milestone_count {
        return Err(EscrowError::InvalidMilestone);
    }
    if amount <= 0 {
        return Err(EscrowError::InsufficientBalance);
    }

    let milestone = Milestone {
        idx,
        title,
        amount,
        status: MilestoneStatus::Active,
        due_date,
        submission_text: String::from_str(env, ""),
    };

    write_milestone(env, project_id, idx, &milestone);
    events::milestone_created(env, project_id, idx, amount);

    Ok(())
}

pub fn submit_milestone(
    env: &Env,
    freelancer: Address,
    project_id: u64,
    idx: u32,
    submission_text: String,
) -> Result<(), EscrowError> {
    freelancer.require_auth();

    let project = read_project(env, project_id).ok_or(EscrowError::InvalidProject)?;
    if project.freelancer != freelancer {
        return Err(EscrowError::Unauthorized);
    }

    let mut milestone = read_milestone(env, project_id, idx).ok_or(EscrowError::InvalidMilestone)?;
    if milestone.status == MilestoneStatus::Approved {
        return Err(EscrowError::MilestoneAlreadyApproved);
    }

    milestone.submission_text = submission_text;
    milestone.status = MilestoneStatus::Submitted;

    write_milestone(env, project_id, idx, &milestone);
    events::milestone_submitted(env, project_id, idx, &freelancer);

    Ok(())
}

pub fn approve_milestone(env: &Env, client: Address, project_id: u64, idx: u32) -> Result<(), EscrowError> {
    client.require_auth();

    let mut project = read_project(env, project_id).ok_or(EscrowError::InvalidProject)?;
    if project.client != client {
        return Err(EscrowError::Unauthorized);
    }

    let mut milestone = read_milestone(env, project_id, idx).ok_or(EscrowError::InvalidMilestone)?;
    if milestone.status != MilestoneStatus::Submitted {
        return Err(EscrowError::MilestoneNotSubmitted);
    }

    // Release milestone amount to freelancer
    payment::transfer_from_contract(env, &project.freelancer, milestone.amount)?;

    milestone.status = MilestoneStatus::Approved;
    write_milestone(env, project_id, idx, &milestone);

    // Update project funds allocation
    project.locked_escrow = project.locked_escrow.checked_sub(milestone.amount)
        .ok_or(EscrowError::InsufficientBalance)?;
    project.released_funds = project.released_funds.checked_add(milestone.amount)
        .ok_or(EscrowError::ReputationOverflow)?;
    project.status = ProjectStatus::Accepted;
    project.updated_at = env.ledger().timestamp();

    // Check if all milestones are approved
    let mut all_completed = true;
    for i in 0..project.milestone_count {
        if let Some(m) = read_milestone(env, project_id, i) {
            if m.status != MilestoneStatus::Approved {
                all_completed = false;
                break;
            }
        } else {
            all_completed = false;
            break;
        }
    }

    if all_completed {
        project.status = ProjectStatus::Completed;
        events::project_completed(env, project_id);
    }

    write_project(env, project_id, &project);

    // Update statistics
    let mut stats = read_stats(env);
    stats.total_released = stats.total_released.checked_add(milestone.amount)
        .ok_or(EscrowError::ReputationOverflow)?;
    write_stats(env, &stats);

    // Increase freelancer reputation score
    reputation::increase_reputation(env, &project.freelancer, project.reputation_reward)?;

    events::milestone_approved(env, project_id, idx, &client);
    events::funds_released(env, project_id, idx, &project.freelancer, milestone.amount);

    Ok(())
}

pub fn reject_milestone(env: &Env, client: Address, project_id: u64, idx: u32) -> Result<(), EscrowError> {
    client.require_auth();

    let project = read_project(env, project_id).ok_or(EscrowError::InvalidProject)?;
    if project.client != client {
        return Err(EscrowError::Unauthorized);
    }

    let mut milestone = read_milestone(env, project_id, idx).ok_or(EscrowError::InvalidMilestone)?;
    if milestone.status != MilestoneStatus::Submitted {
        return Err(EscrowError::MilestoneNotSubmitted);
    }

    milestone.status = MilestoneStatus::Active; // Reset back to active state
    write_milestone(env, project_id, idx, &milestone);

    events::milestone_rejected(env, project_id, idx, &client);

    Ok(())
}
