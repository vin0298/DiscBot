module.exports = {
	name: 'skip',
    description: 'Command to skip and start playing the next music',
	execute(message) {
        if (!message.member.voiceChannel) {
            return message.channel.send(`You need to be in a voice channel to use this command`);
        }

        if (message.guild.voiceConnection) {
            // Get the queue for the current server
            var curServer = servers[message.guild.id];
            var musicQueueServer = musicQueueInfo[message.guild.id];
            
            if (curServer.dispatcher) {
                curServer.dispatcher.destroy();
                return message.channel.send(`Skipping: **${musicQueueServer.queue[0].title}**`)
            } 

            if (!musicQueueServer.queue) {
                return message.channel.send('No music to skip. Music queue is empty');
            }
        } else {
            return message.channel.send('Bot not in a voice channel - nothing to skip');
        }
	},
};
