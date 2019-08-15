const {prefix} = require('../config/config.js');

module.exports = {
	name: 'help',
    description: 'Provide information regarding the commands available',
    usage: '[command name]',
    cooldown: 5,
	execute(message, args) {
        const helpMessageToSend = [];
        const {commands} = message.client;

        let serverPrefix = prefix;
        if (prefixForServers[message.guild.id]) {
            serverPrefix = prefixForServers[message.guild.id];
        }

        if (!args.length) {
            helpMessageToSend.push('```');
            helpMessageToSend.push('List of all available commands:\n');
            helpMessageToSend.push(commands.map(command => command.name).join(', '));
            helpMessageToSend.push(`\nUse \`${serverPrefix}help [command name]\` to get info on a specific command`);
            helpMessageToSend.push('```');

            // split: true - split to two messages if it's too long
            return message.author.send(helpMessageToSend, { split: true })
	            .then(() => {
		            if (message.channel.type === 'dm') return;
		            message.reply('Sent you a DM with all my commands!');
	            })
	            .catch(error => {
		            console.error(`Could not send help DM to ${message.author.tag}.\n`, error);
		            message.reply('it seems like I can\'t DM you! Do you have DMs disabled?');
	            });
        } else {
            const commandName = args[0].toLowerCase();
            const command = commands.get(commandName);

            if (!command) {
	            return message.reply(`The command requested is not a valid command! Use \` ${serverPrefix}help \` to see all available commands`);
            }

            helpMessageToSend.push('```');
            helpMessageToSend.push(`Command Name: ${command.name}`);

            if (command.description) {
                helpMessageToSend.push(`Description: ${command.description}`);
            }
            
            if (command.usage) {
                helpMessageToSend.push(`Usage: ${serverPrefix}${command.name} ${command.usage}`);
            }

            helpMessageToSend.push('Cooldown: ${command.cooldown || 3} second(s)');
            helpMessageToSend.push('```');

            message.channel.send(helpMessageToSend, { split: true });
        }
	},
};
