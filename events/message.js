const db = require('quick.db');
const triviaDict = require('../assets/triviaDict.json');
module.exports = async (client, message) => {
    if (message.author.bot || !message.guild) return;
    const guildID = message.guild.id;
    let serverData = await db.get(guildID);
    const authorID = message.author.id;
    if (!serverData) serverData = await db.set(guildID, { prefix: 't', triviaChannel: null, totalQuestion: null });
    const { triviaChannel } = serverData;
    if (message.channel.id == triviaChannel && client.questionStatus.has(guildID) && message.content.length == 1 && triviaDict[message.content.toLowerCase()]) {
        client.trivia[guildID][authorID] = {
            answer: triviaDict[message.content.toLowerCase()],
            time: Date.now(),
        };
        if (!client.session[guildID][authorID]) client.session[guildID][authorID] = { totalPoints: 0, rounds: {}, ID: authorID };
    };
    // make prefix tagable
    let prefix;
    const prefixList = [serverData.prefix, `<@${client.user.id}>`, `<@!${client.user.id}>`];
    for (const thisPrefix of prefixList) if (message.content.toLowerCase().startsWith(thisPrefix)) prefix = thisPrefix;
    if (!prefix || !message.content.startsWith(prefix)) return;
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const cmd = args.shift().toLowerCase();
    if (cmd.length === 0) return;
    let command = client.commands.get(cmd);
    if (!command) command = client.commands.get(client.aliases.get(cmd));
    if (command) command.run(client, message, args, serverData);
};