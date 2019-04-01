module.exports = {
	name: 'args-test',
	description: 'Argument parsing testing!',
	execute(message, args) {
        if(args.length == 0) {
            return message.channel.send("No arguments found");
        }

		message.channel.send(`The first argument is: ${args[0]}`);
	},
};
