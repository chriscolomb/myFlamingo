import { Client, GatewayIntentBits, EmbedBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ActionRowBuilder } from 'discord.js';

import Api from './js/api-service.js';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';
import { getExchangeRate } from './js/convert.js';

dotenv.config();

const client = new Client({ 
  intents: [GatewayIntentBits.Guilds],
  logLevel: 'debug'
});
const uri = process.env.MONGODB_URI;

const mongoClient = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

mongoClient.connect()
  .then(() => {
    console.log("Connected to MongoDB!");
  })
  .catch((error) => {
    console.error("Failed to connect to MongoDB: ", error);
  });

const mongoDatabase = mongoClient.db("Database");
const usersCollection = mongoDatabase.collection("Users");

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

const getCoinEmoji = (coin) => {
  const coinEmojis = {
    'bNEO': '<:bNEO:1245586402448511026>',
    'CANDY': '<:CANDY:1245586404591931433>',
    'DOGER': '<:DOGER:1245586406605324359>',
    'fBNB': '<:fBNB:1245586409029505036>',
    'fCAKE': '<:fCAKE:1245586410795175937>',
    'FDE': '<:FDE:1245586412938592338>',
    'FLM': '<:FLM:1245586415077560402>',
    'FLOCKS': '<:FLOCKS:1245586417304866858>',
    'FLUND': '<:FLUND:1245586419385368597>',
    'FUSD': '<:FUSD:1245586422472376474>',
    'fUSDT': '<:fUSDT:1245586426309906473>',
    'fWBTC': '<:fWBTC:1245586427975045192>',
    'fWETH': '<:fWETH:1245586429694971916>',
    'GAS': '<:GAS:1245586431955701880>',
    'GM': '<:GM:1245586434581200907>',
    'NEO': '<:NEO:1245587545803194409>',
    'pONT': '<:pONT:1245586438964252703>',
    'SOM': '<:SOM:1245586442969681940>',
    'SWTH': '<:SWTH:1245586446111211681>',
    'TIPS': '<:TIPS:1245586449542152234>',
    'WING': '<:WING:1245587544113025064>'
  };

  // Check if coin exists in coinEmojis, return corresponding emoji, else return empty string
  return coinEmojis.hasOwnProperty(coin) ? coinEmojis[coin] : '';
};

