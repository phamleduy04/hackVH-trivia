const db = require('quick.db');
const performanceDB = new db.table('performance');
const _ = require('lodash');
const { writeFileSync } = require('fs');
const shell = require('shelljs');
const { join } = require('path');
const { calcAvg } = require('../../utils');
module.exports = {
    name: 'performance',
    category: 'info',
    aliases: ['stat'],
    run: async (client, message, args) => {
        const userPerformance = await performanceDB.get(message.author.id);
        if (!userPerformance || userPerformance.length < 10) return message.channel.send('No data found, please play at least 10 times to get stat!');
        const lastTenTimes = _.takeRight(userPerformance, 10);
        const json = {
            lastTenTimes,
            userPerformance,
        };
        await writeFileSync(join(__dirname, '..', '..', 'graph', 'data', `${message.author.id}.json`), JSON.stringify(json));
        await shell.cd(join(__dirname, '..', '..', 'graph'));
        await shell.exec(`python3 graph.py -i ${message.author.id}`);
        const avgJson = {
            lastTenAvg: calcAvg(lastTenTimes),
            userPerformanceAvg: calcAvg(userPerformance),
        };
        message.reply(`Your avarange: \nLast 10 times: ${avgJson['lastTenAvg']}pts\nAll times: ${avgJson['userPerformanceAvg']}pts`, {
            files: [join(__dirname, '..', '..', 'graph', 'images', `${message.author.id}.jpg`)],
        });
    },
};
