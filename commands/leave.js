module.exports = {
	name: 'leave',
    description: 'Command to leave a voice channel',
    usage: `\`leave\``,
	execute(message) {
        // Check if user already join the voice channel
        if (message.guild.voiceConnection) {
            message.guild.voiceConnection.disconnect();
            return message.reply("Successfully left voice channel");
        }
        // Check link
        message.reply("Bot is not in a voice channel");
	},
};
