module.exports = {
	name: 'pause',
    description: 'Command to pause the current music',
	execute(message) {
        if (!message.member.voiceChannel) {
            return message.channel.send(`You need to be in a voice channel to use this command`);
        }

        if (message.guild.voiceConnection) {
            // Get the queue for the current server
            var curServer = servers[message.guild.id];
            if (!curServer.dispatcher) {
                return message.channel.send('No music currently in play');
            } else {
                if (curServer.dispatcher.paused) {
                    return message.channel.send('Music is already paused');
                } else {
                    curServer.dispatcher.pause();
                    return message.channel.send('Music is being paused');
                }
            }
        } else {
            return message.channel.send('Bot not in a voice channel - nothing to skip');
        }
	},
};
