const db = require('quick.db');
const performanceDB = new db.table('performance');
const _ = require('lodash');
const { fancyNumber } = require('../../utils');
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'leaderboard',
    category: 'info',
    aliases: ['top', 'lb'],
    run: async (client, message, args) => {
        const performance = fixAndMatch(performanceDB.all());
        if (!args[0]) args[0] = 'default';
        switch(args[0].toLowerCase()) {
            case 'server':
            case 'guild': {
                const memberManager = await message.guild.members.fetch();
                const member = memberManager.filter(m => !m.user.bot).map(m => m.id);
                const embed = new MessageEmbed()
                    .setTitle(`Leaderboard for ${message.guild.name}`);
                let num = 0;
                for (const i in performance) {
                    const id = performance[i].ID;
                    if (!member.includes(id)) continue;
                    num++;
                    const user = await client.users.fetch(id);
                    embed.addField(`\`${parseInt(i) + 1}.\` ${user ? user.tag : 'Dummy#0000'}`, `${fancyNumber(performance[i].data)} pts`);
                    if (num > 9) break;
                }
                message.channel.send(embed);
                break;
            };
            default: {
                const userRank = performance.findIndex((item) => item.ID == message.author.id) + 1 || 'Not defined';
                const top10 = _.take(performance, 11);
                const embed = new MessageEmbed()
                    .setTitle('World Leaderboard 🌐')
                    .setAuthor(`${message.author.username}'s rank: #${userRank}`);
                for (const i in top10) {
                    const user = await client.users.fetch(top10[i].ID);
                    embed.addField(`\`${parseInt(i) + 1}.\` ${user ? user.tag : 'Dummy#0000'}`, `${fancyNumber(top10[i].data)} pts`);
                }
                message.channel.send(embed);
                break;
            }
        }
    },
};

function fixAndMatch(arr) {
    arr.forEach(el => {
        try {
            el.data = _.sum(JSON.parse(el.data));
        }
        catch(e) {
            el.data = _.sum(el.data);
        }
    });
    return arr.sort((a, b) => b.data - a.data);
}