import ApiClient from './api-client.js';
import pools from '../data/pools.js';
import tokens from '../data/tokens.js';

// NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj

const client = new ApiClient();

// function to get the pool name from its hash
export function getPoolName(poolHash){
    for (const [key, value] of Object.entries(pools)){
        if (value.hash === poolHash){
            return key;
        }
    }
}

// function to get the token name from its hash
export function getTokenName(tokenHash){
    for (const [key, value] of Object.entries(tokens)){
        if (value.hash === tokenHash){
            return key;
        }
    }
}

// function to get the exchange rate of a currency from USD
export async function getExchangeRate(currency){
    try{
        const pair = "USD_" + currency;
        const fiatExchangeRate = await client.getFlamingoLivedataFiatexchangerate(pair);
        return fiatExchangeRate;

    } catch (error){
        console.error("Error fetching data from URL: /flamingo/live-data/fiat-exchange-rate/{pair}:", error);
        throw error;
    } 
}
        
// getExchangeRate("CAD").then(data => console.log(data));

// getTokenAmount("NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj")
//   .then(poolInfo => {
    // getPoolInfo(poolInfo);
    // console.log(poolInfo);
    // getLV(poolInfo);

     
//   });


