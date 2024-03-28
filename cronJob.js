const fs = require('fs').promises;
const Nodeactyl = require('nodeactyl');
const config = require('./config/config.json');
const { EmbedBuilder } = require('discord.js');

const serverApp = new Nodeactyl.NodeactylApplication(config.panelAddress, config.serverApi);
const clientApp = new Nodeactyl.NodeactylClient(config.panelAddress, config.clientApi);

const getAllServers = () => serverApp.getAllServers();
const getServerStatus = (identifier) => clientApp.getServerStatus(identifier);
const getServerDetails = (identifier) => clientApp.getServerDetails(identifier);

const serverDataWithStatus = [];
const currentCache = [];

async function isImgUrl(url) {
    return fetch(url, {method: 'HEAD'}).then(res => {
      return res.headers.get('Content-Type').startsWith('image')
    })
  }

async function updateServerData(client) {
    try {
        // Fetch all servers
        const dateNow = new Date();
        console.log('Fetching all servers...')
        const serverResponse = await getAllServers();

        // Check if serverResponse has data
        if (serverResponse && serverResponse.data && Array.isArray(serverResponse.data)) {
            // Array to store server data with status
            // Iterate through each server
            for (const server of serverResponse.data) {
                const serverData = server.attributes;
                const identifier = serverData.identifier;
                const name = serverData.name; // Extract name attribute
                var description = serverData.description;
                var thumbnail =  (await isImgUrl("https://clart.zip/resources/" + identifier + ".png")) ? "https://clart.zip/resources/" + identifier + ".png" : "https://clart.zip/resources/default.png";

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
                        thumbnail : thumbnail
                    });

                } else {
                    console.error('No default allocation found for server:', name);
                }
            }
            const serverMessagesData = await fs.readFile('./data/server_messages.json', 'utf8');
            // Write data to disk
            console.log(currentCache);
            if (currentCache.length == 0) {currentCache = serverDataWithStatus;}
            await fs.writeFile('./data/servers.json', JSON.stringify(serverDataWithStatus), 'utf8');
            
            const dateDone = new Date();
            console.log(`Server data updated successfully, done in (${(dateDone - dateNow) / 1000}) seconds.`);
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
        const dateNow = new Date();
        console.log('Beginning embed update...')
        // Iterate through server data
        for (const server of serverData) {
            const { identifier, name, description, status, ip_alias, port, thumbnail } = server;

            // Check if server ID has a corresponding message ID
            if (msgData.hasOwnProperty(identifier)) {
                const messageId = msgData[identifier];
                const channel = client.channels.cache.get('1222447003280080977'); // Replace with your channel ID

                // Fetch the message
                try {
                    const message = await channel.messages.fetch(messageId);
                    const color = status === '🔴 Offline' ? '#dd2e44' :
                                  status === '🟠 Starting' ? '#f4900c' :
                                  status === '🟢 Online' ? '#78b159' :
                                  '#000000';
                    // Update the embed
                    const embed = new EmbedBuilder()
                        .setTitle(name)
                        .setDescription(status)
                        .addFields(
                            { name: 'IP Address', value: `${ip_alias}:${port}`, inline: true },
                            { name: 'Version', value: description, inline: true }
                        )
                        .setThumbnail(thumbnail)
                        .setColor(color)
                        .setFooter({
                            text: "High Tinker Mekkatorque",
                            iconURL: "https://cdn.discordapp.com/app-assets/1206385637603938314/1208468226166489209.png",
                        })
                        .setTimestamp();

                    // Edit the message with the updated embed
                    await message.edit({ embeds: [embed] });
                } catch (error) {
                    console.error('Error fetching message:', error);
                }
            }
        }
        const dateDone = new Date();
        console.log(`Embeds updated, done in (${(dateDone - dateNow) / 1000}) seconds.`);
    } catch (error) {
        console.error('Error updating embed messages:', error);
    }
}

module.exports = updateServerData;
