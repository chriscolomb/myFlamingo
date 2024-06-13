import ApiClient from './api-client.js';

const client = new ApiClient();

const data = await client.getFlamingoLivedataPricesLatest();

function get_unit_price(symbol){
    for (let i = 0; i < data.length; i++){
        if (data[i].symbol === symbol){
            return data[i].usd_price;
        }
    }
}

console.log(get_unit_price("FUSD"))