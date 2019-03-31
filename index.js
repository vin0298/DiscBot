// import discord library
const Discord = require('discord.js');
// creates the client
const bot = new Discord.Client();
// 66156848 - permission

// simple bot command
client.on('message', (message) => {
    if (message.content == 'test') {
        message.reply('ok');
    }
});

bot.login('NTYxNzA5MjM2OTI1NzU5NTA5.XKALJQ.jIP5zCSIMczpiwObN2AVApCduBk');
