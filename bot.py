import csv
import nextcord
import requests

from datetime import datetime
from nextcord.ext import commands, tasks

GUILD_ID = 1244859066472468552
address = "NYtBFomNFzMPsKosGajLaJ7NoaQ1b7cZXj"

bot = commands.Bot()

@bot.event
async def on_ready():
    print(f'We have logged in as {bot.user}')

@bot.slash_command(description="Starter command", guild_ids=[GUILD_ID])
async def hello(interaction: nextcord.Interaction):
    embed = nextcord.Embed(title="Hello!", description="I am a dashboard bot!", color=0xd741c4)
    await interaction.send(embed=embed)

@bot.slash_command(description="Flamingo Finance Dashboard for your NEO Address")
async def dashboard(interaction: nextcord.Interaction):
    msg_title = "Dashboard for `" + address + '`'
    embed = nextcord.Embed(title=msg_title, color=0xd741c4)
    
    # Add sections for TLV, unclaimed rewards, unclaimed values, APR, optimal restake time
    embed.add_field(name="TLV", value="`...`", inline=False)
    embed.add_field(name="Unclaimed Rewards", value="`...`", inline=False)
    embed.add_field(name="Unclaimed Values", value="`...`", inline=False)
    embed.add_field(name="APR", value="`...`", inline=False)
    embed.add_field(name="Optimal Restake Time", value="`...`", inline=False)
    
    await interaction.send(embed=embed, ephemeral=True)
    # await interaction.send(embed=embed)


@tasks.loop(minutes=1)  # adjust the interval as needed
async def check_optimal_restake_time():
    # Fetch all users whose optimal_restake_time has reached 0
    # This is a placeholder function, replace it with your actual function to fetch users from the database
    users = fetch_users_with_optimal_restake_time_zero()

    for user_id in users:
        user = bot.fetch_user(user_id)
        dm_embed = nextcord.Embed(title="Optimal Restake Time", description="Your optimal restake time is now 0.", color=0xd741c4)
        await user.send(embed=dm_embed)


def fetch_users_with_optimal_restake_time_zero():
    users = []
    with open('users.csv', 'r') as file:
        reader = csv.DictReader(file)
        for row in reader:
            # Assuming 'optimal_restake_time' is a timestamp in the format 'YYYY-MM-DD HH:MM:SS'
            optimal_restake_time = datetime.strptime(row['optimal_restake_time'], '%Y-%m-%d %H:%M:%S')
            if optimal_restake_time <= datetime.now():
                users.append(int(row['user_id']))  # Assuming 'user_id' is the column name for user IDs
    return users

check_optimal_restake_time.start()  # start the task

# @bot.slash_command(description="API call command", guild_ids=[GUILD_ID])
# async def api_call(interaction: nextcord.Interaction):
#     response = requests.get('https://api.example.com')  # replace with your API endpoint
#     data = response.json()  # assuming the response is in JSON format

#     # Create an embed message using the data from the API
#     embed = nextcord.Embed(title="API Data", description="Here's some data from the API!", color=0xd741c4)
#     embed.add_field(name="Data Field 1", value=data['field1'], inline=False)  # replace 'field1' with actual field name
#     embed.add_field(name="Data Field 2", value=data['field2'], inline=False)  # replace 'field2' with actual field name

#     await interaction.send(embed=embed)

bot.run('MTI0NDg3MjU2MTQ5MDI2ODE2MQ.G4PF_b.NywvLd3lR1tSY-8EMpF_ECDKrlzIluiBBK86lk')
