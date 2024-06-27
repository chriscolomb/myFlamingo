import ApiClient from './api-client.js';
import pools from '../data/pools.js';
import tokens from '../data/tokens.js';

// NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj

const client = new ApiClient();

const data = await client.getFlamingoLivedataPooldataLatest();

const poolDataLatest = data.data.pool_data;
// console.log(JSON.stringify(data, null, 2));

// function to get the pool name from its hash
function getPoolName(poolHash){
    for (const [key, value] of Object.entries(pools)){
        if (value.hash === poolHash){
            return key;
        }
    }
}

// function to get the token name from its hash
function getTokenName(tokenHash){
    for (const [key, value] of Object.entries(tokens)){
        if (value.hash === tokenHash){
            return key;
        }
    }
}

// function to get the pook lp_token_supply, total_usd_value and apy by looping through the object and comparing the pool hash key
const poolInfo = {};
function getPoolInfo(my_pool_data){
    for (const [pool_key, pool_value] of Object.entries(my_pool_data)){
        for (const [key, value] of Object.entries(poolDataLatest)){
            if (key === pool_key){
                poolInfo[key].lp_token_supply = value.lp_token_supply;
                poolInfo[key].total_usd_value = value.total_usd_value;
                poolInfo[key].apy = value.apy;    
            }
        }
    
    }  
    return poolInfo; 
}

// function to find the which pool the user has liquidity in and get the lp_token_amount and the symbol of the pool and store it in an object
async function getTokenAmount(address){

    try{
        const walletData = await client.getWalletWalletLatest(address);
        const walletLiquidityData = walletData.data[0].liquidity;
        
        for (const [key, value] of Object.entries(walletLiquidityData)) {
            if (!poolInfo[key]) {
                poolInfo[key] = {}; 
            }
            poolInfo[key].symbol = getPoolName(key);
            poolInfo[key].lp_token_amount = parseInt(value.lp_token_amount, 10);
        
        }
        return poolInfo;
    } catch (error){
        console.error("Error fetching data from URL: /wallet/wallet/latest:", error);
        throw error;
    }
    
    
}

// function to calculate the liquidity value of the pool
function getLV(poolInfo){
    for (const [key,value] of Object.entries(poolInfo)){
        const lv = value.lp_token_amount / value.lp_token_supply * value.total_usd_value;
        poolInfo[key].lv = lv;
    }
    return poolInfo;
}

// function to get the exchange rate of a currency from USD
async function getExchangeRate(currency){
    try{
        const pair = "USD_" + currency;
        const fiatExchangeRate = await client.getFlamingoLivedataFiatexchangerate(pair);
        return fiatExchangeRate;

    } catch (error){
        console.error("Error fetching data from URL: /flamingo/live-data/fiat-exchange-rate/{pair}:", error);
        throw error;
    } 
}


// ALREADY IMPLEMENTED IN THE API-CLIENT.JS
async function get_unit_price(symbol){
    const data = await client.getFlamingoLivedataPricesLatest();
    for (let i = 0; i < data.length; i++){
         if (data[i].symbol === symbol){
             return data[i].usd_price;
         }
    }
}

async function getRestakeTime(poolInfo){
    const gasPrice = await get_unit_price("GAS");
    // console.log("gasPrice: " + gasPrice)
    const costToReStake = 0.6 * gasPrice;
    // console.log("costToReStake: " + costToReStake)

    for (const [key, value] of Object.entries(poolInfo)){
        if (!value.lv){
            continue;
        }
        const apy = value.apy /100;
        // console.log("apy: " + apy)
        const usdPrDay = value.lv * (apy / 365);
        // console.log("usdPrDay: " + usdPrDay)

        let bestWorth = 0;
        let bestNumCompound = 0;

        for (let i = 1; i < 365; i +=1){
            const tmp = ((1+apy/i) ** i) * value.lv - costToReStake * i;
            if (tmp > bestWorth){
                bestNumCompound = i;
                bestWorth = tmp;
            }
        }
        const period = 365 / bestNumCompound;  
        const result = {
            periodValue: usdPrDay * period,
            compoundsPrYear: bestNumCompound
        }
        poolInfo[key].restakeTime = result;
        
    }
    return poolInfo;
}
// getExchangeRate("CAD").then(data => console.log(data));

getTokenAmount("NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj")
  .then(poolInfo => {
    getPoolInfo(poolInfo);
    getLV(poolInfo);
    console.log(getRestakeTime(poolInfo));
     
  });

// getExchangeRate("EUR");


