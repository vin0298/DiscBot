const ytdl = require("ytdl-core");
// Import the API Key
const {apiKey} = require('../config.json')
// Import googleapis client
const {google} = require('googleapis');

function PlayMusic(connection, message) {
    var server = servers[message.guild.id];
    var musicList = musicQueueInfo[message.guild.id];
    try {
        const musicStream = ytdl(server.queue[0], {highWaterMark: 1<<25}, {quality: 'highestaudio'}, {filter: 'audio'});
        server.dispatcher = connection.playStream(musicStream);
    } catch (error) {
        console.error(error);
        console.error("Error in playing the url");
        message.channel.send('A problem occured - failed to play the provided URL');
        return;
    }
    // Move the queue after playing the song
    console.log("current url: " + server.queue[0]);
    server.queue.shift();

    console.log("Next song: " + server.queue[0]);
    server.dispatcher.on("end", function() {
        if (server.queue[0]) {
            musicList.queue.shift();
            console.log("There's is still some music left");
            PlayMusic(connection, message);
        } else {
            console.log("Ending");
            musicQueueInfo[message.guild.id] = {queue: []};
            connection.disconnect();
            message.channel.send('Music ended, left voice channel');
        }
    })
    .on("error", error => {
        console.error(error);
        message.channel.send("Error Occurred during playback. Try again later.");
    });
}

// https://www.youtube.com/watch?v={VIDEO ID}
// Need pageToken
// fields: items(contentDetails/videoId,snippet(position,title)),nextPageToken
async function GetPlayListData(playlistID, nextPageToken) {
    console.log("Code entered");
    const headers = {};
    if (nextPageToken === null) {
        const res = await youtube.playlists.list({
            part: 'contentDetails, snippet',
            fields: 'items(contentDetails/videoId,snippet(position,title)),nextPageToken',
            id: 'PLUhc5uW1a2fwanlK2Ql_bVZRsp7Q_-9HH',
            headers: headers,
        });
    } else {
        const res = await youtube.playlists.list({
            part: 'contentDetails, snippet',
            pageToken: nextPageToken,
            fields: 'items(contentDetails/videoId,snippet(position,title)),nextPageToken',
            id: 'PLUhc5uW1a2fwanlK2Ql_bVZRsp7Q_-9HH',
            headers: headers,
        });
    } 

    if (res.Status !== '200') {
        console.error("Error! Status code: " + res.status);
        console.error(res.data);
    }

    console.log("Done");
    console.log('Status code: ' + res.status);
    console.log(res.data);
    console.log("\n try to extract: \n");
    var extractTest = res.data.items;
    console.log(extractTest[0].contentDetails.itemCount);
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

        if (!musicQueueInfo[message.guild.id]) {
            musicQueueInfo[message.guild.id] = {queue: []};
        }

        if (!servers[message.guild.id]) {
            // Check if there exist a queue
            servers[message.guild.id] = {queue: []};
        }

        // Parse the link
        url = args[0];

        // NEED TO REFACTOR THIS
        // use a promise - review async/await/promise
        ytdl.getInfo(url, ['--format=bestaudio'], function(err, info) {
            if (err) {
                // Check if it's a playlist
                    // Later need to extract the playlist ID
                    // sample playlist id :PLUhc5uW1a2fwanlK2Ql_bVZRsp7Q_-9HH

                    // SEND REQUEST PAYLOAD

                    GetPlayListData();
                // Not a playlist so do a query
              message.channel.send(`Invalid URL`);
            } else {
                console.log("New Song Detected");
                // Don't push info but info.title instead
                musicQueueInfo[message.guild.id].queue.push(info.title);
                servers[message.guild.id].queue.push(info.video_url);
                console.log(servers[message.guild.id].queue[0]);
                message.channel.send(info.video_url);
                message.channel.send(`Playing: **${info.title}**`);
            }

            if (!message.guild.voiceConnection) {
                message.member.voiceChannel.join()
               .then(connection => {
                   message.channel.send("Successfully joined voice channel");
                   PlayMusic(connection, message);
               })
           }
        })



	},
};
