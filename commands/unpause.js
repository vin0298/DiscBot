module.exports = {
	name: 'unpause',
    description: 'Command to unpause the currently paused music and continue playing it',
	async execute(message) {
        if (!message.member.voiceChannel) {
            return message.channel.send(`You need to be in a voice channel to use this command`);
        }

        if (message.guild.voiceConnection) {
            // Get the queue for the current server
            var curServer = servers[message.guild.id];
            if (!curServer.dispatcher) {
                return message.channel.send('No music currently in play');
            } else {
                if (!curServer.dispatcher.paused) {
                    return message.channel.send('Music is not paused');
                } else {
                    await curServer.dispatcher.resume();
                    return message.channel.send('Music is unpaused');
                }
            }
        } else {
            return message.channel.send('Bot not in a voice channel - nothing to unpause');
        }
	},
};
