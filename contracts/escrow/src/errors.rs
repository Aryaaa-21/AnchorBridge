use soroban_sdk::contracterror;

#[contracterror]
#[derive(Copy, Clone, Debug, Eq, PartialEq, PartialOrd, Ord)]
#[repr(u32)]
pub enum EscrowError {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    Unauthorized = 3,
    InvalidProject = 4,
    InvalidMilestone = 5,
    ProjectAlreadyClosed = 6,
    MilestoneNotSubmitted = 7,
    MilestoneAlreadyApproved = 8,
    InsufficientBalance = 9,
    DeadlineExpired = 10,
    InvalidStatusTransition = 11,
    ReputationOverflow = 12,
    UpgradeFailed = 13,
    InvalidMilestoneCount = 14,
    ProjectAlreadyFunded = 15,
    ProjectNotFunded = 16,
    DisputeNotActive = 17,
}
