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
                        name: jsonData.name,
                    })
                    .setTitle("🟢 Online")
                    .addFields(
                        {
                            name: "IP Address",
                            value: item.identifier, // Assuming identifier holds IP address
                            inline: true
                        },
                        {
                            name: "Version",
                            value: item.status, // Assuming status holds server version
                            inline: true
                        },
                    )
                    .setThumbnail("imagehere")
                    .setColor("#00b0f4")
                    .setFooter({
                        text: "Example Footer",
                        iconURL: "https://slate.dan.onl/slate.png",
                    })
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
            }
        } catch (error) {
            console.error('Error reading or parsing file:', error);
        }
	},
};