const getLiquidityPools = async (api, currency) => {
  let myPoolData = {};
  await api.getTokenAmount(myPoolData);
  await api.getPoolInfo(myPoolData);
  await api.getLV(myPoolData);
  await api.getRestakeTime(myPoolData);
  await api.getLastClaimDate(myPoolData);
  console.log(myPoolData);
  myPoolData = Object.fromEntries(Object.entries(myPoolData).sort(([,a],[,b]) => b.lv - a.lv)); // sort by lv
  let lp_value = "";
  let rp_value = "";
  let total_tlv = 0;
  let pool_count = 0;

  for (const pool in myPoolData) {
    if (myPoolData[pool].lv > 10) {
      const pool_type = myPoolData[pool].symbol.split("-")[0];
      const coin1 = myPoolData[pool].symbol.split("-")[1];
      const coin2 = myPoolData[pool].symbol.split("-")[2];
      const coin1_emoji = getCoinEmoji(coin1);
      const coin2_emoji = getCoinEmoji(coin2);
      const tlv = currency !== "USD" ? await getExchangeRate(currency) * myPoolData[pool].lv : myPoolData[pool].lv;
      total_tlv += tlv;
      
      let optimal_claim_date = myPoolData[pool].optimal_claim_date;
      if (optimal_claim_date < new Date()) {
        optimal_claim_date = "Now";
      } else {
        const diffTime = Math.abs(myPoolData[pool].optimal_claim_date - new Date());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (isNaN(diffDays)) {
          optimal_claim_date = "Not Applicable (Claim at least once)";
        } else {
          optimal_claim_date = `${diffDays} days`;
        }
      }

      if (!myPoolData[pool].hasOwnProperty("last_claimed")) {
        myPoolData[pool].last_claimed = "Never";
      } else {
        myPoolData[pool].last_claimed = myPoolData[pool].last_claimed.toDateString();
      }

      if (pool_type == "FLP" && pool_count < 5) {
        lp_value += "\n" + coin1_emoji + coin2_emoji + ` \`${myPoolData[pool].symbol}\`` + "\n";
        lp_value += `> **TLV:** \`${tlv.toFixed(2)} ${currency}\`\n`;
        if (coin1 === "FUSD" || coin2 === "FUSD") {
          lp_value += `> **Average APR:** \`${myPoolData[pool].apy.toFixed(2)}%\`\n`;
        } else {
          lp_value += `> **Minting APR:** \`${myPoolData[pool].apy.toFixed(2)}%\`\n`;
        }
        lp_value += `> **Last Claimed Date:** \`${myPoolData[pool].last_claimed}\`\n`;
        lp_value += `> **Optimal Restake in:** \`${optimal_claim_date}\`\n`;
        pool_count++;
      } else if (pool_type == "FRP" && pool_count < 5) {
        rp_value += "\n" + coin1_emoji + coin2_emoji + ` \`${myPoolData[pool].symbol}\`` + "\n";
        rp_value += `> **TLV:** \`${tlv.toFixed(2)} ${currency}\`\n`;
        rp_value += `> **APR:** \`${myPoolData[pool].apy.toFixed(2)}%\`\n`;
        rp_value += `> **Last Claimed Date:** \`${myPoolData[pool].last_claimed}\`\n`;
        pool_count++;
      }

    }

  }
  if (lp_value !== "" && rp_value === "") {
    lp_value += `\n**Total TLV:** \`${total_tlv.toFixed(2)} ${currency}\``;
  } else if (lp_value === "" && rp_value !== "") {
    rp_value += `\n**Total TLV:** \`${total_tlv.toFixed(2)} ${currency}\``;
  } else if (lp_value !== "" && rp_value !== "") {
    rp_value += `\n**Total TLV:** \`${total_tlv.toFixed(2)} ${currency}\``;
  }
  return { lp_value, rp_value };
}

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'dashboard') {
    await interaction.deferReply({ ephemeral: true });
    const userID = interaction.user.id;
    try {
      const userDoc = await usersCollection.findOne({ userID: userID });
      if (!userDoc) {
        const embed = new EmbedBuilder()
          .setTitle('Error')
          .setDescription('Please register your NEO address with the bot using `/register`.')
          .setColor('#d741c4');
        await interaction.reply({ embeds: [embed] , ephemeral: true });
        return;
      } else {
        const address = userDoc.address;
        const currency = userDoc.currency || "USD";
        const api = new Api(address);
        try {
          const { lp_value, rp_value } = await getLiquidityPools(api, currency);
          const embed = new EmbedBuilder()
            .setTitle(`Dashboard for \`${address}\``)
            .setColor('#d741c4');
          
          if (rp_value === "" && lp_value !== "") {
            embed.addFields(
              { name: 'Liquidity Pools', value: lp_value, inline: false }
            );
          } else if (lp_value === "" && rp_value !== "") {
            embed.addFields(
              { name: 'Reverse Pools', value: rp_value, inline: false }
            );
          } else if (lp_value !== "" && rp_value !== "") {
            embed.addFields(
              { name: 'Liquidity Pools', value: lp_value, inline: false },
              { name: 'Reverse Pools', value: rp_value, inline: false }
            );
          } else {
            embed.setDescription('No pools found.');
          }
            
          await interaction.editReply({ embeds: [embed] , ephemeral: true });
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
          const embed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Failed to fetch dashboard data. Please try again later.')
            .setColor('#d741c4');
          await interaction.editReply({ embeds: [embed] , ephemeral: true });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Failed to fetch user data. Please try again later.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] , ephemeral: true });
    }
  } else if (commandName === 'register') {
    await interaction.deferReply({ ephemeral: true });
    const address = interaction.options.getString('address');
    // check if address is valid NEO address
    const regex = /^N[0-9a-zA-Z]{33}$/;
    if (!regex.test(address)) {
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Invalid NEO address.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] , ephemeral: true });
      return;
    }
    const userID = interaction.user.id;
    try {
      await usersCollection.updateOne(
        { userID: userID }, 
        { $set: { address: address } }, 
        { upsert: true }
      );
      const embed = new EmbedBuilder()
        .setTitle('Registration')
        .setDescription(`Successfully registered \`${address}\` with the bot.`)
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] , ephemeral: true });
    } catch (error) {
      console.error('Failed to register user:', error);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Failed to register. Please try again later.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] , ephemeral: true });
    }
  } else if (commandName === 'unregister') {
    await interaction.deferReply({ ephemeral: true });
    const userID = interaction.user.id;
    try {
      await usersCollection.deleteOne({ userID: userID });
      const embed = new EmbedBuilder()
        .setTitle('Unregistration')
        .setDescription('Successfully unregistered with the bot.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] , ephemeral: true });
    } catch (error) {
      console.error('Failed to unregister user:', error);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Failed to unregister. Please try again later.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] , ephemeral: true });
    }
  } else if (commandName === 'currency') {
    await interaction.deferReply({ ephemeral: true });
    const currency = interaction.options.getString('currency');
    const userID = interaction.user.id;
    try {
      await usersCollection.updateOne(
        { userID: userID }, 
        { $set: { currency: currency } }, 
        { upsert: true }
      );
      const embed = new EmbedBuilder()
        .setTitle('Currency set!')
        .setDescription(`Successfully set currency to \`${currency}\`.`)
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] , ephemeral: true });
    } catch (error) {
      console.error('Failed to set currency:', error);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Failed to set currency. Please try again later.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] , ephemeral: true });
    }
  }
  // } else if (commandName === 'notify') {
  //     await interaction.deferReply({ ephemeral: true });
  //     const userID = interaction.user.id;
  //     try {
  //       const userDoc = await usersCollection.findOne({ userID: userID });
  //       if (!userDoc) {
  //         const embed = new EmbedBuilder()
  //           .setTitle('Error')
  //           .setDescription('Please register your NEO address with the bot using `/register`.')
  //           .setColor('#d741c4');
  //         await interaction.editReply({ embeds: [embed] });
  //         return;
  //       }
  //       const address = userDoc.address;
  //       const api = new Api(address);
  //       let myPoolData = {};
  //       await api.getTokenAmount(myPoolData);
  //       await api.getPoolInfo(myPoolData);
  //       await api.getLV(myPoolData);
  //       await api.getRestakeTime(myPoolData);
  //       await api.getLastClaimDate(myPoolData);

  //       myPoolData = Object.fromEntries(Object.entries(myPoolData).sort(([, a], [, b]) => b.lv - a.lv)); // sort by lv
  //       console.log(myPoolData);

  //       const select = new StringSelectMenuBuilder()
  //         .setCustomId('pool')
  //         .setPlaceholder('Select pool...')
  //         .setMaxValues(Object.keys(myPoolData).length);
        
  //       let optimal_claim_dates = {};
  //       for (const pool in myPoolData) {
  //       if (myPoolData[pool].lv > 10) {
  //         optimal_claim_dates[myPoolData[pool].symbol] = myPoolData[pool].optimal_claim_date; 
  //         select.addOptions(new StringSelectMenuOptionBuilder()
  //           .setLabel(myPoolData[pool].symbol)
  //           .setValue(myPoolData[pool].symbol));
  //       }
  //       }
  //       const row = new ActionRowBuilder().addComponents(select);
  //       let embed = new EmbedBuilder()
  //         .setTitle('Which pool(s) would you like to set optimal restake notifications for?')
  //         .setColor('#d741c4');

  //       await interaction.editReply({ embeds: [embed], components: [row] });

  //       const filter = (i) => i.customId === 'pool' && i.user.id === userID;
  //       // 30 seconds to select
  //       const collector = interaction.channel.createMessageComponentCollector({ filter, time: 30000 }); 
  //       collector.on('collect', async (i) => {
  //         await i.deferUpdate();
  //         const selectedPools = i.values;
  //         let successfulPools = [];
  //         for (const pool of selectedPools) {
  //           // update database with pool, optimal claim date, notified = false
  //           await usersCollection.updateOne(
  //             { userID: userID },
  //             { $set: { [`notifications.${pool}`]: { optimal_claim_date: optimal_claim_dates[pool], notified: false } } }
  //           );
  //           successfulPools.push(pool);
  //           console.log(pool, optimal_claim_dates[pool]);
  //         }
  //         embed = new EmbedBuilder()
  //           .setTitle('Notifications set!')
  //           .setDescription(`Successfully set notifications for \`${successfulPools.join(', ')}\` to optimal claim date.`)
  //           .setColor('#d741c4');
  //         await i.editReply({ embeds: [embed] , components: []});
  //       });

  //       collector.on('end', collected => {
  //         if (collected.size === 0) {
  //           embed = new EmbedBuilder()
  //             .setTitle('No selection made.')
  //             .setColor('#d741c4');
  //           interaction.editReply({ embeds: [embed] , components: []});
  //         }
  //       });

  //   } catch (error) {
  //     console.error('Failed to set notification:', error);
  //     const embed = new EmbedBuilder()
  //       .setTitle('Error')
  //       .setDescription('Failed to set notifications. Please try again later.')
  //       .setColor('#d741c4');
  //     await interaction.editReply({ embeds: [embed] });
  //   }
  // } else if (commandName === 'test') {
  //   await interaction.deferReply({ ephemeral: true });
  //   // clear pool, optimal claim date, notified = false from database
  //   const userID = interaction.user.id;
  //   try {
  //     await usersCollection.updateOne(
  //       {
  //         userID: userID
  //       },
  //       {
  //         $unset: {
  //           notifications: ""
  //         }
  //       }
  //     );
  //   const embed = new EmbedBuilder()
  //     .setTitle('Pool notifications cleared!')
  //     .setColor('#d741c4');
  //   await interaction.editReply({ embeds: [embed] });
  //   } catch (error) {
  //     console.error('Failed to clear pool notifications:', error);
  //     const embed = new EmbedBuilder()
  //       .setTitle('Error')
  //       .setDescription('Failed to clear pool notifications. Please try again later.')
  //       .setColor('#d741c4');
  //     await interaction.editReply({ embeds: [embed] });
  //   }
  // }
});

client.login(process.env.DISCORD_TOKEN);

process.on('SIGINT', async () => {
  console.log('Received SIGINT. Shutting down...');
  await mongoClient.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM. Shutting down...');
  await mongoClient.close();
  process.exit(0);
});
