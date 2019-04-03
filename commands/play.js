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

        if (args.length > 1) {
            return message.reply(`Please just supply one argument or URL`);
        }

        // Parse the link
        url = args[0];
        // message.channel.send(url); // URL Parsing test

        // Check if link is valid
        let validation = ytdl.validateURL(url);
        if (!validation) {
            return message.reply(`Invalid URL. Please retry with a valid URL`);
        }

        // IMPLEMENT PLAYLIST
        const voiceChannel = message.member.voiceChannel;
        voiceChannel.join()
            .then(connection => {
                message.channel.send("Successfully joined voice channel");

                const musicStream = ytdl(url, {filter: 'audioonly'});
                const dispatcher = connection.playStream(musicStream);
                dispatcher.on("end", end => {
                    message.channel.send('Music ended, left voice channel');
                    setTimeout(function(){
                        voiceChannel.leave()
                    }, 1000)
                })
            })
	},
};
