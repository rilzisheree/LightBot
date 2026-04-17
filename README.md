# Discord Moderation Bot

A full-featured Discord moderation bot with MongoDB storage, global logging, and dark green themed embeds.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Environment variables
Create a `.env` file (or set these on Render):
```
DISCORD_TOKEN=your_bot_token
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
BOT_OWNER_ID=your_discord_user_id
CLIENT_ID=your_bot_application_id
```

> **CLIENT_ID** = Your bot's Application ID from the Discord Developer Portal.

### 3. Register slash commands
Run this **once** to register all commands globally with Discord:
```bash
npm run deploy
```
> Global commands take up to 1 hour to propagate. For instant testing, replace `applicationCommands(clientId)` with `applicationGuildCommands(clientId, guildId)` in `deploy-commands.js`.

### 4. Start the bot
```bash
npm start
```

---

## Commands

| Command | Description | Who can use |
|---|---|---|
| `/ban` | Ban a member | Admin / Allowed |
| `/unban` | Unban a user by ID | Admin / Allowed |
| `/purge` | Delete messages (with optional user filter) | Admin / Allowed |
| `/say` | Send a message as the bot (channel + reply options) | Admin / Allowed |
| `/warn` | Warn a member (also DMs them) | Admin / Allowed |
| `/warnclear` | Clear all warnings for a user | Admin / Allowed |
| `/checkwarn` | View warnings for a user | Admin / Allowed |
| `/dm` | Send a DM to a user from the bot | Admin / Allowed |
| `/banlist` | Show this server's ban list | Admin / Allowed |
| `/allowuser add` | Grant a user permission to use a command | Admin / Owner |
| `/allowuser remove` | Revoke a permission from a user | Admin / Owner |
| `/allowuser list` | List all allowed users and their permissions | Admin / Owner |
| `/globalban` | Globally ban a user from all servers | **Owner only** |
| `/unglobalban` | Remove a global ban | **Owner only** |
| `/globalbanlist` | View all globally banned users with reasons | **Owner only** |
| `/serverlist` | List all servers the bot is in | **Owner only** |
| `/setlogchannel setglobal` | Add a channel to the global log list | **Owner only** |
| `/setlogchannel remove` | Remove a channel from the global log list | **Owner only** |
| `/setlogchannel list` | View all configured global log channels | **Owner only** |

---

## Global Log Channels

The bot supports **multiple** global log channels across different servers.

- `/setlogchannel setglobal #channel` — adds that channel to the log list
- `/setlogchannel remove #channel` — removes it
- `/setlogchannel list` — shows all active log channels

All of the following events are logged to every configured channel:
- Message deletions
- Message edits
- Every slash command used (server, user, channel)

---

## Global Bans

When you `/globalban` a user, the bot immediately bans them from every server it's in.  
If a globally banned user tries to join any server the bot is in, they are auto-banned on arrival.

---

## Deploying to Render

1. Push the `artifacts/discord-bot/` folder to a GitHub repo
2. Create a **Web Service** on [render.com](https://render.com)
3. Set **Build Command**: `npm install`
4. Set **Start Command**: `npm start`
5. Add environment variables in the Render dashboard
6. Run `npm run deploy` locally once to register slash commands

> Keep the service alive on Render with an always-on plan, or use a free uptime monitor (e.g. UptimeRobot) to ping it.

---

## File Structure

```
discord-bot/
├── src/
│   ├── index.js                  # Bot entry point
│   ├── deploy-commands.js        # Register slash commands
│   ├── commands/moderation/      # All slash commands
│   ├── events/                   # Discord event handlers
│   ├── models/                   # MongoDB schemas
│   └── utils/                    # Logger + permissions helpers
├── .env.example
├── .gitignore
└── package.json
```
