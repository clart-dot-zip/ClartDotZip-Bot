const { SlashCommandBuilder } = require('discord.js');
const blizzard = require('blizzard.js');
const { wowClientId, wowSecret } = require('../../config.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('character')
		.setDescription('Lists information regarding a WoW character.'),
	async execute(interaction) {

        const wowClient = await blizzard.wow.createInstance(
            {
                key: wowClientId,
                secret: wowSecret,
                origin: 'eu', // optional
                locale: 'en_GB', // optional
                token: '', // optional
            }
        )
        console.log(`${wowClient.accountCharacterProfile(536, 178097174)}`)
		await interaction.reply(`uh oh`);
	},
};