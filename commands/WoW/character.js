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
                  var jsonData = JSON.stringify(data[0]);
                  jsonData = JSON.parse(jsonData);
              
                  // Iterate over the parsed JSON object using forEach
                  //jsonData.forEach(item => {
                    // Do something with each item
                    console.log(jsonData);
                  //});
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