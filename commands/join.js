let serverClass = require("../classes/Server.js");
let Server = serverClass.Server;

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
                if (!servers.has(message.guild.id)) {
                    servers.set(message.guild.id, new Server(message.channel, message.member.voiceChannel));
                    servers.get(message.guild.id).connection = connectio
                    n;
                }
                message.reply("Successfully joined voice channel");
            })
	},
};
