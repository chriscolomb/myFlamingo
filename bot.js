import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import Api from './js/api-service.js';
import { MongoClient, ServerApiVersion } from 'mongodb';
import dotenv from 'dotenv';

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

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'dashboard') {
    await interaction.deferReply();
    const userID = interaction.user.id;
    try {
      const userDoc = await usersCollection.findOne({ userID: userID });
      if (!userDoc) {
        const embed = new EmbedBuilder()
          .setTitle('Error')
          .setDescription('Please register your NEO address with the bot using `/register`.')
          .setColor('#d741c4');
        await interaction.editReply({ embeds: [embed] });
        return;
      } else {
        const address = userDoc.address;
        const api = new Api(address);
        try {
          const pool_list = await api.getPool(address);
          const embed = new EmbedBuilder()
            .setTitle(`Dashboard for \`${address}\``)
            .setColor('#d741c4')
            .addFields(
              { name: 'Liquidity Pools', value: `\`${pool_list[0]}\``, inline: false },
              { name: 'TLV', value: '`...`', inline: false },
              { name: 'Unclaimed Rewards', value: '`...`', inline: false },
              { name: 'Unclaimed Values', value: '`...`', inline: false },
              { name: 'APR', value: '`...`', inline: false },
              { name: 'Optimal Restake Time', value: '`...`', inline: false }
            );
          await interaction.editReply({ embeds: [embed] });
        } catch (error) {
          console.error('Failed to fetch dashboard data:', error);
          const embed = new EmbedBuilder()
            .setTitle('Error')
            .setDescription('Failed to fetch dashboard data. Please try again later.')
            .setColor('#d741c4');
          await interaction.editReply({ embeds: [embed] });
        }
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Failed to fetch user data. Please try again later.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] });
    }
  } else if (commandName === 'register') {
    await interaction.deferReply();
    const address = interaction.options.getString('address');
    // check if address is valid NEO address
    const regex = /^N[0-9a-zA-Z]{33}$/;
    if (!regex.test(address)) {
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Invalid NEO address.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] });
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
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to register user:', error);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Failed to register. Please try again later.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] });
    }
  } else if (commandName === 'unregister') {
    await interaction.deferReply();
    const userID = interaction.user.id;
    try {
      await usersCollection.deleteOne({ userID: userID });
      const embed = new EmbedBuilder()
        .setTitle('Unregistration')
        .setDescription('Successfully unregistered with the bot.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] });
    } catch (error) {
      console.error('Failed to unregister user:', error);
      const embed = new EmbedBuilder()
        .setTitle('Error')
        .setDescription('Failed to unregister. Please try again later.')
        .setColor('#d741c4');
      await interaction.editReply({ embeds: [embed] });
    }
  } 
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
