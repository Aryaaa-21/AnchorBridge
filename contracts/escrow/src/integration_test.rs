#![cfg(test)]

use crate::{EscrowContract, EscrowContractClient};
use crate::types::{ProjectStatus, MilestoneStatus};
use soroban_sdk::{testutils::Address as _, Address, Env, String};

#[test]
fn test_multiple_projects_integration() {
    let env = Env::default();
    env.mock_all_auths();

    let admin = Address::generate(&env);
    let client_1 = Address::generate(&env);
    let client_2 = Address::generate(&env);
    let freelancer = Address::generate(&env);

    let token_admin = Address::generate(&env);
    let token_address = env.register_stellar_asset_contract(token_admin);

    let contract_id = env.register_contract(None, EscrowContract);
    let client_contract = EscrowContractClient::new(&env, &contract_id);

    client_contract.initialize(&admin, &token_address);

    let token_client = soroban_sdk::token::Client::new(&env, &token_address);
    let token_admin_client = soroban_sdk::token::StellarAssetClient::new(&env, &token_address);
    token_admin_client.mint(&client_1, &1000);
    token_admin_client.mint(&client_2, &2000);

    // Project 1
    let p1 = client_contract.create_project(
        &client_1,
        &freelancer,
        &String::from_str(&env, "P1"),
        &String::from_str(&env, "P1 Desc"),
        &1000,
        &1,
    );
    client_contract.fund_project(&client_1, &p1);

    // Project 2
    let p2 = client_contract.create_project(
        &client_2,
        &freelancer,
        &String::from_str(&env, "P2"),
        &String::from_str(&env, "P2 Desc"),
        &2000,
        &1,
    );
    client_contract.fund_project(&client_2, &p2);

    let stats = client_contract.get_statistics();
    assert_eq!(stats.total_projects, 2);
    assert_eq!(stats.total_volume, 3000);
}
