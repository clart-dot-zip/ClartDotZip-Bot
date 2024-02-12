// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

client.on('ready', async () => {
	client.setActivity({
		details: 'Testing',
		state: 'beep boop uwu',
		startTimestamp: Date.now(),
		largeImageKey: 'discord-icon',
		largeImageText: 'test',
		smallImageKey: 'discord-icon',
		smallImageText: 'test',
		instance: false,
		buttons: [
			{
				label: 'hahaha',
				url: 'https://clart.zip'
			}
		]
	});
})