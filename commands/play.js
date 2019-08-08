const ytdl = require("ytdl-core");
// Import the API Key
const {apiKey} = require('../config.json')
// Import googleapis client
const {google} = require('googleapis');
const playlistURL = 'https://www.youtube.com/playlist?list=';
const ytVideoURL = 'https://www.youtube.com/watch?v=';
const urlStart = "https://";
const searchStrCommand = "play-choose";

const exitTimeLimit = 60000;

/* Importing the Server and Song classes */
let songClass = require("./Song.js");
let serverClass = require("./Server.js");
let Song = songClass.Song;
let Server = serverClass.Server;

// make sure it's only called once
// setTimeout might not be thread safe
// BUG: STOP DOES NOT CUT EVERYTHING OFF
function PlayMusic(guildId, prevTime) {
    var targetServer = servers.get(guildId);

    if ( !(servers.has(guildId))) {
        console.log("Server no longer in use");
        return;
    }

    var musicQueue = songQueueGroups[guildId];
    var timeNow = Date.now();

    /* Check for time interval without playing any songs */
    if (timeNow - prevTime >= exitTimeLimit) {
        console.log("Timeout - Quitting");
        /* Disconnect the stream */
        targetServer.messageChannel.send('Music ended and no new songs detected after one minute. Left voice channel');
        targetServer.playing = false;
        checkAndClearTimeout(guildId);

        if (targetServer.connection) {
            targetServer.connection.disconnect();
            targetServer.connection = null;
        }

        songQueueGroups[guildId] = {queue: []};
        return;
    }

    try {
        console.log("Timer ID: " + targetServer.timerId);
        /* There exist a song to be played in the queue */
        if (musicQueue.queue[0]) {
            checkAndClearTimeout(guildId);
            console.log("Playing music: " + musicQueue.queue[0].title + " with URL: " + musicQueue.queue[0].musicURL);
            const musicStream = ytdl(musicQueue.queue[0].musicURL, {highWaterMark: 1<<25}, {quality: 'highestaudio'}, {filter: 'audio'});
            targetServer.dispatcher = targetServer.connection.playStream(musicStream)
                    .on("end", function() {
                        /* Shift the musicQueue */
                        musicQueue.queue.shift();
                        checkAndClearTimeout(guildId);
                        if (musicQueue.queue[0]) {
                            console.log("There's is still some music left");
                            PlayMusic(guildId, Date.now());
                        } else {
                            console.log("No songs detected");
                            targetServer.timerId = setTimeout( () => {PlayMusic(guildId, prevTime);}, 5000);
                        }
                    })
                    .on("error", error => {
                        console.error(error);
                        targetServer.messageChannel.send("Error Occurred during playback.");
                    });

            // targetServer.dispatcher.on("end", function() {
            //      /* Shift the musicQueue */
            //     musicQueue.queue.shift();
            //     checkAndClearTimeout(guildId);
            //     if (musicQueue.queue[0]) {
            //         console.log("There's is still some music left");
            //         PlayMusic(guildId, Date.now());
            //     } else {
            //         console.log("No songs detected");
            //         targetServer.timerId = setTimeout( () => {PlayMusic(guildId, prevTime);}, 5000);
            //     }
            // })
            // .on("error", error => {
            //     console.error(error);
            //     targetServer.messageChannel.send("Error Occurred during playback.");
            // });

            servers.set(guildId, targetServer);
        } else {
            /*  Note does not immediately stop */
            console.log("No songs timeout function call");
            checkAndClearTimeout(guildId);
            targetServer.timerId = setTimeout( () => {PlayMusic(guildId, prevTime);}, 5000);
        }
    } catch (error) {
        /* TODO: Think about the error - should end prematurely or not? */
        console.error(error);
        console.error("Error in playing the url");
        targetServer.messageChannel.send('A problem occured - failed to play the provided URL');
    }
}

function checkAndClearTimeout(guildId) {
    if (servers.has(guildId) && servers.get(guildId).timerId !== null) {
        clearTimeout(servers.get(guildId).timerId);
        servers.get(guildId).timerId = null;
    }
}

// https://www.youtube.com/watch?v={VIDEO ID}
// Need pageToken
// fields: items(contentDetails/videoId,snippet(position,title)),nextPageToken
async function GetPlayListData(youtube, playlistID, guildId, nextPageToken) {
    // console.log("Code entered");
    const headers = {};
    var res = null;
    checkAndClearTimeout(guildId);
    
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

        var newSong = new Song(videoTitle, ytVidURL);
        songQueueGroups[guildId].queue.push(newSong);
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

    checkAndClearTimeout(message.guild.id);
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
        searchResStr += `${i + 1}. ${queryTitleResults[i]} \n`;
    }
    searchResStr += "```";

    // Check who is the user sending the message
    const filter = m => m.content.startsWith(searchStrCommand);
    message.channel.send(searchResStr).then(() => {
        message.channel.awaitMessages(filter, {max: 1, time: 60000, errors: ['time'] })
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
            songQueueGroups[message.guild.id].queue.push(new Song(queryTitleResults[userResponse - 1], ytVidURL))
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

function queueSingleURL(url, info, message) {
    var musicDuration = parseInt(info.length_seconds);
    console.log("Music duration: " + musicDuration);
    var seconds = musicDuration % 60;
    var minutes = ((musicDuration - seconds) / 60);
    // var musicInfoStr = info.title + " [" + minutes + "m:" + seconds + "s]";
    console.log("New Song Detected");
    // Don't push info but info.title instead
    songQueueGroups[message.guild.id].queue.push(new Song(info.title, url));

    message.channel.send(url);
    message.channel.send(`Playing: **${info.title}**`);
}

/**
 *  Join the user's voice channel and play the music in the queue 
 * */
function joinAndPlayMusic(message) {
    var targetServer = servers.get(message.guild.id);

    if (!targetServer.connection) {
        targetServer.voiceChannel.join()
        .then( connection => {
            targetServer.connection = connection;
            if (!targetServer.playing) {
                targetServer.playing = true;
                console.log("Calling PlayMusic Function");
                PlayMusic(message.guild.id, Date.now());
            }
            servers.set(message.guild.id, targetServer);

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
                message.channel.send("Adding playlist to queue: " + url);
                GetPlayListData(youtube, youtubePlaylistID, message.guild.id, null);
            } else {
                // refactor this to a function
                console.log("Message inside await function: " + message);
                queueSingleURL(url, info, message);
            }
            joinAndPlayMusic(message);
        } catch (error) {
            console.error("Playlist error");
            return Promise.reject(error);
        }
    })

    return Promise.resolve(command);
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

        if (!songQueueGroups[message.guild.id]) {
            songQueueGroups[message.guild.id] = {queue: []};
        }

        /* Check if there exist a Server object defined for the user's server. If so, check if it's still the old voice channel and update otherwise  */
        if (!servers.has(message.guild.id)) {
            console.log("created new server object");
            checkAndClearTimeout(message.guild.id);
            servers.set(message.guild.id, new Server(message.channel, message.member.voiceChannel));
        }

        // Parse the link
        url = args[0];

       FillMusicAndPlayQueue(youtube, url, message);
    //    .then(command => {
    //        joinAndPlayMusic(command);
    //        console.log("Message: " + command);
    //     })
    //    .catch(error => console.error("Wrong in fillMusicAndPlay " + error));
	},
};
