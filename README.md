# Dashboard-ATHON Bot
Developed by `teamduck` and `maika_coleen` on Discord.

## How to add to Discord server
- Add **Dashboard-ATHON Bot** application via [this link](https://discord.com/oauth2/authorize?client_id=1244872561490268161)

## How to run
- Ensure you have the `.env` in the root directory of the project
- If it is your first time running, `npm i`
- If you added any new commands to the bot, `node register-commands.js`
- To run, `node .`

## Slash Commands
All commands are only to be presented to the user who executed the commands. Other Discord users will not be able to see the command results.
- `/dashboard`: Shows a dashboard of your Flamingo Finance pools. If it is `FLP`, it will also show the optimal restake time.
![`/dashboard` Example 1200](./README_images/dashboard1.png)
![`/dashboard` Example 2](./README_images/dashboard2.png)
- `/register [address]`: Link your `N3` address with the Discord bot.
![`/register` Example](./README_images/register.png)
- `/unregister`: Unlink your `N3` address with the Discord bot.
![`/unregister` Example](./README_images/unregister.png)
- `/currency [currency]`: Set preferred currency to showcase on the dashboard.
![`/currency` Example](./README_images/currency.png)

## Future plans
Granted the bot is well appraised, we have future plans to add notifications to let the user know that it is time to restake for their pool! In addition, we would like to show unclaimed `FLP` for each of the pools as well. This is to be done by setting up a connection to an `RPC` node. 