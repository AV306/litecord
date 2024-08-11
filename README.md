# LiteCord

Minimal web-based Discord client, fully client-sided. Single-file if you stick the CSS and JS insde the main HTML file. 327 LoC!

## Usage

Requires your Discord token (this will **NOT** be transmitted anywhere besides the Discord API)

## Disclaimer

This is *almost definitely* a "third-party client", and thus is *very probably* AGAINST Discord ToS.

This is created for EDUCATIONAL PURPOSES ONLY. I claim NO RESPONSIBILITY for any consequences incurred as a result of using this project, including but not limited to getting banned from Discord.

Use AT YOUR OWN RISK.

### Safely getting your token

You can get your token by using the Network page in Developer Tools. Start a capture, go to some random pages, look for a request to something like `https://discord.com/api/v9/channels/[some numbers]`. You'll find your token in `Request > Headers > Authorization`, copy the whole thing over.

***DO NOT*** share your token with **ANYONE OR ANYTHING** else. This token grants *whoever* has it **COMPLETE ACCESS** to your account. (This is how people's accounts get hacked -- they probably ran something that grabbed their token)

If you suspect your account has been compromised, ***CHANGE YOUR PASSWORD*** and ***LOG OUT ALL DEVICES***. As best as I can tell, the tokens stop working once the devices that generated them have been logged out.

### Using LiteCord

1. Paste your token into the "Token" field on top and press Enter, or click the "Validate token" button. You should see the "Logged in as: Unknwon user" change to show your username.
2. Wait for server info to load
3. Choose a server from the leftmost select-box and a channel from the second-left one (note: channel categories are shown here as well)
4. 30 messages will load; if you want more, hit the "Load More Messages" button
5. Send messages with the box at the bottom

## Hosting (ish)

### Remote

Hosted here: [https://av306.github.io/litecord](https://av306.github.io/litecord)

### Local

Clone the repo, then open `index.html` in a web browser.
