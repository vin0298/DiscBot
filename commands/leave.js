module.exports = {
	name: 'leave',
    description: 'Command to leave a voice channel',
    usage: `\`leave\``,
	execute(message) {
        // Check if user already join the voice channel
        if (message.guild.voiceConnection) {
            // Empty the queue
            if (servers.get(message.guild.id).dispatcher) {
                servers.get(message.guild.id).dispatcher.destroy();
            }
            songQueueGroups.delete(message.guild.id);
            message.member.voiceChannel.leave();
        } else {
            return message.channel.send("You need to be in a voice channel to be able to use this command");
        }
	},
};
