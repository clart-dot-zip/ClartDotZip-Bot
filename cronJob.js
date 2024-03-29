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
let currentCache = { cache: [] };

async function startCron(client) {
    if (currentCache.cache.length < 3) {
        const cacheData = await fs.readFile('./data/current_cache.json', 'utf8');
        currentCache = JSON.parse(cacheData);
    }
    await updateServerData(client); // Wait for updateServerData to complete
    return Promise.resolve(); // Resolve the promise
}

async function updateServerData(client) {
    try {
        // Fetch all servers
        const dateNow = new Date();
        console.log('[TASK] Fetching all servers...')
        const serverResponse = await getAllServers();

        // Check if serverResponse has data
        if (serverResponse && serverResponse.data && Array.isArray(serverResponse.data)) {
            // Array to store server data with status
            serverDataWithStatus.length = 0;
            // Iterate through each server
            for (const server of serverResponse.data) {
                if (new Date() - dateNow >= 10000) {console.log("[TIMEOUT] Server fetch took more than 10 seconds, terminating check."); break;}
                const serverData = server.attributes;
                const identifier = serverData.identifier;
                const name = serverData.name; // Extract name attribute
                var description = serverData.description;
                var thumbnail = "https://clart.zip/resources/" + identifier + ".png";

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
                    console.error('[ERROR] No default allocation found for server:', name);
                }
            }
            const serverMessagesData = await fs.readFile('./data/server_messages.json', 'utf8');

            if (currentCache.cache.length < 3) {currentCache.cache = serverDataWithStatus.slice();}
            // Write data to disk
            await fs.writeFile('./data/servers.json', JSON.stringify(serverDataWithStatus), 'utf8');
            const dateDone = new Date();
            console.log(`[TASK] Server data updated successfully, done in (${(dateDone - dateNow) / 1000}) seconds.`);
            // Update embed messages after writing server data
            await updateEmbedMessages(client, JSON.parse(serverMessagesData), serverDataWithStatus);
        } else {
            console.error('[ERROR] Invalid server response format.');
        }
    } catch (error) {
        console.error('[ERROR] Error in cron job:', error);
    }
};

async function updateEmbedMessages(client, msgData, serverData) {
    try {
        const dateNow = new Date();
        console.log('[TASK] Beginning embed update...')
        // Record the start time
        const startTime = dateNow.getTime();

        // Iterate through server data
        for (let i = 0; i < serverData.length; i++) {
            const server = serverData[i];
            const { identifier, name, description, status, ip_alias, port, thumbnail } = server;

            // Check if the elapsed time exceeds the timeout threshold
            if (new Date() - dateNow >= 10000) {
                console.log(`[TIMEOUT] Embed for ${name} took more than 10 seconds, terminating check.`);
                break;
            }

            // Check if the server data has changed
            if (JSON.stringify(currentCache.cache[i]) === JSON.stringify(server) && currentCache.cache.length !== 0) {
                continue; // Skip this iteration if the data hasn't changed
            }

            console.log(`[TASK] Updating embed for server: ${name}`);

            // Set currentCache for this server
            currentCache.splice(i, 1, server);

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
                    console.error('[ERROR] Error fetching message:', error);
                }
            }
        }

        const dateDone = new Date();
        console.log(`[TASK] Embeds attempted to update, done in (${(dateDone - dateNow) / 1000}) seconds.`);
    } catch (error) {
        console.error('[ERROR] Error updating embed messages:', error);
    }
}

module.exports = { startCron, currentCache: { cache: [] } };
