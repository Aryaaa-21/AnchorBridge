#![cfg(test)]

use crate::{EscrowContract, EscrowContractClient};
use crate::types::{ProjectStatus, MilestoneStatus, Project, Milestone, ContractStats};
use crate::errors::EscrowError;
use soroban_sdk::{testutils::Address as _, Address, Env, String};

fn setup_test_env(env: &Env) -> (Address, Address, Address, EscrowContractClient) {
    env.mock_all_auths();

    let admin = Address::generate(env);
    let client = Address::generate(env);
    let freelancer = Address::generate(env);

    // Deploy native asset token wrapper for testing
    let token_admin = Address::generate(env);
    let token_address = env.register_stellar_asset_contract(token_admin);

    let contract_id = env.register_contract(None, EscrowContract);
    let client_contract = EscrowContractClient::new(env, &contract_id);

    client_contract.initialize(&admin, &token_address);

    (client, freelancer, token_address, client_contract)
}

#[test]
fn test_initialize() {
    let env = Env::default();
    let (_, _, _, client_contract) = setup_test_env(&env);
    assert_eq!(client_contract.get_version(), 3);
}

#[test]
fn test_create_project_and_fund() {
    let env = Env::default();
    let (client, freelancer, token_address, client_contract) = setup_test_env(&env);

    let title = String::from_str(&env, "Website Redesign");
    let desc = String::from_str(&env, "Build a responsive web application.");
    let total_escrow: i128 = 5000;
    let milestone_count = 2;

    // Create project
    let project_id = client_contract.create_project(
        &client,
        &freelancer,
        &title,
        &desc,
        &total_escrow,
        &milestone_count,
    );

    assert_eq!(project_id, 1);

    // Verify stats
    let stats = client_contract.get_statistics();
    assert_eq!(stats.total_projects, 1);
    assert_eq!(stats.total_volume, 5000);

    // Check project info
    let project = client_contract.get_project(&project_id).unwrap();
    assert_eq!(project.status, ProjectStatus::Created);

    // Mock client balance to allow funding
    let token_client = soroban_sdk::token::Client::new(&env, &token_address);
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_address);
    token_admin_client.mint(&client, &total_escrow);
    assert_eq!(token_client.balance(&client), 5000);

    // Fund project
    client_contract.fund_project(&client, &project_id);

    let project_funded = client_contract.get_project(&project_id).unwrap();
    assert_eq!(project_funded.status, ProjectStatus::Funded);
    assert_eq!(project_funded.locked_escrow, 5000);
    assert_eq!(token_client.balance(&client), 0);
}

#[test]
fn test_milestone_workflow() {
    let env = Env::default();
    let (client, freelancer, token_address, client_contract) = setup_test_env(&env);

    let title = String::from_str(&env, "Smart Contract Dev");
    let desc = String::from_str(&env, "Implement full state machine");
    let total_escrow: i128 = 2000;
    let milestone_count = 1;

    // Create & Fund project
    let project_id = client_contract.create_project(
        &client,
        &freelancer,
        &title,
        &desc,
        &total_escrow,
        &milestone_count,
    );

    let token_client = soroban_sdk::token::Client::new(&env, &token_address);
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_address);
    token_admin_client.mint(&client, &total_escrow);
    client_contract.fund_project(&client, &project_id);

    // Create milestone
    let m_title = String::from_str(&env, "WASM Compiled");
    client_contract.create_milestone(&client, &project_id, &0, &m_title, &2000, &0);

    // Submit milestone
    let sub_text = String::from_str(&env, "GitHub commit #1234");
    client_contract.submit_milestone(&freelancer, &project_id, &0, &sub_text);

    let milestone = client_contract.get_milestone(&project_id, &0).unwrap();
    assert_eq!(milestone.status, MilestoneStatus::Submitted);

    // Approve milestone
    client_contract.approve_milestone(&client, &project_id, &0);

    let milestone_approved = client_contract.get_milestone(&project_id, &0).unwrap();
    assert_eq!(milestone_approved.status, MilestoneStatus::Approved);

    // Verify freelancer balance and reputation
    assert_eq!(token_client.balance(&freelancer), 2000);
    assert_eq!(client_contract.get_reputation(&freelancer), 10);

    // Project should be Completed
    let project_completed = client_contract.get_project(&project_id).unwrap();
    assert_eq!(project_completed.status, ProjectStatus::Completed);
}

