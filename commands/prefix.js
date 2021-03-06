const {prefix} = require('../config/config.js');

module.exports = {
	name: 'prefix',
    description: 'Command to change the current prefix to use for executing commands. Default is: !!',
    usage: '{New Prefix Symbol} || default',
    args: true,

	execute(message, args) {
        var newPrefix = args[0];
        if (!prefixForServers[message.guild.id]) {
            // Set to default prefix
            prefixForServers[message.guild.id] = prefix;
        } 
        
        if (newPrefix === prefixForServers[message.guild.id]) {
            return message.channel.send(`New prefix suggested is the same as old prefix: ${newPrefix}`);
        } else if (newPrefix === 'default') {
            prefixForServers[message.guild.id] = prefix;
            return message.channel.send(`Prefix is set to default: ${prefix}`);
        } else {
            prefixForServers[message.guild.id] = newPrefix;
        }

        return message.channel.send(`Prefix set for this channel is set to ${newPrefix}`);
	},
};
