const { MessageEmbed } = require('discord.js');
const minimist = require('minimist');
const categories = require('../../assets/category.json');
const categoriesID = categories.map(el => el.id);
const difficultyList = ['easy', 'medium', 'hard'];
const { shuffleArray, sleep, getPoints } = require('../../utils');
const db = require('quick.db');
const performaceDB = new db.table('performance');
const typeDict = {
    'mc': 'multiple',
    'tf': 'boolean',
};
const typeDictUX = {
    'mc': 'Miltiple Choice',
    'tf': 'True/False',
};
const capitalize = require('capitalize');
module.exports = {
    name: 'starttrivia',
    category: 'trivia',
    aliases: ['start'],
    usage: '<PREFIX>start [-q] [-c] [-d] [-t]',
    note: '-c: categoryID (use <PREFIX>cate for list of categoryID)\n-q: number of question\n-d difficulty (easy, medium or hard)\n-t type of question (mc: multiply choise or tf: true/false)',
    run: async (client, message, args) => {
        const check = db.get(`${message.guild.id}.triviaChannel`);
        if (check) return message.channel.send('The game has started!');
        const baseURL = new URL('https://opentdb.com/api.php');
        /**
         * @param -q: number of questions (default 15)
         * @param -c: categoryID (ref to category.json)
         * @param -d: difficulty (easy, medium, hard)
         * @param -t: type (mc: multiple choice or tf: true/false)
         */
        const { q, c, d, t } = minimist(args);
        const params = baseURL.searchParams;
        const session = { time: '30 seconds' };
        if (!q || isNaN(q)) {
            params.append('amount', 15);
            session['amount'] = 15;
        }
        else {
            params.append('amount', q);
            session['amount'] = q;
        }

        if (c && categoriesID.includes(c)) {
            params.append('category', c);
            session['category'] = categories.filter(el => el.id == c)[0].name;
        } else session['category'] = 'Any Category';

        if (d && difficultyList.includes(d.toLowerCase())) {
            params.append('difficulty', d.toLowerCase());
            session['difficulty'] = capitalize.words(d);
        } else session['difficulty'] = 'Any Difficulty';

        if (t && typeDict[t.toLowerCase()]) {
            params.append('type', typeDict[t.toLowerCase()]);
            session['type'] = typeDictUX[t.toLowerCase()];
        }

        const embed = new MessageEmbed()
            .setTitle('The game will start in a few seconds!');
        for (const prop in session) embed.addField(capitalize.words(prop), session[prop], true);
        await message.channel.send(embed);
        await sleep(3000);
        await db.set(`${message.guild.id}.triviaChannel`, message.channel.id);
        await db.set(`${message.guild.id}.totalQuestion`, session['amount']);
        client.session[message.guild.id] = {};
        await process(client, message, baseURL.href);
        await db.delete(`${message.guild.id}.triviaChannel`);
    },
};
const axios = require('axios');
const { decode } = require('he');
async function process(client, message, url) {
    try {
        const res = await axios.get(url);
        if (!res.data.results || res.data.results.length == 0) throw new Error('Return value is invalid!');
        const questionList = res.data.results;
        for (const num in questionList) {
            client.trivia[message.guild.id] = {};
            const question = questionList[num];
            console.log(question);
            const answers = shuffleArray([question.correct_answer, ...question.incorrect_answers]);
            const correctIndex = answers.indexOf(question.correct_answer) + 1;
            const embed = new MessageEmbed()
                .setTitle(decode(question.question))
                .setAuthor(`Category: ${question.category}`)
                .setFooter(`Difficulty: ${capitalize.words(question.difficulty)} | Chat to answer!`)
                .setDescription(answers.map((el, index) => `${index + 1}. ${decode(el)}`).join('\n'));
            const msg = await message.channel.send(embed);
            client.questionStatus.set(message.guild.id, Date.now());
            await sleep(30000);
            await editEmbed(client, message, msg, answers, correctIndex, embed);
            await stopQuestion(client, message, correctIndex, Date.now(), num, question);
        }
        await sleep(1000);
        let sorted = Object.values(client.session[message.guild.id]).sort(sortSession).map((el, index) => `#${index + 1}. ${message.guild.members.cache.get(el.ID)}`);
        if (sorted.length > 10) sorted = sorted.slice(0, 10);
        const embed = new MessageEmbed()
            .setTitle('The game has ended!')
            .setDescription(sorted);
        message.channel.send(embed);
        Object.values(client.session[message.guild.id]).forEach(el => {
            if (!performaceDB.has(el.ID)) performaceDB.set(el.ID, [el.totalPoints]);
            else performaceDB.push(el.ID, el.totalPoints);
        });
    }
    catch(e) {
        console.error(e);
        return message.channel.send('Bot is error. Please try again later!');
    }
};

async function editEmbed(client, message, msg, answers, correctIndex, embed) {
    correctIndex--;
    const des = answers.map((el, index) => {
        if (index === correctIndex) return `✅ ${decode(el)}`;
        return `❌ ${decode(el)}`;
    }).join('\n');
    embed.description = des;
    await message.channel.send(embed);
};

async function stopQuestion(client, message, correctIndex, endedTime, num, question) {
    num++;
    const guildID = message.guild.id;
    const participants = Object.keys(client.trivia[guildID]);
    if (participants.length == 0) return;
    for (const i in participants) {
        const participant = participants[i];
        const pAnswer = client.trivia[guildID][participant];
        const sessionData = client.session[guildID][participant];
        if (pAnswer && pAnswer.answer === correctIndex) {
            const gainedPoints = getPoints(pAnswer.time, endedTime);
            sessionData.totalPoints += gainedPoints;
            sessionData.rounds[num] = { win: true, gainedPoints };
        } else if (pAnswer) sessionData.rounds[num] = { win: false, gainedPoints: 0 };
        else sessionData.rounds[num] = { win: null, gainedPoints: null };
    }
    console.log(client.session[message.guild.id]);
    let sorted = Object.values(client.session[message.guild.id]).sort(sortSession).map((el, index) => `#${index + 1}. ${message.guild.members.cache.get(el.ID)}: ${el.totalPoints} (+${el.rounds[num] ? el.rounds[num].gainedPoints : 0})`);
    if (sorted.length > 10) sorted = sorted.slice(0, 10);
    const embed = new MessageEmbed()
        .setTitle(`Leaderboard`)
        .setDescription(sorted);
    message.channel.send(embed);
};

const sortSession = (a, b) => {
    return b.totalPoints - a.totalPoints;
};