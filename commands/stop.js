const {prefix} = require('../config.json');

module.exports = {
	name: 'stop',
    description: 'Command to stop playing music',
    usage: `\`${prefix}stop\``,
	execute(message) {
        if (message.guild.voiceConnection) {
            // Empty the queue
            let em = [];
            servers[message.guild.id] = em;
        }

        message.member.voiceChannel.leave();
	},
};
