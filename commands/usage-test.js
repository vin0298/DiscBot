module.exports = {
	name: 'usage-test',
    description: 'Testing giving help to users!',
    args: true,
    usage: 'This is the help message <arg1> <arg2>',
	execute(message, args) {
        
		message.channel.send('Command sent is test');
	},
};
