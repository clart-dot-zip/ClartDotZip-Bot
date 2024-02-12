// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let status = [
	{
		activities: [{
			type: ActivityType.Custom,
			name: 'custom',
			state: '🤖 Fighting For Gnomeregan'
		}],
		name: 'Gnomeregan',
		details: 'Testing',
		startTimestamp: Date.now(),
	}
]

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

client.on('ready', async () => {
	client.user.setPresence("Fighting For", status[0]);
})