use soroban_sdk::{contracttype, Address, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum ProjectStatus {
    Draft = 0,
    Created = 1,
    Funded = 2,
    Accepted = 3,
    Completed = 4,
    Closed = 5,
    Refunded = 6,
    Cancelled = 7,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub enum MilestoneStatus {
    Active = 0,
    Submitted = 1,
    Approved = 2,
    Disputed = 3,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Milestone {
    pub idx: u32,
    pub title: String,
    pub amount: i128,
    pub status: MilestoneStatus,
    pub due_date: u64,
    pub submission_text: String,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Project {
    pub id: u64,
    pub title: String,
    pub description: String,
    pub client: Address,
    pub freelancer: Address,
    pub total_escrow: i128,
    pub locked_escrow: i128,
    pub released_funds: i128,
    pub status: ProjectStatus,
    pub created_at: u64,
    pub updated_at: u64,
    pub milestone_count: u32,
    pub reputation_reward: u32,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ContractStats {
    pub total_projects: u32,
    pub total_volume: i128,
    pub total_released: i128,
}
