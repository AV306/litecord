# LiteCord

Minimal web-based Discord client, fully client-sided. Single-file if you stick the CSS and JS insde the main HTML file.

## Usage

Requires your Discord token (this will NOT be transmitted anywhere besides the Discord API)

### Getting your token

You can get your token by using the Network page in Developer Tools. Start a capture, go to some random pages, look for a request to something like `https://discord.com/api/v9/channels/[some numbers]`. You'll find your token in `Request > Headers > Authorization`, copy the whole thing over.

### Using the thing

1. Paste your token into the "Token" field on top and press Enter, or click the "Validate token" button. You should see the "Logged in as: Unknwon user" change to show your username.
2. Wait for server info to load
3. Choose a server from the leftmost select-box and a channel from the second-left one (note: channel categories are shown here as well)
4. 30 messages will load; if you want more, hit the "Load More Messages" button
5. Send messages with the box at the bottom

## Hosting (ish)

### Remote

Hosted here: [https://av30.github.io/litecord](https://av30.github.io/litecord)

### Local

Clone the repo, then open `index.html` in a web browser.
