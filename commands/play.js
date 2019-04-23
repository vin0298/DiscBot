const ytdl = require("ytdl-core");
// Import the API Key
const {apiKey} = require('../config.json')
// Import googleapis client
const {google} = require('googleapis');
const playlistURL = 'https://www.youtube.com/playlist?list=';
const ytVideoURL = 'https://www.youtube.com/watch?v=';
const urlStart = "https://";
const searchStrCommand = "play-choose";

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

    // Store the results
    for (i = 0; i < res.data.items.length; i++) {
        var videoID = res.data.items[i].contentDetails.videoId;
        var videoTitle = res.data.items[i].snippet.title;
        let ytVidURL = ytVideoURL + videoID;
        servers[guildId].queue.push(ytVidURL);
        musicQueueInfo[guildId].queue.push(videoTitle);
    }

    // Check if there's still more
    if (res.data.nextPageToken) {
        console.log("Entered");
        GetPlayListData(youtube, playlistID, guildId, nextPageToken);
    }
}

// Just use YTDL-GETINFO?
async function youtubeSearch(youtube, queryString, message) {
    var headers = {};
    var res = null;
    res = await youtube.search.list({
        part: "snippet",
        maxResults: 5,
        order: "relevance",
        q: queryString,
        type: "video",
        videoDefinition: "any",
        fields: "items(id/videoId,snippet/title)",
        headers: headers,
    });

    if (parseInt(res.status) !== 200) {
        console.error("Error when searching! Status code: " + res.status);
        console.error(res.data);
        throw error;
    }

    //console.log(res.data.items);

   //  Display to the user
    var queryTitleResults = [];
    var queryIdResults = [];

    for (i = 0; i < res.data.items.length; i++) {
        queryTitleResults.push(res.data.items[i].snippet.title);
        queryIdResults.push(res.data.items[i].id.videoId);
    }

    // // Wait for user's choice
    var searchResStr = "```";
    searchResStr += `Here are the search results. Please type in: play-choose with a number from 1 - ${res.data.items.length} as an argument to choose the selection: \n\n`;
    for (i = 0; i < res.data.items.length; i++) {
        searchResStr += `${i + 1}. ${queryTitleResults[i]} \n`
        //message.channel.send(`**${i + 1}. ${queryTitleResults[i]}**`);
    }
    searchResStr += "```";

    // Check who is the user sending the message
    const filter = m => m.content.startsWith(searchStrCommand);
    message.channel.send(searchResStr).then(() => {
        message.channel.awaitMessages(filter, {max: 1, time: 10000, errors: ['time'] })
        .then(collected => {
            var userResponseStr = (collected.first().content).slice(searchStrCommand.length).split(/ +/)[1];
            var userResponse = parseInt(userResponseStr);
            if (isNaN(userResponse) || userResponse < 0 || userResponse > (res.data.items.length + 1) ) {
                console.log(userResponse);
                message.reply("Not a valid integer that is in range");
                return;
            } 
            
            var videoID = queryIdResults[userResponse - 1];
            var ytVidURL = ytVideoURL + videoID;
            servers[message.guild.id].queue.push(ytVidURL);
            musicQueueInfo[message.guild.id].queue.push(queryTitleResults[userResponse - 1]);
            console.log(queryTitleResults[userResponse - 1]);
        })
        .catch(collected => {
            // REFACTOR THIS
            console.log(collected);
            console.log("A minute has passed");
            message.reply("A minute has passed and no approriate command is entered - Try again");
        })
    });
}

async function queueSingleURL(url, info, message) {
    var musicDuration = parseInt(info.length_seconds);
    console.log(musicDuration);
    var seconds = musicDuration % 60;
    var minutes = ((musicDuration - seconds) / 60);
    var musicInfoStr = info.title + " [" + minutes + "m:" + seconds + "s]";
    console.log("New Song Detected");
    // Don't push info but info.title instead
    musicQueueInfo[message.guild.id].queue.push(musicInfoStr);
    servers[message.guild.id].queue.push(url);
    console.log(servers[message.guild.id].queue[0]);
    message.channel.send(url);
    message.channel.send(`Playing: **${info.title}**`);
}

function joinAndPlayMusic(message) {
    if (!message.guild.voiceConnection) {
        message.member.voiceChannel.join()
        .then(connection => {
            console.log("Calling PlayMusic Function");
            PlayMusic(connection, message);
        })
    }
}


async function FillMusicAndPlayQueue(youtube, url, message) {
    let command = message;
    await ytdl.getInfo(url, ['--format=bestaudio'], function(err, info) {
        try {
            if (url.split(urlStart).length == 1) {
                // make them return promises
                youtubeSearch(youtube, url, message);
            } else if (err) {
                var youtubePlaylistID = url.split(playlistURL)[1];
                GetPlayListData(youtube, youtubePlaylistID, message.guild.id, null);
            } else {
                // refactor this to a function
                queueSingleURL(url, info, message);
            }
            // return Promise.resolve(command);
            // return new Promise( (resolve, reject) => {
            //     console.log("message val: " + command);
            //     resolve(command)});
        } catch (error) {
            console.error("Playlist error");
            // return new Promise( (resolve, reject, error) => {
            //     reject(error)});
            return Promise.reject(error);
        }
    })

    return Promise.resolve(command);
    // return Promise.resolve(command);
    // .then(command => {
    // return new Promise( (resolve, reject) => {
    //     console.log("message val: " + command);
    //     resolve(command)});
    // })    
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
        
       FillMusicAndPlayQueue(youtube, url, message)
       .then(command => {
           console.log("Message: " + command);
           joinAndPlayMusic(command)
        })
       .catch(error => console.error("Wrong in fillMusicAndPlay " + error));
	},
};
