const { SlashCommandBuilder } = require('discord.js');
const { client } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('uptime')
		.setDescription('Responds with bot uptime'),
	async execute(interaction) {
        
        let totalSeconds = (client.uptime / 1000);
        let days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        let hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        let minutes = Math.floor(totalSeconds / 60);
        let seconds = Math.floor(totalSeconds % 60);

		await interaction.reply(`I've been running for ${days} days, ${hours} hours, ${minutes} minutes and ${seconds} seconds.`);
	},
};