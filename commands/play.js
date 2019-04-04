const ytdl = require("ytdl-core");

// ADD A RESPONSE WHEN QUEUEING MUSIC

function PlayMusic(connection, message) {
    var server = servers[message.guild.id];
    const musicStream = ytdl(server.queue[0], {highWaterMark: 25});
    server.dispatcher = connection.playStream(musicStream);
    // Move the queue after playing the song
    console.log("current url: " + server.queue[0]);
    server.queue.shift();
    console.log("Next song: " + server.queue[0]);
    server.dispatcher.on("end", function() {
        if (server.queue[0]) {
            console.log("There's is still some music left");
            PlayMusic(connection, message);
        } else {
            console.log("Ending");
            connection.disconnect();
            message.channel.send('Music ended, left voice channel');
        }
    })
    .on("error", error => {
        console.error(error);
        message.channel.send("Error Occurred during playback. Try again later.");
    });
}

module.exports = {
	name: 'play',
    description: 'Command to play music. If play is used music is playing then the music being requested will be queued',
    usage: `"music-url"`,
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

        ytdl.getInfo(url, function(err, info) {
            if (err) {
              return message.channel.send(`Invalid URL`);
            }
            
            message.channel.send(`Playing: **${info.title}**`);
        })
    

        if (!servers[message.guild.id]) {
            // Check if there exist a queue
            servers[message.guild.id] = {queue: []};
        }

        console.log("New Song Detected");
        var curServer = servers[message.guild.id];
        curServer.queue.push(url);

        // Check if already in a channel
        if (!message.guild.voiceConnection) {
             message.member.voiceChannel.join()
            .then(connection => {
                message.channel.send("Successfully joined voice channel");
                PlayMusic(connection, message);
            })
        }
	},
};
