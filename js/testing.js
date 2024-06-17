import ApiClient from './api-client.js';
import pools from '../data/pools.js';
import tokens from '../data/tokens.js';

// 

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

// const poolInfo = {'0x4d5a85b0c83777df72cfb665a933970e4e20c0ec': { lp: '223778147029', symbol: 'FLP-FLM-bNEO' },
//   '0x3269ece5dc33adf17ed14be7780693f3c8b102d1': { lp: '157722325', symbol: 'FLP-bNEO-FUSD' },
//   '0x20c0cdd773fe704721669870c7b33b8688aa132c': { lp: '32353903179', symbol: 'FLP-fUSDT-FUSD' }};

const poolInfo = {};
function getPoolInfo(my_pool_data){
    for (const [pool_key, pool_value] of Object.entries(my_pool_data)){
        for (const [key, value] of Object.entries(poolDataLatest)){
            if (key === pool_key){
                poolInfo[key].lp_token_supply = value.lp_token_supply;
                poolInfo[key].total_usd_value = value.total_usd_value;    
            }
        }
    
    }  
    return poolInfo; 
}

async function getTokenAmount(address){
    
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
}

getTokenAmount("NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj")
  .then(poolInfo => {
    console.log(getPoolInfo(poolInfo)); // Logging getPoolInfo after getTokenAmount finishes
  });

// getTokenAmount("NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj");
// console.log(getTokenAmount("NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj"));

// console.log(getPoolInfo("0x4d5a85b0c83777df72cfb665a933970e4e20c0ec"));

// lp_token_amount / lp_token_supply * total_usd_value 

