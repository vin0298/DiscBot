// import discord library
const Discord = require('discord.js');
// javascript's filesystem
const fs = require('fs');
// Import the constants(private)
const config = require('./config.json');

// creates the bot client
const bot = new Discord.Client();
// Creates collection (or map) to hold the bot's commands
bot.commands = new Discord.Client();

bot.once('ready', () => {
	console.log('Bot is Ready and Online!');
});

// simple bot command
bot.on('message', (message) => {
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    // take the prefix and split it
    const args = message.content.slice(config.prefix.length).split(/ +/);
    // take the first element and split the rest into the args array
    const command = args.shift().toLowerCase();

    // testing the contents being read
    message.channel.send(`Command name: ${command}\nArguments: ${args}`);

    // if (args.length == 0) {
    //     return message.channel.send(`Hey ${message.author}!, you didn't type any arguments`);
    // }

    switch(command) {
        case `test`:
            message.channel.send("command sent is test");
            break;
        
        case `stop`:
            message.channel.send("command sent is stop");
            break;
        
        default:
            message.channel.send("Command not recognised");
            break;
    }
});




bot.login(config.token);
