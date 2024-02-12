// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, ActivityType, Presence, RichPresenceAssests } = require('discord.js');
const { token } = require('./config.json');

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
			assets: [{
				large_image: 'https://cdn.discordapp.com/app-assets/1206385637603938314/1206441092895998013.png',
				largeText: 'Gnomeregan',
				smallImage: 'discord-icon',
				smallText: 'Gnomeregan'
			}]
		}],
	}
});

// When the client is ready, run this code (only once).
// The distinction between `client: Client<boolean>` and `readyClient: Client<true>` is important for TypeScript developers.
// It makes some properties non-nullable.
client.once(Events.ClientReady, readyClient => {
	console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);

client.on('ready', async () => {
	console.log(`Activity ${JSON.stringify(client.user.presence)}`)
})