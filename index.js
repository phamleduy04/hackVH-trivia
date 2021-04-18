const { Client, Collection } = require('discord.js');
require('dotenv').config();
const client = new Client();

client.commands = new Collection();
client.aliases = new Collection();
client.categories = new Collection();
client.trivia = {};
client.questionStatus = new Map();
client.session = {};

['command', 'event'].forEach(handler => {
    require(`./handlers/${handler}`)(client);
});

client.login(process.env.TOKEN);