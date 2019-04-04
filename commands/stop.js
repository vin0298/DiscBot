const {prefix} = require('../config.json');

module.exports = {
	name: 'stop',
    description: 'Use this in a voice channel as a command to stop playing music',

	execute(message) {
        if (message.guild.voiceConnection) {
            // Empty the queue
            if (servers[message.guild.id].dispatcher) {
                servers[message.guild.id].dispatcher.destroy();
            }
            servers[message.guild.id] = {queue: []};
            servers.delete(message.guild.id);
            message.member.voiceChannel.leave();
        } else {
            return message.channel.send("You need to be in a voice channel to be able to use this command");
        }
	},
};
