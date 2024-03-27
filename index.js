// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits, EmbedBuilder} = require('discord.js');
const config = require('./config/config.json');
const cron = require('node-cron');
const Nodeactyl = require('nodeactyl');
const serverApp = new Nodeactyl.NodeactylApplication(config.panelAddress, config.serverApi);
const clientApp = new Nodeactyl.NodeactylClient(config.panelAddress, config.clientApi);
const util = require('util');

// Create a new client instance
const client = new Client({ 
	intents: [GatewayIntentBits.Guilds],
	presence: {
		status: 'dnd',
		activities: [{
			application_id: '1206385637603938314',
			type: 0,
			name: 'Gnomeregan',
			details: 'Located in Dun Morogh, the technological wonder known as Gnomeregan has been the gnomes capital city for generations.',
			state: 'Killing Mekgineer Thermaplugg',
			createdTimestamp: Date.now(),
			timestamps: {
				start: Date.now(),
				end: Date.now() + 5184000
			},
			assets: {
				large_image: 'https://media.discordapp.net/1206441092895998013.png',
				large_text: 'Gnomeregan',
				small_image: 'https://cdn.discordapp.com/app-assets/1206385637603938314/1206441092895998013.png',
				small_text: 'Gnomeregan'
			},
			emoji: '🤖'
		}],
	}
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
			console.log(`[LOG] The command ${command.data.name} has been registered.`);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(config.token);

client.on('ready', async () => {
	//console.log(`Activity ${JSON.stringify(client.user.presence)}`)
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

// Assuming these functions return Promises
const getAllServers = () => serverApp.getAllServers();
const getServerStatus = (identifier) => clientApp.getServerStatus(identifier);
const getServerDetails = (identifier) => clientApp.getServerDetails(identifier);

const serverMsgs = './data/server_messages.json';
const serverData = './data/servers.json';

cron.schedule('*/5 * * * * *', async () => {
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
                        port: port
                    });

                    // Read the server messages file
                    const serverMessagesData = await fs.readFile(serverMsgs);
                    const serverMessages = JSON.parse(serverMessagesData);

                    // Update or add the message ID for this server
                    serverMessages[identifier] = serverMessages[identifier] || {};
                    serverMessages[identifier].messageId = serverMessages[identifier].messageId || null;

                    // If the message ID is already stored, update the message
                    if (serverMessages[identifier].messageId) {
                        const channel = client.channels.cache.get('1206726874886311987');

                        if (!channel || channel.type !== 'text') {
                            console.error('Text channel not found.');
                            continue;
                        }

                        const existingMessage = await channel.messages.fetch(serverMessages[identifier].messageId);
                        if (existingMessage) {
                            const updatedEmbed = EmbedBuilder.from(existingMessage.embeds[0]).setDescription(description);
                            await existingMessage.edit({ embeds: [updatedEmbed] });
                        } else {
                            console.error('Message not found for identifier:', identifier);
                        }
                    }
                } else {
                    console.error('No default allocation found for server:', name);
                }
            }

            // Write data to disk
            await fs.writeFile(serverData, JSON.stringify(serverDataWithStatus));
            await fs.writeFile(serverMsgs, JSON.stringify(serverMessages));
        } else {
            console.error('Invalid server response format.');
        }
    } catch (error) {
        console.error(error);
    }
});

