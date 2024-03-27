const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;

const serverMsgs = './data/server_messages.json';
const serverData = './data/servers.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName('server')
        .setDescription('list server'),
    async execute(interaction) {
        try {
            // Read data from the file
            const data = await fs.readFile(serverData, 'utf8');
            // Parse JSON data
            const jsonData = JSON.parse(data);

            // Limit the loop to output the first three results for debugging
            const loopLimit = Math.min(jsonData.length, 3);

            // Store the identifiers and message IDs in an object
            const serverMessages = {};

            // Iterate over the parsed JSON array
            for (let i = 0; i < loopLimit; i++) {
                const item = jsonData[i];
                const status = item.status;
                
                const embed = new EmbedBuilder()
                    .setTitle(item.name)
                    .setDescription(status)
                    .addFields(
                        {
                            name: item.ip_alias + ":" + item.port,
                            value: "yes", // Assuming identifier holds IP address
                            inline: true
                        },
                        {
                            name: "Version",
                            value: item.description, // Assuming version holds server version
                            inline: true
                        },
                    )
                    .setThumbnail("https://clart.zip/resources/" + item.identifier + ".png")
                    .setColor("#6495ed")
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
    },
};

// Function to update embed messages
async function updateEmbedMessages(client) {
    try {
        // Read server data and message IDs
        const serverDataContent = await fs.readFile(serverData, 'utf8');
        const serverData = JSON.parse(serverDataContent);
        const serverMessagesContent = await fs.readFile(serverMsgs, 'utf8');
        const serverMessages = JSON.parse(serverMessagesContent);

        // Iterate through server data
        for (const server of serverData) {
            const { identifier, name, description, status, ip_alias, port } = server;

            // Check if server ID has a corresponding message ID
            if (serverMessages.hasOwnProperty(identifier)) {
                const messageId = serverMessages[identifier];
                const channel = client.channels.cache.get('1206726874886311987'); // Replace with your channel ID

                // Fetch the message
                const message = await channel.messages.fetch(messageId);

                // Update the embed
                const embed = new EmbedBuilder()
                    .setTitle(name)
                    .setDescription(status)
                    .addFields(
                        { name: 'IP', value: `${ip_alias}:${port}`, inline: true },
                        { name: 'Description', value: description, inline: true }
                    )
                    .setColor(status === '🔴 Offline' ? '#FF0000' : '#00FF00');

                // Edit the message with the updated embed
                await message.edit({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error('Error updating embed messages:', error);
    }
}

module.exports = updateEmbedMessages;