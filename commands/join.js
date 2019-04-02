module.exports = {
	name: 'join',
    description: 'Command to join a voice channel',
    usage: `\`join\``,
	execute(message, args) {
        // Check if user already join the voice channel
        if (!message.member.voiceChannel) {
            return message.channel.send(`You need to be in a voice channel`);
        }
        // Check link
        const voiceChannel = message.member.voiceChannel;
        voiceChannel.join()
            .then(connection => {
                message.reply("Successfully joined voice channel");
            })
	},
};
