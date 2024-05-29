// Import the client class
import ApiClient from './api-client.js';

const neo_address = 'NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj';

// Create the client with a custom url or leave blank to use default one (https://neo-api.b-cdn.net)
const client = new ApiClient();

// Use it to retrieve data
const data = await client.getFlamingoLivedataPricesLatest();

const lp_data = await client.getWalletLpLatest(neo_address);


console.log(lp_data);