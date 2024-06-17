const {EmbedBuilder} = require("discord.js")

const stati = {
    'offline': ['🔴 Offline', '#dd2e44'],
    'starting': ['🟠 Starting', '#f4900c'],
    'running': ['🟢 Online', '#78b159'],
    '': ['⚫ Unknown', '#000000'],
}

function buildEmbed(server){
    const status = server.online_status
    const [statusTitle, color] = stati[stati.hasOwnProperty(status) ? status : '']

    const embed = new EmbedBuilder()
        .setTitle(server.name)
        .setDescription(statusTitle)
        .addFields(
            {
                name: "IP Address",
                value: server.address,
                inline: true
            },
            {
                name: "Version",
                value: server.description,
                inline: true
            },
        )
        .setThumbnail(server.thumbnail)
        .setColor(color)
        .setFooter({
            text: "High Tinker Mekkatorque",
            iconURL: "https://cdn.discordapp.com/app-assets/1206385637603938314/1208468226166489209.png",
        })
        .setTimestamp()

    return embed
}

const logEnum = { 0: 'LOG', 1: 'TASK', 2: 'ERROR', 3: 'SOCKET', 4: 'WARNING', 5: 'DEBUG', 6: 'EXIT HANDLER' };

const consoleLog = (type, string, err) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'});
	if (type === 2) {
		console.error(`[${timestamp}] [${logEnum[type]}] ${string}`, err);
	} else {
		console.log(`[${timestamp}] [${logEnum[type]}] ${string}`);
	}
};

module.exports = {
    buildEmbed,
    consoleLog
}
