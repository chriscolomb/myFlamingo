import nextcord
from nextcord.ext import commands

GUILD_ID = 1244859066472468552

bot = commands.Bot()

@bot.event
async def on_ready():
    print(f'We have logged in as {bot.user}')

@bot.slash_command(description="Starter command", guild_ids=[GUILD_ID])
async def hello(interaction: nextcord.Interaction):
    await interaction.send("Hello!")

bot.run('MTI0NDg3MjU2MTQ5MDI2ODE2MQ.G4PF_b.NywvLd3lR1tSY-8EMpF_ECDKrlzIluiBBK86lk')
