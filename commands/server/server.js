const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;

const serverMsgs = './data/server_messages.json';
const serverData = './data/servers.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servers')
        .setDescription('Lists all current pterodactyl servers.'),
    async execute(interaction) {
        try {
            // Read data from the file
            const data = await fs.readFile(serverData, 'utf8');
            // Parse JSON data
            const jsonData = JSON.parse(data);

            // Limit the loop to output the first three results for debugging
            const loopLimit = jsonData.length;

            // Store the identifiers and message IDs in an object
            const serverMessages = {};

            // Iterate over the parsed JSON array
            for (let i = 0; i < loopLimit; i++) {
                const item = jsonData[i];
                const status = item.status;
                const color = status === '🔴 Offline' ? '#dd2e44' :
                              status === '🟠 Starting' ? '#f4900c' :
                              status === '🟢 Online' ? '#78b159' :
                              '#000000';
                
                const embed = new EmbedBuilder()
                    .setTitle(item.name)
                    .setDescription(status)
                    .addFields(
                        {
                            name: "IP Address",
                            value: item.ip_alias + ":" + item.port, // Assuming identifier holds IP address
                            inline: true
                        },
                        {
                            name: "Version",
                            value: item.description, // Assuming version holds server version
                            inline: true
                        },
                    )
                    .setThumbnail(item.thumbnail)
                    .setColor(color)
                    .setFooter({
                        text: "High Tinker Mekkatorque",
                        iconURL: "https://cdn.discordapp.com/app-assets/1206385637603938314/1208468226166489209.png",
                    })
                    .setTimestamp();

                // Send a new message and update the object with identifier and message ID
                const newMessage = await interaction.channel.send({ embeds: [embed] });
                serverMessages[item.identifier] = newMessage.id;
            }

            // Write the server messages to a file
            await fs.writeFile(serverMsgs, JSON.stringify(serverMessages), 'utf8', function(err) { if (err) console.error('Error writing server messages file:', err); });
        } catch (error) {
            console.error('Error reading or parsing file:', error);
        }
        await interaction.reply('Server messages have been posted.');
    },
};