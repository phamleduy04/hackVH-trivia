const { MessageEmbed } = require('discord.js');
const db = require('quick.db');
const performanceDB = new db.table('performance');
const _ = require('lodash');
const { calcAvg } = require('../../utils');
module.exports = {
    name: 'profile',
    category: 'info',
    aliases: ['whois', 'user', 'info'],
    run: async (client, message, args) => {
        const member = message.member;
        const userPerformance = await performanceDB.get(message.author.id);
        if (!userPerformance || userPerformance.length == 0) return message.channel.send('No data found!');
        const lastTenTimes = _.takeRight(userPerformance, 10);
        const avgJson = {
            lastTenAvg: calcAvg(lastTenTimes),
            userPerformanceAvg: calcAvg(userPerformance),
        };
        const embed = new MessageEmbed()
            .setFooter(member.displayName, member.user.displayAvatarURL())
            .setThumbnail(member.user.displayAvatarURL())
            .setColor(member.displayHexColor === '#000000' ? 'RANDOM' : member.displayHexColor)
            .addField('Points: ', [
                `**- Average points:** ${avgJson['userPerformanceAvg']}`,
                `**- Average points (last 10):** ${avgJson['lastTenAvg']}`,
            ]);
        message.channel.send(embed);
    },
};