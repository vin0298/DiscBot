const {prefix} = require('../config.json');

module.exports = {
	name: 'stop',
    description: 'Command to stop playing music',

	execute(message) {
        if (message.guild.voiceConnection) {
            // Empty the queue
            let emptyQueue = [];
            if (servers[message.guild.id].dispatcher) {
                servers[message.guild.id].dispatcher.destroy();
            }
            servers[message.guild.id] = emptyQueue;
        }

        message.member.voiceChannel.leave();
	},
};
