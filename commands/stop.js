module.exports = {
	name: 'stop',
	description: 'Stop!',
	execute(message, args) {
		message.channel.send('Command sent is stop');
	},
};
