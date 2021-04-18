module.exports = {
    name: 'ping',
    category: 'misc',
    aliases: ['p'],
    run: async (client, message, args) => {
        return message.channel.send(`🏓 Pong: \`${client.ws.ping}ms\``);
    },
};