#[test]
fn test_refund_client() {
    let env = Env::default();
    let (client, freelancer, token_address, client_contract) = setup_test_env(&env);

    let title = String::from_str(&env, "Mobile App");
    let desc = String::from_str(&env, "Android development");
    let total_escrow: i128 = 10000;
    let milestone_count = 1;

    let project_id = client_contract.create_project(
        &client,
        &freelancer,
        &title,
        &desc,
        &total_escrow,
        &milestone_count,
    );

    let token_client = soroban_sdk::token::Client::new(&env, &token_address);
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_address);
    token_admin_client.mint(&client, &total_escrow);
    client_contract.fund_project(&client, &project_id);

    // Refund
    client_contract.refund_client(&client, &project_id);

    let project_refunded = client_contract.get_project(&project_id).unwrap();
    assert_eq!(project_refunded.status, ProjectStatus::Refunded);
    assert_eq!(token_client.balance(&client), 10000);
}

#[test]
fn test_dispute_milestone() {
    let env = Env::default();
    let (client, freelancer, token_address, client_contract) = setup_test_env(&env);

    let title = String::from_str(&env, "Web Design");
    let desc = String::from_str(&env, "React app design");
    let total_escrow: i128 = 3000;
    let milestone_count = 1;

    let project_id = client_contract.create_project(
        &client,
        &freelancer,
        &title,
        &desc,
        &total_escrow,
        &milestone_count,
    );

    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_address);
    token_admin_client.mint(&client, &total_escrow);
    client_contract.fund_project(&client, &project_id);

    // Create and submit milestone
    client_contract.create_milestone(&client, &project_id, &0, &String::from_str(&env, "UI Design"), &3000, &0);
    client_contract.submit_milestone(&freelancer, &project_id, &0, &String::from_str(&env, "Submitting draft"));

    // Dispute milestone
    client_contract.dispute_milestone(&client, &project_id, &0, &String::from_str(&env, "Quality is very poor"));

    let milestone = client_contract.get_milestone(&project_id, &0).unwrap();
    assert_eq!(milestone.status, MilestoneStatus::Disputed);
    assert_eq!(milestone.submission_text, String::from_str(&env, "Quality is very poor"));
}

#[test]
fn test_cancel_project() {
    let env = Env::default();
    let (client, freelancer, token_address, client_contract) = setup_test_env(&env);

    let title = String::from_str(&env, "Web Design");
    let desc = String::from_str(&env, "React app design");
    let total_escrow: i128 = 3000;
    let milestone_count = 1;

    let project_id = client_contract.create_project(
        &client,
        &freelancer,
        &title,
        &desc,
        &total_escrow,
        &milestone_count,
    );

    // Cancel before funding
    client_contract.cancel_project(&client, &project_id);
    let project = client_contract.get_project(&project_id).unwrap();
    assert_eq!(project.status, ProjectStatus::Cancelled);
}

#[test]
#[should_panic]
fn test_create_milestone_unauthorized() {
    let env = Env::default();
    let (_, freelancer, _, client_contract) = setup_test_env(&env);

    let title = String::from_str(&env, "Unauthorized Milestone");
    // Freelancer tries to create milestone (only client can create milestones)
    client_contract.create_milestone(&freelancer, &1, &0, &title, &1000, &0);
}

