const { SlashCommandBuilder } = require('discord.js');
const { BlizzAPI } = require('blizzapi');
const { wowClientId, wowSecret } = require('../../config/config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('character')
		.setDescription('Lists information regarding a WoW character.')
        .addStringOption(option =>
            option.setName('charactername')
                .setDescription('Name of the character to search.'))
        .addStringOption(option =>
            option.setName('realm')
                .setDescription('Name of the realm the character is on.')),

	async execute(interaction) {

        const api = new BlizzAPI({
            region: "eu",
            clientId: wowClientId,
            clientSecret: wowSecret,
        })
        try {
            const data = await api.query("/profile/wow/character/argent-dawn/broccocoli?namespace=profile-eu");
          } catch (error) {
            console.error(error);
            // Expected output: ReferenceError: nonExistentFunction is not defined
            // (Note: the exact output may be browser-dependent)
          }
          
		await interaction.reply(`uh oh`);
	},
};