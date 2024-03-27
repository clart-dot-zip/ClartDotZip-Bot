const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises; // Use fs.promises for async file reading

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('list server'),
	async execute(interaction) {
        try {
            // Read data from the file
            const data = await fs.readFile('data/servers.json', 'utf8');
            // Parse JSON data
            const jsonData = JSON.parse(data);

            // Iterate over the parsed JSON array
            for (const item of jsonData) {
                const embed = new EmbedBuilder()
                    .setAuthor({
                        name: item.name,
                    })
                    .setTitle("🟢 Online")
                    .addFields(
                        {
                            name: "IP Address",
                            value: "yes", // Assuming identifier holds IP address
                            inline: true
                        },
                        {
                            name: "Version",
                            value: "yes", // Assuming status holds server version
                            inline: true
                        },
                    )
                    //.setThumbnail("imagehere")
                    .setColor("#6495ed")
                    .setFooter({
                        text: "High Tinker Mekkatorque",
                        iconURL: "https://cdn.discordapp.com/app-assets/1206385637603938314/1208468226166489209.png",
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error reading or parsing file:', error);
        }
	},
};