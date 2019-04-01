// import discord library
const Discord = require('discord.js');
// javascript's filesystem
const fs = require('fs');
// Import the constants(private)
const config = require('./config.json');

// creates the bot client
const bot = new Discord.Client();
// Creates collection (or map) to hold the bot's commands
bot.commands = new Discord.Collection();

// Extract the command files and put it into an array
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Add the commands to the Collection or map
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);

    bot.commands.set(command.name, command);
}

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

    message.channel.send(`Command name: ${command}\nArguments: ${args}`);

    // Command not recognised
    if(!bot.commands.has(command)) {
        message.channel.send("Command not recognised");
        return;
    }    

    try {
        bot.commands.get(command).execute(message, args);
    } catch(error) {
        console.error(error);
        message.channel.send("Command fails to be executed");
    }
});




bot.login(config.token);
