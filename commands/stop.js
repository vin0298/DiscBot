const {prefix} = require('../config.json');

module.exports = {
	name: 'stop',
    description: 'Use this in a voice channel as a command to stop playing music',

	execute(message) {
        if (message.guild.voiceConnection) {
            // Empty the queue
            servers[message.guild.id] = {queue: []};
            musicQueueInfo[message.guild.id] = {queue: []};

            if (servers[message.guild.id].dispatcher) {
                servers[message.guild.id].dispatcher.destroy();
            }
            
            servers.delete(message.guild.id);
            musicQueueInfo.delete(message.guild.id);
            message.member.voiceChannel.leave();
        } else {
            return message.channel.send("You need to be in a voice channel to be able to use this command");
        }
	},
};
