const { Client, GatewayIntentBits, Collection, REST, Routes } = require("discord.js");
const { Player } = require("discord-player");
const { YoutubeiExtractor } = require("discord-player-youtubei");
const fs = require("fs");
const path = require("path");
const { token, clientId, YT_credentials } = require("./config.json");

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.MessageContent,
    ],
});

module.exports = client;

client.commands = new Collection();
const commands = [];

function loadCommandFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            loadCommandFiles(filePath);
        } else if (file.endsWith(".js")) {
            const command = require(filePath);
            client.commands.set(command.data.name, command);
            commands.push(command.data.toJSON());
        }
    }
}

loadCommandFiles(path.join(__dirname, "commands"));

const rest = new REST().setToken(token);
rest.put(Routes.applicationCommands(clientId), { body: commands });

const player = new Player(client);

player.extractors.register(YoutubeiExtractor, {
    credentials: YT_credentials,
});

player.extractors.loadDefault((ext) => ext !== "YouTubeExtractor");

const eventsPath = path.join(__dirname, "events");

function loadEventFiles(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            loadEventFiles(filePath);
        } else if (file.endsWith(".js")) {
            const event = require(filePath);

            if (event.type === "player") {
                player.events.on(event.name, (...args) => event.execute(...args));
            } else if (event.once) {
                client.once(event.name, (...args) => event.execute(...args));
            } else {
                client.on(event.name, (...args) => event.execute(...args));
            }
        }
    }
}

loadEventFiles(eventsPath);

client.login(token);
