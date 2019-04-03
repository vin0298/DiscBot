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
            
            if (curServer.dispatcher) {
               return curServer.dispatcher.destroy();
            }
        
        } else {
            return message.channel.send('Bot not in a voice channel - nothing to skip');
        }
	},
};
