import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// Production
const CLIENT_ID = process.env.CLIENT_ID;
const DISCORD_TOKEN = process.env.DISCORD_TOKEN;

// Test
// const CLIENT_ID = process.env.TEST_CLIENT_ID;
// const DISCORD_TOKEN = process.env.TEST_DISCORD_TOKEN;


const commands = [
  {
    name: 'dashboard',
    description: 'Displays the dashboard for top 5 pools',
  },
  {
    name: 'register',
    description: 'Registers your NEO address',
    options: [
      {
        name: 'address',
        type: 3,
        description: 'The NEO address to register',
        required: true,
      },
    ],
  },
  {
    name: 'unregister',
    description: 'Unregisters your NEO address',
  },
  // {
  //   name: 'notify',
  //   description: 'Sets up notifications via DM when it is time for optimal restake'
  // },
  {
    name: 'currency',
    description: 'Sets the currency for the dashboard',
    options: [
      {
        name: 'currency',
        type: 3,
        description: 'The currency to set',
        required: true,
        choices: [
          { name: 'United States Dollar (USD)', value: 'USD' },
          { name: 'Euro (EUR)', value: 'EUR' },
          { name: 'Japanese Yen (JPY)', value: 'JPY' },
          { name: 'South Korean Won (KRW)', value: 'KRW' },
          { name: 'British Pound (GBP)', value: 'GBP' },
          { name: 'Chinese Yuan (CNY)', value: 'CNY' },
          { name: 'Canadian Dollar (CAD)', value: 'CAD' },
          { name: 'Australian Dollar (AUD)', value: 'AUD' },
          { name: 'Swiss Franc (CHF)', value: 'CHF' },
          { name: 'Russian Ruble (RUB)', value: 'RUB' },
          { name: 'Singapore Dollar (SGD)', value: 'SGD' },
          { name: 'Hong Kong Dollar (HKD)', value: 'HKD' },
          { name: 'Indian Rupee (INR)', value: 'INR' },
          { name: 'Brazilian Real (BRL)', value: 'BRL' },
          { name: 'Turkish New Lira (TRY)', value: 'TRY' },
          { name: 'Mexican Peso (MXN)', value: 'MXN' },
          { name: 'South African Rand (ZAR)', value: 'ZAR' },
          { name: 'New Zealand Dollar (NZD)', value: 'NZD' },
          { name: 'Swedish Krona (SEK)', value: 'SEK' },
          { name: 'Norwegian Krone (NOK)', value: 'NOK' }
        ],
      },
    ],
  },
  // {
  //   name: 'test',
  //   description: 'Test command',
  // }
];

const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started clearing application (/) commands.');

    // For global commands
    const globalCommands = await rest.get(Routes.applicationCommands(CLIENT_ID));
    await Promise.all(globalCommands.map(command => rest.delete(
      `${Routes.applicationCommands(CLIENT_ID)}/${command.id}`
    )));

    // For guild-specific commands
    // if (process.env.GUILD_ID) {
    //   const guildCommands = await rest.get(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID));
    //   await Promise.all(guildCommands.map(command => rest.delete(
    //     `${Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID)}/${command.id}`
    //   )));
    // }

    console.log('Successfully cleared application (/) commands.');

    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationCommands(CLIENT_ID), // For global commands
    //   Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // For guild-specific commands
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error clearing or registering commands:', error);
  }
})();
