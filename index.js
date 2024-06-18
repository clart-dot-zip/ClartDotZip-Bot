// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const config = require('./config/config.json');
const cron = require('node-cron');
const {cron: doCron, init: initCaches} = require("./cron")
const { pterosocket } = require('pterosocket');
const {consoleLog} = require("./api/builder")

const writeStream = fs.createWriteStream('./logs/test.txt', {flags: 'a'})
const stdoutWrite = process.stdout.write.bind(process.stdout)
const stderrWrite = process.stderr.write.bind(process.stderr)

process.stdout.write = function (...args){
	writeStream.write(...args)
	return stdoutWrite(...args)
}

process.stderr.write = function (...args){
	writeStream.write(...args)
	return stderrWrite(...args)
}

// Create a new client instance
const client = new Client({
	intents: [GatewayIntentBits.Guilds],
	presence: {
		status: 'dnd',
		activities: [{
			application_id: config.clientId,
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
			consoleLog(0, `The command ${command.data.name} has been registered.`);
		} else {
			consoleLog(4, `The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	consoleLog(0, `Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
initCaches().then(() => {client.login(config.token)})


client.on('ready', async () => {
	await doCron(client)
	cron.schedule('*/10 * * * * *', () => doCron(client));
	//console.log(`Activity ${JSON.stringify(client.user.presence)}`)
})

client.on(Events.InteractionCreate, async interaction => {
	if (!interaction.isChatInputCommand()) return;

	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		consoleLog(0, `No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error){
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
});

const socket = new pterosocket(config.panelAddress, config.clientApi, "f9c0f12f-4cc1-497b-ad90-d11739cd1ee7");

socket.once("start", () => {
	consoleLog(3, "Pterodactyl console socket connection established.");
});

socket.on("auth_success", () => {
	consoleLog(3, "Pterodactyl console socket authenticated successfully.");
});

socket.once("close", (data) => {
	consoleLog(3, `Pterodactyl console socket disconnected: ${data}`);
});

socket.once("error", (data) => {
	consoleLog(3, `Pterodactyl console socket ERROR: ${data}`);
});

let consoleOutput = "----------------------------------------------------------------------------------------------";
const maxLines = 100;

socket.on('console_output', (output)=>{
    consoleOutput += '\n' + output;
	const lines = consoleOutput.trim().split('\n');
	if (lines.length > maxLines) {
		consoleOutput = lines.slice(lines.length - maxLines).join('\n');
	}
})

const handleExit = () => {
	consoleLog(6, "Exiting process...")

	let dateSaved = new Date().toLocaleString('en-GB', { timeZone: "Europe/London" }).replace(/[/]/g, '-');
	let directory = `./logs/Console ${dateSaved} Output.txt`;

	const logDirectory = path.dirname(directory);
    if (!fs.existsSync(logDirectory)) {
        fs.mkdirSync(logDirectory);
    }

	fs.writeFileSync(directory, consoleOutput, 'utf8');
 	process.exit();
};

// Listen for the SIGINT signal (Ctrl+C) and call handleExit synchronously
// Handle SIGINT signal (Ctrl+C)
process.on('SIGINT', handleExit);

// Handle SIGTERM signal
//process.on('SIGTERM', handleExit);

// Listen for uncaught exceptions and call handleExit synchronously
process.on('uncaughtException', (err) => {
    consoleLog(2, "An uncaught exception occurred: ", err);
    handleExit();
});

