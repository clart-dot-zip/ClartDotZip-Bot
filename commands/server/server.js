const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs').promises;
const cron = require('node-cron');

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
            await fs.writeFile(serverMsgs, JSON.stringify(serverMessages));
        } catch (error) {
            console.error('Error reading or parsing file:', error);
        }
    },
};

// Schedule editing of messages using node-cron
cron.schedule('*/5 * * * * *', async () => {
    try {
        // Read server messages from the file
        const serverMessagesData = await fs.readFile(serverMsgs, 'utf8');
        const updatedData = await fs.readFile(serverData, 'utf8');
        const serverMessages = JSON.parse(serverMessagesData);

        // Iterate over the server messages and edit them
        for (const identifier in serverMessages) {
            const messageId = serverMessages[identifier];
            const existingMessage = await interaction.channel.messages.fetch(messageId);

            // Edit the existing message
            if (existingMessage) {
                // Fetch server details based on the identifier and update the embed
                // Note: Implement the logic to fetch server details and update the embed accordingly
                const updatedEmbed = EmbedBuilder.from(await msg.embeds[0]).setDescription(updatedData.find(status => updatedData.identifier == serverMessages));
                await existingMessage.edit({ embeds: [updatedEmbed] });
            } else {
                console.error('Message not found for identifier:', identifier);
            }
        }
    } catch (error) {
        console.error('Error editing messages:', error);
    }
});