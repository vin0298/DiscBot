module.exports = {
	name: 'join',
    description: 'Command to join a voice channel',
    usage: `No arguments / URL`,
	execute(message) {
        // Check if user already join the voice channel
        if (!message.member.voiceChannel) {
            return message.channel.send(`You need to be in a voice channel`);
        }
        // Check link
        const voiceChannel = message.member.voiceChannel;
        voiceChannel.join()
            .then(connection => {
                if (!musicQueueInfo[message.guild.id]) {
                    musicQueueInfo[message.guild.id] = {queue: []};
                }
        
                if (!servers[message.guild.id]) {
                    // Check if there exist a queue
                    servers[message.guild.id] = {queue: []};
                }
                message.reply("Successfully joined voice channel");
            })
	},
};
