const { MessageEmbed } = require('discord.js');
const { readdirSync } = require('fs');
const { words } = require('capitalize');
module.exports = {
    name: 'help',
    aliases: ['h'],
    category: 'info',
    description: 'Show help',
    usage: "<PREFIX>help",
    run: async (client, message, args, serverData) => {
        const serverPrefix = serverData.prefix;
        const embed = new MessageEmbed()
            .setColor('#00FFFF')
            .setAuthor('Help command', message.guild.iconURL())
            .setThumbnail(client.user.displayAvatarURL());
        if (!args[0]) {
            const categories = readdirSync('./commands/');
            let commandSize = 0;
            categories.forEach(category => {
                const dir = client.commands.filter(c => c.category === category);
                commandSize += parseInt(dir.size);
                const capitalize = words(category);
                try {
                    embed.addField(`❯ ${capitalize} [${dir.size} commands]:`, dir.map(c => `\`${c.name}\``).join(' '));
                }
                catch(e) {
                    console.error(e);
                }
            });
            embed.setDescription(`Command list for **${message.guild.me.displayName}**\nPrefix: ${serverPrefix}`)
                .setFooter(`Use ${serverPrefix}help {comamnd name} to show details.`);
            return message.channel.send(embed);
        } else return getCMD(client, message, args[0], serverData);
    },
};

function getCMD(client, message, input, serverData) {
    const { prefix } = serverData;
    const embed = new MessageEmbed();
    const cmd = client.commands.get(input.toLowerCase()) || client.commands.get(client.aliases.get(input.toLowerCase()));

    let info = `Not found command named: **${input.toLowerCase()}**`;

    if (!cmd) return message.channel.send(embed.setColor("RED").setDescription(info));

    if (cmd.name) info = `**Command name**: \`${prefix}${cmd.name}\``;
    if (cmd.aliases) info += `\n**Aliases**: ${cmd.aliases.map(a => `\`${prefix}${a}\``).join(", ")}`;
    if (cmd.description) info += `\n**Description**: ${cmd.description}`;
    if (cmd.usage) {
        info += `\n**Usage**: \`${cmd.usage}\``;
        embed.setFooter(`Syntax: <> = required, [] = optional`);
    }
    if (cmd.note) info += `\n**Note**: ${cmd.note}`;
    if (cmd.example) info += `\n**Example**: \`${cmd.example}\``;

    return message.channel.send(embed.setColor("GREEN").setDescription(info.replace(/<PREFIX>/g, prefix)));
}