# Changelog for Fortnite Bot

## [7.0.5] - 2018-01-29
### Fixed
- NaN K/D ratio when doing /s7 if the user has 0 kills in one of the modes

## [7.0.4] - 2018-01-22
### Changed
- Modified link in /user response to have a / at the end

## [7.0.3] - 2018-01-22
### Added
- Nodemon as dev dependency

### Fixed
- 404 Not Found Error when a username ending with a period is given

## [7.0.2] - 2018-01-07
### Fixed
- Bug with wins in /leaderboards

## [7.0.1] - 2018-12-06
### Changed
- Updated dependencies

## [7.0.0] - 2018-12-06
### Added
- Season 7 support for commands

### Deprecated
- Season 6 support because of Fortnite Tracker not providing the data anymore

## [6.0.0] - 2018-09-27
### Added
- Season 6 support for commands

### Deprecated
- Season 5 support because of Fortnite Tracker not providing the data anymore

## [5.1.0] - 2018-09-25
### Added
- /matches for match history
- /store for current store
- /challenges for current active challenges

### Fixed
- Platform flags not being taken into account
- Commands list being out of date for /start, /info, and /help

## [5.0.2] - 2018-08-18
### Added
- /wr as alias for /winrate

### Changed
- Times in top x changed to Top x Rate and now shows a percentage of times in top x

### Fixed
- Bug where times in top 3/5/10 and 6/12/25 were not being added up correctly
- Test cases were updated to work with season 5

## [5.0.1] - 2018-08-03
### Fixed
- Incorrectly handling season 4 deprecation

## [5.0.0] - 2018-07-30
### Fixed
- Error handling for /recent

### Deprecated
- Season 4 support because of Fortnite Tracker not providing the data anymore

### Removed
- Season 3 and 4 data from /kd, /rating, and /winrate

## [4.0.0] - 2018-07-12
### Added
- Season 5 support for commands

### Deprecated
- Season 3 support because of Fortnite Tracker not providing the data anymore, uses cached data to get limited season 3 info

## [3.11.0] - 2018-06-29
### Added
- /leaderboards command to see list of best players

## [3.10.0] - 2018-06-12
### Changed
- Specify username in bot's response when user hasn't played a mode
- Specify username in bot's response when user not found
- Move errors and modes into separate files from constants
- Put utility methods, constants, errors, and modes into utils directory

### Fixed
- Fix message for when user has no recent matches
- Fix regex matching for commands

## [3.9.1] - 2018-06-05
### Changed
- Generalized method for getting Fortnite data to remove code reuse
- Replace usage of forEach with for-of

## [3.9.0] - 2018-05-27
### Added
- /winrate command to quickly see user's win rate

### Changed
- Improved formatting the output if user has never played a mode for mode command

### Fixed
- Crash when user has never played a mode for /rating and /kd commands

## [3.8.0] - 2018-05-26
### Added
- /compare command to compare two users delimited by commas
- Test cases for compare method

### Fixed
- Issue with underscores being parsed as italics in Markdown
- Error handling and logging

## [3.7.0] - 2018-05-25
### Added
- /rating command to quickly see user's TRN rating
- /kd command to quickly see user's K/D ratios
- Test cases for rating and kd methods
- Contributing section and link to making Discord bot tutorial to README.md

### Fixed
- Handled error when Fortnite Tracker service is unavailable
- Fixed usage of season 4 commands in README.md

## [3.6.4] - 2018-05-22
### Added
- Link to Fortnite Tracker for the bot's response to /user command
- Added changelog to repository

## Changed
- Changed error logging to use console.error() instead of console.log()

## [3.6.3] - 2018-05-21
### Added
- Temporary cache
- /help command to also get command info (same functionality as /start and /info)

### Changed
- Account for extra whitespace in command input by matching for whitespace instead of splitting by spaces

## [3.6.2] - 2018-05-16
### Added
- Test cases for the various commands

### Fixed
- Fixed /recent error message when Markdown can't parse the username correctly

## [3.6.1] - 2018-05-15
### Fixed
- Fixed /season command getting the correct season number

## [3.6.0] - 2018-05-14
### Added
- Optional platform flags (pc, xbox, ps4) to add at the end of commands to specify the platform to search in

## [3.5.0] - 2018-05-08
### Added
- Demo of /set to README
- TRN rating data to modes commands

### Changed
- Used season 3 data from Fortnite Tracker instead of cache to make command not deprecated anymore

## [3.4.1] - 2018-05-07
### Changed
- Switched package manager from npm to yarn

### Fixed
- Fixed sending the start/info message for /start and /info commands

## [3.4.0] - 2018-05-04
### Added
- /set command to link messaging platform user ID with Fortnite username
- /rold command to show recent matches the old way without Markdown

### Changed
- Modified how table looks for /recent

## [3.3.0] - 2018-05-04
### Changed
- Changed bot's response to /recent to show matches in a Markdown style table

## [3.2.0] - 2018-05-04
### Changed
- Moved methods into different files for better readability
- Replaced instances of var with let and const to fix style

## [3.1.2] - 2018-05-01
### Fixed
- Fixed parsing command input when username has multiple words

## [3.1.1] - 2018-05-01
### Fixed
- Fixed getting text for message object in Telegram message handler

## [3.1.0] - 2018-05-01
### Added
- Telegram bot capability to respond to forwarded messages

## [3.0.1] - 2018-05-01
### Fixed
- Fixed the bot's response for /season to display the correct season

## [3.0.0] - 2018-05-01
### Added
- /season4 and /s4 commands to get season 4 data

### Deprecated
- /season3 command because of Fortnite Tracker giving season 4 data, uses cache to get season 3 data for the limited users in it

## [2.2.1] - 2018-04-25
### Fixed
- Maps the username's hashcode to Fortnite data in cache to account for characters that the cache can't parse

## [2.2.0] - 2018-04-25
### Added
- Caching of season 3 data that the bot gets from the commands to prepare for season 4

### Fixed
- Fixed the config setup in the README

## [2.1.3] - 2018-04-24
### Fixed
- Fixed kills/game stat when player has 0 games

## [2.1.2] - 2018-04-22
### Fixed
- Fixed the formatSeconds method to make it not exported to other files

## [2.1.1] - 2018-04-22
### Fixed
- Fixed times in top 6, 12, and 25 for /season3 command

## [2.1.0] - 2018-04-21
### Added
- /season3 command to combine data from season 3 modes

## [2.0.1] - 2018-04-19
### Changed
- Use configuration tokens from .env instead of config.json
- Merged heroku branch into master branch to remove the need for two branches

## [1.0.0] - 2018-02-04 - 2018-04-17 (Didn't update version number for changes)