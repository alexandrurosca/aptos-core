/// This is an example demonstrating how to use marketplace_bid_utils and market_place_listing_utils to build an auction house
/// This example shows how to build a decentralized marketplace where listing are stored under owner's account
/// Note: the buyer can buy from any listing that is stored under owners' account
/// For more detailed description, check readme
module marketplace::marketplace_instant_sale_example {
    use std::signer;
    use std::string::String;
    use aptos_std::table::Table;
    use marketplace::marketplace_listing_utils::{Self as listing_utils, Listing};
    use marketplace::marketplace_bid_utils::{Self as bid_utils};

    use aptos_framework::guid::ID;


    struct Config has key {
        market_fee_numerator: u64,
        market_fee_denominator: u64,
        fee_address: address,
    }

    public entry fun initialize_market(
        account: &signer,
        market_fee_numerator: u64,
        market_fee_denominator: u64,
        fee_address: address,
    ) {
        move_to(
            account,
            Config {
                market_fee_denominator,
                market_fee_numerator,
                fee_address,
            }
        );
    }

     public entry fun update_market_config(
        account: &signer,
        market_fee_numerator: u64,
        market_fee_denominator: u64,
        fee_address: address,
    ) acquires Config {
        // todo: add checks
        let account_addr = signer::address_of(account);
        let configRef = borrow_global_mut<Config>(account_addr);
        // let market_fee_denominatorRef = &mut borrow_global_mut<Config>(signer::address_of(account)).market_fee_denominator;
        // let fee_addressRef = &mut borrow_global_mut<Config>(signer::address_of(account)).fee_address;


        configRef.market_fee_denominator = market_fee_denominator;

        configRef.market_fee_numerator = market_fee_numerator;

        configRef.fee_address = fee_address;
    }

    struct Listings<phantom CoinType> has key {
        all_active_Listings: Table<ID, Listing<CoinType>>,
    }

    public entry fun create_listing<CoinType>(
        owner: &signer,
        creator: address,
        collection_name: String,
        token_name: String,
        property_version: u64,
        amount: u64,
        min_price: u64,
        start_sec: u64,
        expiration_sec: u64,
        withdraw_expiration_sec: u64,
    ) {
        listing_utils::direct_listing<CoinType>(
            owner,
            creator,
            collection_name,
            token_name,
            property_version,
            amount,
            min_price,
            true,
            start_sec,
            expiration_sec,
            withdraw_expiration_sec,
        );
    }

    public entry fun remove_listing<CoinType>(
        owner: &signer,
        listing_creation_number: u64,
    ) {
        listing_utils::cancel_direct_listing<CoinType>(
            owner,
            listing_creation_number
        );
    }

    public entry fun change_listing<CoinType>(
        owner: &signer,
        listing_creation_number: u64,
        new_price: u64
    ) {
        listing_utils::change_price_listing<CoinType>(
            owner,
            listing_creation_number,
            new_price
        );
    }

    public entry fun buy_listing<CoinType>(
        buyer: &signer,
        lister_address: address,
        listing_creation_number: u64,
    ) acquires Config {
        // charge fee for the aggregator
        let config = borrow_global<Config>(@marketplace);

        // buy the token from owner directly
        bid_utils::buy_from_owner_with_fee<CoinType>(
            buyer,
            lister_address,
            listing_creation_number,
            config.fee_address,
            config.market_fee_numerator,
            config.market_fee_denominator,
        );
    }
}
