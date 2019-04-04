const {prefix} = require('../config.json');

module.exports = {
	name: 'show-prefix',
    description: 'Command to show the current prefix in use for executing commands. Default is: !!',

	execute(message) {
        let prefixToShow = prefix;
        if (prefixForServers[message.guild.id]) {
            prefixToShow = prefixForServers[message.guild.id];
        }

        return message.channel.reply(`Prefix set for this channel is ${prefixToShow}`);
	},
};
