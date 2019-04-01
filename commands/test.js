module.exports = {
	name: 'test',
	description: 'Testing!',
	execute(message) {
		message.channel.send('Command sent is test');
	},
};
