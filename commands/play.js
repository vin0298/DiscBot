const ytdl = require("ytdl-core");

module.exports = {
	name: 'play',
    description: 'Command to play music',
    usage: `\`music-url\``,
    args: true,
	execute(message, args) {
        // Check if user already join the voice channel
        if (!message.member.voiceChannel) {
            return message.channel.send(`You need to be in a voice channel`);
        }
        // Check link
        const voiceChannel = message.member.voiceChannel;
        voiceChannel.join();
	},
};
