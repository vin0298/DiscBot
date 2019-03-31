// import discord library
const Discord = require('discord.js');
// creates the client
const bot = new Discord.Client();
// 66156848 - permission

// Import the constants(private)
const config = require('./config.json');

bot.once('ready', () => {
	console.log('Ready!');
});

// simple bot command
bot.on('message', (message) => {
    if (message.content == 'test') {
        // will send with @
        message.reply('ok');
        // send message only without @
        message.channel.send('ok no @');
    }
});

bot.login(config.token);
