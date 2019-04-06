module.exports = {
	name: 'list',
    description: 'Command to list the queued music in the server',
	execute(message) {
        if (!message.member.voiceChannel) {
            return message.channel.send(`You need to be in a voice channel to use this command`);
        }

        if (message.guild.voiceConnection) {
            // Get the queue for the current server
            var musicQueueServer = musicQueueInfo[message.guild.id];
            
            if (!musicQueueServer.queue) {
                return message.channel.send('Music queue is empty');
            }

            let musicList = "```Music In Queue:\n";
            for (i = 0; i < musicQueueServer.queue.length; i++) {
                musicList += `${i + 1}.${musicQueueServer.queue[i].title} ` + "\n"; 
            }
            musicList += "```";
            return message.channel.send(musicList);
        } else {
            return message.channel.send('Bot not in a voice channel - nothing to skip');
        }
	},
};
