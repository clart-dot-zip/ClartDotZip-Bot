const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs').promises;
const {messages} = require("../../cron")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clear')
        .setDescription('Clears all existing server messages.'),

    async execute(interaction) {
        try {
            await interaction.reply({ephemeral: true, content: "Deleting messages.."})

            for (const [key, item] of messages.entries()){

                let message_id = item.message_id

                if (message_id !== null){
                    let message = await interaction.channel.messages.fetch(message_id)
                    messages.delete(key)
                    await message.delete()
                } else {
                  console.log("[ERROR] Message ID = NULL")
                }
            }
            await messages.save()
        } catch (e){
            console.error('Error reading or parsing file:', e)
        }
    },
};
