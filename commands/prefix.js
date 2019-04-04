const {prefix} = require('../config.json');

module.exports = {
	name: 'prefix',
    description: 'Command to change the current prefix to use for executing commands. Default is: !!',
    usage: '{New Prefix Symbol} || default',
    args: true,

	execute(message, args) {
        var newPrefix = args[0];
        if (!prefixForServers[message.guild.id]) {
            prefixForServers[message.guild.id] = prefix;
        }

        if (newPrefix === prefixForServers[message.guild.id]) {
            return message.channel.reply(`New prefix suggested is the same as old prefix: ${newPrefix}`);
        } else if (newPrefix === 'default') {
            prefixForServers[message.guild.id] = prefix;
            return message.channel.reply(`Prefix is set to default: ${prefix}`);
        } else {
            prefixForServers[message.guild.id] = newPrefix;
            return message.channel.reply(`Prefix set for this channel is set to ${newPrefix}`);
        }
	},
};
