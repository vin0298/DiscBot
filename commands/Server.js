function Server(messageChannel, voiceChannel) {
    this.messageChannel = messageChannel;
    this.voiceChannel = voiceChannel;
    this.connection = null;
    this.dispatcher = null;
    this.playing = false;
    this.timerId = null;
}

module.exports = {
    Server: Server
}
