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

function isLeapYear(year){
    if (year % 4 === 0){
        if (year % 100 === 0){
            if (year % 400 === 0){
                return true;
            }else{
                return false;
            }
        }else{
            return true;
        }
    }else{
        return false;
    }
}

export function getRestakeDays(compoundsPrYear){
    const currentYear = new Date().getFullYear();
    const isLeap = isLeapYear(currentYear);
    let restakeDays = 0;
    if (isLeap === true){
        restakeDays = 366/compoundsPrYear;
    }else{
        restakeDays = 365/compoundsPrYear;
    }
    return Math.ceil(restakeDays);
}

async function getLastClaimDate(){
    const data = await client.getWalletClaimsLatest('NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj')
    const latestClaimData = data.data;
    return latestClaimData;
}
        
// getExchangeRate("CAD").then(data => console.log(data));

// getTokenAmount("NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj")
//   .then(poolInfo => {
    // getPoolInfo(poolInfo);
    // console.log(poolInfo);
    // getLV(poolInfo);

     
//   });

// console.log(getRestakeDays(5));
// getLastClaimDate().then(data => console.log(data));


