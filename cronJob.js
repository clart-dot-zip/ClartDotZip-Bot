const fs = require('fs').promises;
const Nodeactyl = require('nodeactyl');
const config = require('./config/config.json');
const { EmbedBuilder } = require('discord.js');

const serverApp = new Nodeactyl.NodeactylApplication(config.panelAddress, config.serverApi);
const clientApp = new Nodeactyl.NodeactylClient(config.panelAddress, config.clientApi);

const getAllServers = () => serverApp.getAllServers();
const getServerStatus = (identifier) => clientApp.getServerStatus(identifier);
const getServerDetails = (identifier) => clientApp.getServerDetails(identifier);


async function updateServerData(client) {
    try {
        // Fetch all servers
        const serverResponse = await getAllServers();

        // Check if serverResponse has data
        if (serverResponse && serverResponse.data && Array.isArray(serverResponse.data)) {
            // Array to store server data with status
            const serverDataWithStatus = [];

            // Iterate through each server
            for (const server of serverResponse.data) {
                const serverData = server.attributes;
                const identifier = serverData.identifier;
                const name = serverData.name; // Extract name attribute
                var description = serverData.description;

                // Fetch server status asynchronously
                var status = await getServerStatus(identifier);
                const details = await getServerDetails(identifier);

                if (status === "offline") {
                    status = "🔴 Offline";
                } else if (status == "running") {
                    status = "🟢 Online";
                } else {
                    status = "🟠 Starting";
                }

                // Find the allocation with is_default equal to true
                const defaultAllocation = details.relationships.allocations.data.find(allocation => allocation.attributes.is_default);

                if (defaultAllocation) {
                    const { ip_alias, port } = defaultAllocation.attributes;

                    console.log('IP Alias:', ip_alias);
                    console.log('Port:', port);

                    if (description != "") {
                        description = description;
                    } else {
                        description = "N/A";
                    }

                    // Push server data with status and details to array
                    serverDataWithStatus.push({
                        identifier: identifier,
                        name: name, // Add name attribute
                        description: description,
                        status: status,
                        ip_alias: ip_alias,
                        port: port,
                        thumbnail : "https://clart.zip/resources/" + identifier + ".png" || "https://clart.zip/resources/default.png"
                    });

                } else {
                    console.error('No default allocation found for server:', name);
                }
            }
            const serverMessagesData = await fs.readFile('./data/server_messages.json', 'utf8');
            console.log(serverMessagesData);
            // Write data to disk
            await fs.writeFile('./data/servers.json', JSON.stringify(serverDataWithStatus), 'utf8');
            
            // Update embed messages after writing server data
            await updateEmbedMessages(client, JSON.parse(serverMessagesData), serverDataWithStatus);
        } else {
            console.error('Invalid server response format.');
        }
    } catch (error) {
        console.error('Error in cron job:', error);
    }
};

async function updateEmbedMessages(client, msgData, serverData) {
    try {

        // Iterate through server data
        for (const server of serverData) {
            const { identifier, name, description, status, ip_alias, port } = server;

            // Check if server ID has a corresponding message ID
            if (msgData.hasOwnProperty(identifier)) {
                const messageId = msgData[identifier];
                const channel = client.channels.cache.get('1206726874886311987'); // Replace with your channel ID

                // Fetch the message
                const message = await channel.messages.fetch(messageId);

                // Update the embed
                const embed = new EmbedBuilder()
                    .setTitle(name)
                    .setDescription(status)
                    .addFields(
                        { name: 'IP Address', value: `${ip_alias}:${port}`, inline: true },
                        { name: 'Version', value: description, inline: true }
                    )
                    .setThumbnail(thumbnail)
                    .setColor(status === '🔴 Offline' ? '#FF0000' : '#00FF00')
                    .setFooter({
                        text: "High Tinker Mekkatorque",
                        iconURL: "https://cdn.discordapp.com/app-assets/1206385637603938314/1208468226166489209.png",
                    })
                    .setTimestamp();

                // Edit the message with the updated embed
                await message.edit({ embeds: [embed] });
            }
        }
    } catch (error) {
        console.error('Error updating embed messages:', error);
    }
}

module.exports = updateServerData;
