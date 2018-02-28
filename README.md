# fortnite-bot
Telegram bot that gets information on Fortnite players

Talk to [@fortnite_info_bot](https://t.me/fortnite_info_bot) on Telegram! 

The bot is not running 24/7. Commands made throughout the night will likely get responses the next morning.

## Installation
1. Clone the repo to your computer and install the required dependencies.
    ```console
    git clone https://github.com/abhinavk99/fortnite-bot.git
    cd fortnite-bot
    npm install
    ```
2. Go to [Fortnite Tracker API](https://fortnitetracker.com/site-api) and get an API key.
3. Get a Telegram bot token from [@BotFather](https://t.me/BotFather).
4. Make a file called `config.json` in the repo directory.
5. Copy/paste the below into the file.
    ```javascript
    {
        "telegramToken": "Telegram token here",
        "fortniteKey": "Fortnite Tracker API key here"
    }
    ```
6. Put your Telegram token and Fortnite Tracker key where it says to in the config.
7. Run the bot.
    ```console
    node fortniteBot.js
    ```

## Commands
| Command | Description | Usage |
| --- | --- | --- |
| /user | Get global stats for a player | /user `<username>` |
| /solo | Get solo stats for a player | /solo `<username>` |
| /duo | Get duo stats for a player | /duo `<username>` |
| /squad | Get squad stats for a player | /squad `<username>` |

## Examples
![](examples/user.png)
![](examples/solo.png)
![](examples/duo.png)
![](examples/squad.png)

## Dependencies
Powered by [Fortnite Tracker API](https://fortnitetracker.com/site-api) and [fortnite.js](https://github.com/ickerio/fortnite.js)