// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let status = [
	{
		status: 'dnd',
		activities: [{
			type: ActivityType.Game,
			name: 'Gnomeregan',
			state: 'Killing Mekgineer Thermaplugg',
			details: 'Located in Dun Morogh, the technological wonder known as Gnomeregan has been the gnomes capital city for generations. Recently, a hostile race of mutant troggs infested several regions of Dun Morogh - including the great gnome city.',
			createdTimestamp: Date.now(),
			assets: [{
				largeImage: 'discord-icon',
				largeText: 'Gnomeregan',
				smallImage: 'discord-icon',
				smallText: 'Gnomeregan'
			}]
		}],
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
	client.user.setPresence(status[0]);
})