const categories = require('../../assets/category.json');
const { MessageEmbed } = require('discord.js');
module.exports = {
    name: 'categories',
    category: 'trivia',
    aliases: ['cate', 'category'],
    description: 'Show category list',
    run: async (client, message, args) => {
        const embed = new MessageEmbed()
            .setTitle('You will need the category ID for `start` command!')
            .setColor('RANDOM');
        categories.forEach(category => {
            embed.addField(category.name, category.id, true);
        });
        message.channel.send(embed);
    },
};