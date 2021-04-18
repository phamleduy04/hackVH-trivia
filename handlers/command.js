const ascii = require('ascii-table');
const { readdirSync } = require('fs');

module.exports = (client) => {
    let count = 0;
    const table = new ascii('Commands list');
    readdirSync('./commands/').forEach(dir => {
        const commands = readdirSync(`./commands/${dir}/`).filter(file => file.endsWith('.js'));
        for (const file of commands) {
            const fileName = `../commands/${dir}/${file}`;
            delete require.cache[require.resolve(fileName)];
            const pull = require(fileName);
            if (pull.name) {
                count++;
                client.commands.set(pull.name, pull);
                table.addRow(file, '✅');
            } else {
                table.addRow(file, 'Invalid data');
                continue;
            }
            if (pull.aliases && Array.isArray(pull.aliases)) pull.aliases.forEach(alias => client.aliases.set(alias, pull.name));
        }
    });

    console.log(table.toString());
    console.log(`${count} commands is ready!`);
};