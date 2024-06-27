// Import the client class
import ApiClient from './api-client.js';
import pools from '../data/pools.js';
import { getPoolName } from './convert.js';

export default class Api{
    constructor(wallet_address){
        this.wallet_address = wallet_address;
        this.client = new ApiClient();
        this.pool_list = [];
    }

findPool(hash){
    for (let key in pools){
        let nestedObj = pools[key];
        if (hash === nestedObj.hash){
            return key
        }
    }    
}
 
async getPool(){
    const lp = await this.client.getWalletLpLatest(this.wallet_address);
    for (let i = 0; i < lp.data.length; i++){
        let own_pool = lp.data[i].lp_token;
        let pool_name = this.findPool(own_pool);
        this.pool_list.push(pool_name);  
        
    }
    return this.pool_list;  
}

async getUnitPrice(symbol){
    const data = await this.client.getFlamingoLivedataPricesLatest();
    // console.log(data);
    for (let i = 0; i < data.length; i++){
         if (data[i].symbol === symbol){
             return data[i].usd_price;
         }
    }
}

// function to get the pool lp_token_supply, total_usd_value and apy by looping through the object and comparing the pool hash key
async getPoolInfo(poolInfo){
    try{
        const data = await this.client.getFlamingoLivedataPooldataLatest();
        const poolDataLatest = data.data.pool_data;
        for (const [pool_key, pool_value] of Object.entries(poolInfo)){
            for (const [key, value] of Object.entries(poolDataLatest)){
                if (key === pool_key){
                    if (!poolInfo[key]){
                        poolInfo[key] = {};
                    }
                    poolInfo[key].lp_token_supply = value.lp_token_supply;
                    poolInfo[key].total_usd_value = value.total_usd_value;
                    poolInfo[key].apy = value.apy;    
                }
            }
        } 
        return poolInfo; 
    }catch{
        console.error("Error fetching data from URL: /flamingo/live-data/pool-data/latest:", error);
        throw error;
    }
}

// function to find the which pool the user has liquidity in and get the lp_token_amount and the symbol of the pool and store it in an object
async getTokenAmount(address, poolInfo){

    try{
        const walletData = await this.client.getWalletWalletLatest(address);
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
getLV(poolInfo){
    for (const [key,value] of Object.entries(poolInfo)){
        const lv = value.lp_token_amount / value.lp_token_supply * value.total_usd_value;
        poolInfo[key].lv = lv;
    }
    return poolInfo;
}

async getRestakeTime(poolInfo){
    const gasPrice = await this.getUnitPrice("GAS");
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





}



