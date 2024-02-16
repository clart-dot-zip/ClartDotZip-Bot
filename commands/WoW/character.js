const { SlashCommandBuilder } = require('discord.js');
const { BlizzAPI } = require('blizzapi');
const { wowClientId, wowSecret } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('character')
		.setDescription('Lists information regarding a WoW character.'),
	async execute(interaction) {

        const api = new BlizzAPI({
            region: "eu",
            clientId: wowClientId,
            clientSecret: wowSecret,
        })

        const data = await api.query("/profile/wow/character/argent-dawn/broccocoli");
        console.log(data);
		await interaction.reply(`uh oh`);
	},
};