#[test]
#[should_panic]
fn test_submit_milestone_unauthorized() {
    let env = Env::default();
    let (client, _, _, client_contract) = setup_test_env(&env);

    let sub_text = String::from_str(&env, "Unauthorized Sub");
    // Client tries to submit milestone (only freelancer can submit milestones)
    client_contract.submit_milestone(&client, &1, &0, &sub_text);
}

#[test]
#[should_panic]
fn test_approve_milestone_unauthorized() {
    let env = Env::default();
    let (_, freelancer, _, client_contract) = setup_test_env(&env);

    // Freelancer tries to approve milestone (only client can approve)
    client_contract.approve_milestone(&freelancer, &1, &0);
}

#[test]
#[should_panic]
fn test_milestone_invalid_index() {
    let env = Env::default();
    let (client, freelancer, _, client_contract) = setup_test_env(&env);

    let title = String::from_str(&env, "Project");
    let project_id = client_contract.create_project(
        &client,
        &freelancer,
        &title,
        &String::from_str(&env, "Desc"),
        &1000,
        &1, // 1 milestone maximum
    );

    // Try to create milestone at index 1 (which is invalid, only index 0 is valid)
    client_contract.create_milestone(&client, &project_id, &1, &String::from_str(&env, "M2"), &1000, &0);
}

#[test]
#[should_panic]
fn test_invalid_milestone_count() {
    let env = Env::default();
    let (client, freelancer, _, client_contract) = setup_test_env(&env);

    // Try to create project with 0 milestone count (should fail)
    client_contract.create_project(
        &client,
        &freelancer,
        &String::from_str(&env, "Title"),
        &String::from_str(&env, "Desc"),
        &1000,
        &0,
    );
}

#[test]
#[should_panic]
fn test_invalid_escrow_amount() {
    let env = Env::default();
    let (client, freelancer, _, client_contract) = setup_test_env(&env);

    // Try to create project with 0 or negative escrow amount (should fail)
    client_contract.create_project(
        &client,
        &freelancer,
        &String::from_str(&env, "Title"),
        &String::from_str(&env, "Desc"),
        &0,
        &1,
    );
}

#[test]
fn test_missing_initialization() {
    let env = Env::default();
    let contract_id = env.register_contract(None, EscrowContract);
    let client_contract = EscrowContractClient::new(&env, &contract_id);

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let title = String::from_str(&env, "Title");
    let desc = String::from_str(&env, "Desc");

    // This should fail because initialize was not called
    let result = client_contract.try_create_project(
        &client,
        &freelancer,
        &title,
        &desc,
        &1000,
        &1,
    );

    assert_eq!(result.is_err(), true);
}

#[test]
#[should_panic]
fn test_create_project_auth_failure() {
    let env = Env::default();
    let admin = Address::generate(&env);
    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_address = env.register_stellar_asset_contract(token_admin);

    let contract_id = env.register_contract(None, EscrowContract);
    let client_contract = EscrowContractClient::new(&env, &contract_id);
    client_contract.initialize(&admin, &token_address);

    let title = String::from_str(&env, "Title");
    let desc = String::from_str(&env, "Desc");

    // This should panic because mock_all_auths was not called, so require_auth fails
    client_contract.create_project(
        &client,
        &freelancer,
        &title,
        &desc,
        &1000,
        &1,
    );
}

#[test]
fn test_duplicate_project_creation() {
    let env = Env::default();
    let (client, freelancer, _, client_contract) = setup_test_env(&env);

    let title = String::from_str(&env, "Project 1");
    let desc = String::from_str(&env, "First Project");
    let id1 = client_contract.create_project(&client, &freelancer, &title, &desc, &1000, &1);
    assert_eq!(id1, 1);

    let title2 = String::from_str(&env, "Project 2");
    let desc2 = String::from_str(&env, "Second Project");
    let id2 = client_contract.create_project(&client, &freelancer, &title2, &desc2, &2000, &2);
    assert_eq!(id2, 2);
}
