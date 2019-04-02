const {prefix} = require('../config.json');

module.exports = {
	name: 'stop',
    description: 'Command to stop playing music',
    usage: `\`${prefix}stop\``,
	execute(message) {
        // Check if user already join the voice channel
        // if (!message.member.voiceChannel) {
        //     return message.channel.send(`You need to be in a voice channel`);
        // }
        // Check link
        message.member.voiceChannel.leave();
	},
};
