const { SlashCommandBuilder } = require('discord.js');
const Nodeactyl = require('nodeactyl');
const config = require('../../config/config.json');
const application = new Nodeactyl.NodeactylApplication(config.panelAddress, config.pteroApi);
const util = require('util');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('server')
		.setDescription('list server'),
	async execute(interaction) {
        application.getAllServers().then((response) => {
            for (var i = 0; i < 1 /*response.meta.pagination.count*/; i++) {
                server = response.data[i].attributes;
                console.log(util.inspect(server, {depth: null}));
                application.getServerDetails(server.id).then((details) => {
                    server.details = details.data.attributes;
                }).catch((error) => {
                    console.error(error);
                });
            }
            interaction.reply('Server list: ' + response);
        }).catch((error) => {  
            console.error(error);
            interaction.reply('Error fetching server list.');
        });
	},
};