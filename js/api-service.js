// Import the client class
import ApiClient from './api-client.js';
import pools from '../data/pools.js';

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

}



