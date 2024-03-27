const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;

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

            // Limit the loop to output the first three results for debugging
            const loopLimit = Math.min(jsonData.length, 3);
            
            // Iterate over the parsed JSON array
            for (let i = 0; i < loopLimit; i++) {
                const item = jsonData[i];
                var status = item.status;
                if (status === "offline") {
                    status = "🔴 Offline";
                } else if (status == "running") {
                    status = "🟢 Online";
                } else {
                    status = "🟠 Starting";
                }
                const embed = new EmbedBuilder()
                    .setTitle(item.name)
                    .setDescription(status)
                    .addFields(
                        {
                            name: "IP Address",
                            value: "yes", // Assuming identifier holds IP address
                            inline: true
                        },
                        {
                            name: "Version",
                            value: "item.attributes.version", // Assuming version holds server version
                            inline: true
                        },
                    )
                    .setColor("#6495ed")
                    .setFooter({
                        text: "High Tinker Mekkatorque",
                        iconURL: "https://cdn.discordapp.com/app-assets/1206385637603938314/1208468226166489209.png",
                    })
                    .setTimestamp();

                await interaction.channel.send({ embeds: [embed] });

                // Add a delay between each message to prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 3000)); // Delay for 3 seconds
            }
        } catch (error) {
            console.error('Error reading or parsing file:', error);
        }
    },
};
