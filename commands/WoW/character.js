const fs = require('fs');
const { SlashCommandBuilder } = require('discord.js');
const { BlizzAPI } = require('blizzapi');
const { wowClientId, wowSecret } = require('../../config/config.json');
const realmTable = require('../../config/realms.json');

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

        let charName = '';
        let realmName = '';

        const api = new BlizzAPI({
            region: "eu",
            clientId: wowClientId,
            clientSecret: wowSecret,
        })

        try {
            fs.readFile('config/realms.json', 'utf8', (err, data) => {
                if (err) {
                    console.error('Error reading file:', err);
                    return;
                }
            
                try {
                    // Parse JSON data
                    var jsonData = JSON.parse(data);
                  
                    // Iterate over the parsed JSON array
                    jsonData.eu.forEach(item => {
                        // Access name and slug properties of each item
                        console.log('Name:', item.name);
                        console.log('Slug:', item.slug);
                    });
                } catch (error) {
                    console.error('Error parsing JSON:', error);
                }
              });
            const data = await api.query("/profile/wow/character/argent-dawn/broccocoli?namespace=profile-eu");
          } catch (error) {
            console.error(error);
            // Expected output: ReferenceError: nonExistentFunction is not defined
            // (Note: the exact output may be browser-dependent)
          }
          
		await interaction.reply(`uh oh`);
	},
};