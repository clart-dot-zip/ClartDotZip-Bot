const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Events, GatewayIntentBits} = require('discord.js');
const cron = require('node-cron');

function startQueries() {
    cron.schedule('*/5 * * * * *', () => {
        console.log('running a task every five minutes');
    })
}
