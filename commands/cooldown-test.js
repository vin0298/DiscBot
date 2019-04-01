module.exports = {
	name: 'cd',
    description: 'Testing for cooldown commands',
    cooldown: 5,
	execute(message) {
		message.channel.send(`Cooldown command`);
	},
};
