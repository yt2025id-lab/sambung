#![no_std]

use soroban_sdk::{
    contract, contractimpl, contracttype,
    contracterror, Env, Address, Bytes, BytesN, Symbol,
    token::TokenClient,
    xdr::ToXdr,
};

#[contracttype]
#[derive(Clone, Debug, PartialEq)]
pub enum PaymentStatus {
    Initiated,
    Swapping,
    WaitingAnchor,
    Settled,
    Failed,
    Refunded,
}

#[contracttype]
pub struct PaymentIntent {
    pub id: BytesN<32>,
    pub sender: Address,
    pub usdc_amount: i128,
    pub idrt_amount: i128,
    pub fee_bps: u32,
    pub status: PaymentStatus,
    pub created_at: u64,
}

#[contracttype]
pub struct FeeConfig {
    pub platform_fee_bps: u32,
    pub anchor_fee_bps: u32,
    pub pjp_fee_bps: u32,
    pub treasury: Address,
}

#[contracterror]
#[derive(Debug, PartialEq, Copy, Clone)]
pub enum Error {
    Unauthorized = 1,
    PaymentNotFound = 2,
    InvalidStatus = 3,
    InsufficientBalance = 4,
}

#[contract]
pub struct PaymentGateway;

#[contractimpl]
impl PaymentGateway {
    pub fn initialize(
        env: Env,
        admin: Address,
        fee_cfg: FeeConfig,
        usdc_address: Address,
    ) {
        admin.require_auth();
        env.storage().persistent().set(&Symbol::new(&env, "admin"), &admin);
        env.storage().persistent().set(&Symbol::new(&env, "fee_cfg"), &fee_cfg);
        env.storage().persistent().set(&Symbol::new(&env, "usdc"), &usdc_address);
    }

    pub fn initiate_payment(
        env: Env,
        sender: Address,
        usdc_amount: i128,
    ) -> BytesN<32> {
        sender.require_auth();

        let mut payload = Bytes::new(&env);
        payload.append(&sender.clone().to_xdr(&env));
        payload.append(&usdc_amount.to_xdr(&env));
        payload.append(&env.ledger().timestamp().to_xdr(&env));
        let payment_id: BytesN<32> = env.crypto().sha256(&payload).into();

        let usdc = Self::get_usdc(env.clone());
        let token = TokenClient::new(&env, &usdc);
        token.transfer(&sender, &env.current_contract_address(), &usdc_amount);

        let intent = PaymentIntent {
            id: payment_id.clone(),
            sender: sender.clone(),
            usdc_amount,
            idrt_amount: 0,
            fee_bps: Self::get_fee(env.clone()),
            status: PaymentStatus::Initiated,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&payment_id, &intent);

        env.events().publish((
            Symbol::new(&env, "PaymentInitiated"),
            payment_id.clone(),
        ), (sender, usdc_amount));

        payment_id
    }

    pub fn confirm_settlement(
        env: Env,
        admin: Address,
        payment_id: BytesN<32>,
        idrt_amount: i128,
    ) {
        admin.require_auth();

        let mut intent = Self::get_intent(env.clone(), payment_id.clone());
        intent.idrt_amount = idrt_amount;
        intent.status = PaymentStatus::Settled;
        env.storage().persistent().set(&payment_id, &intent);

        env.events().publish((
            Symbol::new(&env, "PaymentSettled"),
            payment_id.clone(),
        ), (idrt_amount,));
    }

    pub fn mark_failed(
        env: Env,
        admin: Address,
        payment_id: BytesN<32>,
    ) {
        admin.require_auth();
        let mut intent = Self::get_intent(env.clone(), payment_id.clone());
        intent.status = PaymentStatus::Failed;
        env.storage().persistent().set(&payment_id, &intent);

        env.events().publish((
            Symbol::new(&env, "PaymentFailed"),
            payment_id.clone(),
        ), ());
    }

    pub fn get_payment(
        env: Env,
        payment_id: BytesN<32>,
    ) -> PaymentIntent {
        Self::get_intent(env, payment_id)
    }

    fn get_usdc(env: Env) -> Address {
        env.storage().persistent()
            .get(&Symbol::new(&env, "usdc"))
            .unwrap()
    }

    fn get_fee(env: Env) -> u32 {
        let cfg: FeeConfig = env.storage().persistent()
            .get(&Symbol::new(&env, "fee_cfg"))
            .unwrap();
        cfg.platform_fee_bps
    }

    fn get_intent(env: Env, id: BytesN<32>) -> PaymentIntent {
        env.storage().persistent().get(&id).unwrap()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_initiate_payment() {
        let env = Env::default();
        let admin = Address::generate(&env);
        let sender = Address::generate(&env);

        let fee_cfg = FeeConfig {
            platform_fee_bps: 20,
            anchor_fee_bps: 50,
            pjp_fee_bps: 30,
            treasury: admin.clone(),
        };

        let contract_id = env.register_contract(None, PaymentGateway);
        let client = PaymentGatewayClient::new(&env, &contract_id);

        client.initialize(&admin, &fee_cfg, &sender);

        let payment_id = client.initiate_payment(&sender, &1000_0000000);

        let payment = client.get_payment(&payment_id);
        assert_eq!(payment.status, PaymentStatus::Initiated);
        assert_eq!(payment.usdc_amount, 1000_0000000);
    }
}
