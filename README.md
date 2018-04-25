# fortnite-bot
Telegram and Discord bot that gets information on Fortnite players

Talk to [@fortnite_info_bot](https://t.me/fortnite_info_bot) on Telegram!

[Add the bot](https://discordapp.com/oauth2/authorize?client_id=435307828891090944&scope=bot) to your Discord server!

## Installation
1. Clone the repo to your computer and install the required dependencies.
    ```console
    git clone https://github.com/abhinavk99/fortnite-bot.git
    cd fortnite-bot
    npm install
    ```
2. Go to [Fortnite Tracker API](https://fortnitetracker.com/site-api) and get an API key.
3. Get a Discord bot token from making a Bot User.
4. Get a Telegram bot token from [@BotFather](https://t.me/BotFather).
5. Make a file called `.env` in the repo directory.
6. Copy/paste the below into the file.
    ```
    TELEGRAM_TOKEN=Token here
    FORTNITE_KEY=Key here
    DISCORD_TOKEN=Token here
    ```
7. Put your tokens and key where it says to in the config. Do not put quotes around the tokens.
8. Run the bot.
    ```console
    node src/fortniteBot.js
    ```

## Commands

### Global Commands
| Command | Description | Usage |
| --- | --- | --- |
| /user | Get global stats for a player | /user `<username>` |
| /pc | Get global stats for a PC player | /pc `<username>` |
| /xbox | Get global stats for an XBOX player | /xbox `<username>` |
| /ps4 | Get global stats for a PS4 player | /ps4 `<username>` |
| /season3 | Get all season 3 stats for a player | /season3 `<username>` |


### Modes Commands
| Command | Description | Usage |
| --- | --- | --- |
| /solo | Get lifetime solo stats for a player | /solo `<username>` |
| /duo | Get lifetime duo stats for a player | /duo `<username>` |
| /squad | Get lifetime squad stats for a player | /squad `<username>` |
| /solos3 | Get season 3 solo stats for a player | /solos3 `<username>` |
| /duos3 | Get season 3 duo stats for a player | /duos3 `<username>` |
| /squads3 | Get season 3 squad stats for a player | /squads3 `<username>` |

### Other Commands
| Command | Description | Usage |
| --- | --- | --- |
| /recent | Get recent match stats for a player | /recent `<username>` |

## Examples
![](examples/user.png)
![](examples/solo.png)
![](examples/duo.png)
![](examples/squad.png)

## Dependencies
Powered by [Fortnite Tracker API](https://fortnitetracker.com/site-api) and [fortnite.js](https://github.com/ickerio/fortnite.js)

## Releases
Releases start at v2.0.1 because I didn't know how to use git tags before then and manually changed the versions in package.json