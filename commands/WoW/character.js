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

        var charName = interaction.options.getString('charactername');
        var realmName = interaction.options.getString('realm');
        var response;
        var responseTime;

        const api = new BlizzAPI({
            region: "eu",
            clientId: wowClientId,
            clientSecret: wowSecret,
        })

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

                    if (item.name == realmName || item.slug == realmName) {
                        realmName = item.slug;
                        return;
                    }

                });
            } catch (error) {
                console.error('Error parsing JSON:', error);
            }
        });

        responseTime = Date.now() + 2000;

        api.query(`/profile/wow/character/${realmName}/${charName}?namespace=profile-eu`).then (value => {
            response = value;
            console.log(response);
        }).catch(error => {
            console.log("Error finding character.")
        });

        while(Date.now() >= responseTime){
            if (response != null && Date.now() == responseTime) {
                console.log(response);
                await interaction.reply({ content: 'Character exists!', ephemeral: true });
            } else if(response == null && Date.now() == responseTime) {
                await interaction.reply({ content: 'Realm or character not found!', ephemeral: true });
            } else {
                responseTime = Date.now();
            }
        }
    },
};