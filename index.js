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

// Variable for cooldown commands
const cooldowns = new Discord.Collection();

// Extract the command files and put it into an array
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

global.servers = new Map();
global.prefixForServers = new Map();

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
    var serverPrefix = config.prefix;
    if (prefixForServers[message.guild.id]) {
        serverPrefix = prefixForServers[message.guild.id];
    }

    if (!message.content.startsWith(serverPrefix) || message.author.bot) return;

    // take the prefix and split it
    const args = message.content.slice(serverPrefix.length).split(/ +/);
    // take the first element and split the rest into the args array
    const commandName = args.shift().toLowerCase();

    // message.channel.send(`Command name: ${commandName}\nArguments: ${args}`);

    // Command not recognised
    if(!bot.commands.has(commandName)) {
        message.channel.send("Command not recognised");
        return;
    }    

    const commandToExec = bot.commands.get(commandName);

    if (commandToExec.args && !args.length) {
        let wrongArgsReply = "No arguments provided. "
        if (commandToExec.usage) {
            wrongArgsReply += `\n The proper usage would be: \ "${serverPrefix}${commandToExec.name} ${commandToExec.usage} \"`;
        }

        return message.channel.send(wrongArgsReply);
    }

    // Cooldown command execution
    if (!cooldowns.has(commandToExec.name)) {
        cooldowns.set(commandToExec.name, new Discord.Collection());
    }

    const timeNow = Date.now();
    const commandTimestamps = cooldowns.get(commandToExec.name);
    const cooldownTime = (commandToExec.cooldown || 3) * 1000;

    if (commandTimestamps.has(message.author.id)) {
        const cooldownExpirationTime = commandTimestamps.get(message.author.id) + cooldownTime;

        if (timeNow < cooldownExpirationTime) {
            const timeLeft = (cooldownExpirationTime - timeNow) / 1000;
            return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${commandToExec.name}\` command.`);
        }
    }
    
    // Manage the timestamps - delete the author id if past the cooldown time
    commandTimestamps.set(message.author.id, timeNow);
    setTimeout(() => commandTimestamps.delete(message.author.id), cooldownTime);

    // Executes the command and returns and error message if it fails
    try {
        commandToExec.execute(message, args);
    } catch(error) {
        console.error(error);
        message.channel.send('```COMMAND FAILS TO BE EXECUTED```');
    }
});

bot.on("error", error => {
    console.error(error);
    message.channel.send('```Bot encountered an error.```');
});

bot.login(config.token);
