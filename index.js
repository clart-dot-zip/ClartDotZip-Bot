// Require the necessary discord.js classes
const { Client, Events, GatewayIntentBits, ActivityType } = require('discord.js');
const { token } = require('./config.json');

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

let status = [
	{
		status: 'dnd',
		activities: [{
			type: ActivityType.Playing,
			name: 'Gnomeregan',
			state: 'Killing Mekgineer Thermaplugg',
			details: 'Located in Dun Morogh, the technological wonder known as Gnomeregan has been the gnomes capital city for generations.',
			createdTimestamp: Date.now(),
			assets: [{
				largeImage: 'https://cdn.discordapp.com/attachments/426766656174555147/1206429935611150356/81140-gnomeregan.jpg?ex=65dbfa6f&is=65c9856f&hm=def8012ae2d575dd0624d5e3297c37158cf96bff7234c3b05e00831801465051&',
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
	console.log(`Activity ${client.user.activity}`)
})