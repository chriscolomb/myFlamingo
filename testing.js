import Api from './js/api-service.js';


const neo_address = 'NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj';

const api = new Api(neo_address);

const pool = await api.getPool(neo_address);
console.log(pool);