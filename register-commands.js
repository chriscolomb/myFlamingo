import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

const commands = [
  {
    name: 'dashboard',
    description: 'Displays the dashboard',
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
  }
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

(async () => {
  try {
    console.log('Started clearing application (/) commands.');

    // For global commands
    const globalCommands = await rest.get(Routes.applicationCommands(process.env.CLIENT_ID));
    await Promise.all(globalCommands.map(command => rest.delete(
      `${Routes.applicationCommands(process.env.CLIENT_ID)}/${command.id}`
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
      Routes.applicationCommands(process.env.CLIENT_ID), // For global commands
    //   Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), // For guild-specific commands
      { body: commands },
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error('Error clearing or registering commands:', error);
  }
})();
