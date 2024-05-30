// Import the client class
import ApiClient from './api-client.js';
import pools from '../data/pools.js';

const neo_address = 'NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj';

// Create the client with a custom url or leave blank to use default one (https://neo-api.b-cdn.net)
const client = new ApiClient();

// const data = await client.getFlamingoLivedataPricesLatest();
const lp_data = await client.getWalletLpLatest(neo_address);

const pool_list = [];

function findPool(hash){
    for (let key in pools){
        let nestedObj = pools[key];
        if (hash === nestedObj.hash){
            return key
        }
    }    
}
 
function getPool(lp){
    // return lp.data
    for (let i = 0; i < lp.data.length; i++){
        let own_pool = lp.data[i].lp_token;
        let pool_name = findPool(own_pool);
        pool_list.push(pool_name);  
        
    }
    return pool_list;
    
}

getPool(lp_data);
console.log(pool_list);


// console.log(getPool(lp_data));