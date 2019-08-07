module.exports = {
	name: 'skip',
    description: 'Command to skip and start playing the next music',
	async execute(message) {
        if (!message.member.voiceChannel) {
            return message.channel.send(`You need to be in a voice channel to use this command`);
        }

        if (message.guild.voiceConnection) {
            // Get the queue for the current server
            var curServer = servers.get(message.guild.id);
            var musicQueue = songQueueGroups[message.guild.id];
            
            if (curServer.dispatcher) {
                let musicTitleSkipped = musicQueue.queue[0].title;
                if (curServer.dispatcher.paused) {
                    curServer.dispatcher.resume();
                }
                curServer.dispatcher.end();
                return message.channel.send(`Skipping: **${musicTitleSkipped}**`)
            } 

            if (!musicQueue.queue) {
                return message.channel.send('No music to skip. Music queue is empty');
            }
        } else {
            return message.channel.send('Bot not in a voice channel - nothing to skip');
        }
	},
};
