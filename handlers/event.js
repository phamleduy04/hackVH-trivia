const ascii = require('ascii-table');
const { readdirSync } = require('fs');
const table = new ascii('Events list');
module.exports = (client) => {
    let count = 0;
    const files = readdirSync('./events/');
    for (const file of files) {
        if (!file.endsWith('.js')) return;
        const eventName = file.substring(0, file.indexOf('.js'));
        try {
            const fileName = `../events/${file}`;
            delete require.cache[require.resolve(fileName)];
            const eventModule = require(fileName);
            client.on(eventName, eventModule.bind(null, client));
            count++;
            table.addRow(eventName, '✅');
        }
        catch(e) {
            console.error(e);
            table.addRow(eventName, '❌');
            continue;
        }
    }
    console.log(table.toString());
    console.log(`${count} events is ready!`);
};
