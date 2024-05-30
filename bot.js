const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');

const address = 'NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj';

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'hello') {
    const embed = new EmbedBuilder()
      .setTitle('Hello!')
      .setDescription('I am a dashboard bot!')
      .setColor('#d741c4');
    await interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'dashboard') {
    const embed = new EmbedBuilder()
      .setTitle(`Dashboard for \`${address}\``)
      .setColor('#d741c4')
      .addFields(
        { name: 'TLV', value: '`...`', inline: false },
        { name: 'Unclaimed Rewards', value: '`...`', inline: false },
        { name: 'Unclaimed Values', value: '`...`', inline: false },
        { name: 'APR', value: '`...`', inline: false },
        { name: 'Optimal Restake Time', value: '`...`', inline: false }
      );
    await interaction.reply({ embeds: [embed], ephemeral: true });
  }
});

// setInterval(checkOptimalRestakeTime, 60 * 1000);  // run every minute

// async function checkOptimalRestakeTime() {
//   const users = await fetchUsersWithOptimalRestakeTimeZero();
//   for (const userId of users) {
//     const user = await client.users.fetch(userId);
//     const embed = new Discord.MessageEmbed()
//       .setTitle('Optimal Restake Time')
//       .setDescription('Your optimal restake time is now 0.')
//       .setColor('#d741c4');
//     await user.send({ embeds: [embed] });
//   }
// }

// function fetchUsersWithOptimalRestakeTimeZero() {
//   return new Promise((resolve, reject) => {
//     const users = [];
//     fs.createReadStream('users.csv')
//       .pipe(csv())
//       .on('data', (row) => {
//         const optimalRestakeTime = moment(row.optimal_restake_time, 'YYYY-MM-DD HH:mm:ss');
//         if (optimalRestakeTime.isSameOrBefore(moment())) {
//           users.push(row.user_id);
//         }
//       })
//       .on('end', () => {
//         resolve(users);
//       })
//       .on('error', reject);
//   });
// }

client.login('MTI0NDg3MjU2MTQ5MDI2ODE2MQ.G4PF_b.NywvLd3lR1tSY-8EMpF_ECDKrlzIluiBBK86lk');