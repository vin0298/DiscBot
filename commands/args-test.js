module.exports = {
	name: 'args-test',
    description: 'Argument parsing testing!',
    args: true,
	execute(message, args) {
		message.channel.send(`The first argument is: ${args[0]}`);
	},
};
