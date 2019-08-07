const {prefix} = require('../config.json');

module.exports = {
	name: 'stop',
    description: 'Use this in a voice channel as a command to stop playing music',

	execute(message) {
        if (message.guild.voiceConnection) {
            // Empty the queue
            songQueueGroups[message.guild.id] = {queue: []};
            var targetServer = servers.get(message.guild.id);

            if (targetServer.timerId) {
                clearTimeout(servers.get(message.guild.id).timerId);
            }

            if (targetServer.dispatcher) {
                targetServer.dispatcher.destroy();
            }

            servers.delete(message.guild.id);
            songQueueGroups.delete(message.guild.id);
            message.member.voiceChannel.leave();
        } else {
            return message.channel.send("You need to be in a voice channel to be able to use this command");
        }
	},
};
