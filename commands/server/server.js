const { SlashCommandBuilder } = require('discord.js');
const Nodeactyl = require('nodeactyl');
const config = require('../../config/config.json');
const application = new Nodeactyl.NodeactylApplication(config.panelAddress, config.pteroApi);

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('list server'),
	async execute(interaction) {
        let temp = application.getAllServers();
        await temp;
        console.log(temp.data);
	},
};