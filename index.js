// import discord library
const Discord = require('discord.js');
// creates the client
const bot = new Discord.Client();
// 66156848 - permission

bot.once('ready', () => {
	console.log('Ready!');
});

// simple bot command
bot.on('message', (message) => {
    if (message.content == 'test') {
        // will send with @
        message.reply('ok');
        // send message only without @
        message.channel.sendMessage('ok no @');
    }
});

bot.login('NTYxNzA5MjM2OTI1NzU5NTA5.XKALJQ.jIP5zCSIMczpiwObN2AVApCduBk');
