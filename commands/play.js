const ytdl = require("ytdl-core");
// Import the API Key
const {apiKey} = require('../config.json')
// Import googleapis client
const {google} = require('googleapis');
const playlistURL = 'https://www.youtube.com/playlist?list=';
const ytVideoURL = 'https://www.youtube.com/watch?v=';

function PlayMusic(connection, message) {
    var server = servers[message.guild.id];
    var musicList = musicQueueInfo[message.guild.id];
    try {
        // TEMP FIX
        if (server.queue[0] === undefined){
            console.log("Undefined url - don't go");
            console.log(server.queue[0]);
            return;
        }
        console.log("Valid URL detected - Playing music");
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
async function GetPlayListData(youtube, playlistID, guildId, nextPageToken) {
    // console.log("Code entered");
    const headers = {};
    var res = null;
    if (nextPageToken === null) {
        res = await youtube.playlistItems.list({
            part: 'contentDetails, snippet',
            mine: 'false',
            playlistId: playlistID,
            fields: 'items(contentDetails/videoId,snippet(position,title)),nextPageToken,pageInfo/resultsPerPage',
            maxResults: 50,
            headers: headers,
        });
    } else {
        res = await youtube.playlistItems.list({
            part: 'contentDetails, snippet',
            mine: 'false',
            pageToken: nextPageToken,
            playlistId: playlistID,
            fields: 'items(contentDetails/videoId,snippet(position,title)),nextPageToken,pageInfo/resultsPerPage',
            maxResults: 50,
            headers: headers,
        });
    } 

    if (parseInt(res.status) !== 200) {
        console.error("Error! Status code: " + res.status);
        console.error(res.data);
        throw error;
    }
    console.log(res.data.items[0].contentDetails.videoId);
    // int numberOfItems = parseInt(res.data.pageInfo.resultsPerPage);

    // Store the results
    for (i = 0; i < res.data.items.length; i++) {
        console.log(i);
        var videoID = res.data.items[i].contentDetails.videoId;
        var videoTitle = res.data.items[i].snippet.title;
        let ytVidURL = ytVideoURL + videoID;
        servers[guildId].queue.push(ytVidURL);
        console.log(ytVidURL);
        musicQueueInfo[guildId].queue.push(videoTitle);
    }

    // Check if there's still more
    if (res.data.nextPageToken) {
        console.log("Entered");
        GetPlayListData(youtube, playlistID, guildId, nextPageToken);
    }
}

function FillMusicAndPlayQueue(youtube, url, message) {
    ytdl.getInfo(url, ['--format=bestaudio'], function(err, info) {
        if (err) {
            var youtubePlaylistID = url.split(playlistURL)[1];
            try {
                GetPlayListData(youtube, youtubePlaylistID, message.guild.id, null);
            } catch (error) {
                console.error("Playlist error");
            }
        } else {
            console.log(err);
            console.log("New Song Detected");
            // Don't push info but info.title instead
            musicQueueInfo[message.guild.id].queue.push(info.title);
            servers[message.guild.id].queue.push(url);
            console.log(servers[message.guild.id].queue[0]);
            message.channel.send(url);
            message.channel.send(`Playing: **${info.title}**`);
        }

        if (!message.guild.voiceConnection) {
            message.member.voiceChannel.join()
            .then(connection => {
                console.log("Calling PlayMusic Function");
                PlayMusic(connection, message);
            })
        }
    });
}

module.exports = {
	name: 'play',
    description: 'Command to play music. If play is used music is playing then the music being requested will be queued',
    usage: `"music-url"`,
    args: true,
	async execute(message, args) {
        const youtube = google.youtube({
            version: 'v3',
            auth: apiKey
        });
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
        
       FillMusicAndPlayQueue(youtube, url, message);
	},
};
