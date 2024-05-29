import nextcord
from nextcord.ext import commands

GUILD_ID = 1244859066472468552

bot = commands.Bot()

@bot.event
async def on_ready():
    print(f'We have logged in as {bot.user}')

@bot.slash_command(description="Starter command", guild_ids=[GUILD_ID])
async def hello(interaction: nextcord.Interaction):
    embed = nextcord.Embed(title="Hello!", description="I am a dashboard bot!", color=0xd741c4)
    await interaction.send(embed=embed)

bot.run('MTI0NDg3MjU2MTQ5MDI2ODE2MQ.G4PF_b.NywvLd3lR1tSY-8EMpF_ECDKrlzIluiBBK86lk')
