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
    if (!message.content.startsWith(config.prefix) || message.author.bot) return;

    // bug not split correctly
    const args = message.content.slice(config.prefix.length).split(' ');
    const command = args.shift().toLowerCase();
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
