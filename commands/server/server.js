const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs').promises;
const {cache, messages} = require("../../cron")
const {buildEmbed} = require("../../api/builder")

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servers')
        .setDescription('Lists all current pterodactyl servers.'),

    async execute(interaction) {
        try {
            await interaction.reply({ephemeral: true, content: "Posted / Updated Embed Messages"})

            let newCache = []
            for (const [key, item] of cache.entries()){
                newCache.push(item)
            }

            newCache.sort((a, b) => a.id - b.id)

            for (const item of newCache){
                let key = item.identifier
                let message_id = null
                if (messages.has(key)){
                    message_id = messages.get(key).message_id
                }

                const embed = buildEmbed(item)

                if (message_id !== null){
                    // Edit the pre-existing message.
                    let message = await interaction.channel.messages.fetch(message_id)
                    await message.edit({ embeds: [embed] })
                } else {
                    // Send a new message and update the object with identifier and message ID
                    const newMessage = await interaction.channel.send({embeds: [embed]})
                    messages.set(key, {...item, "message_id": newMessage.id, "channel_id": newMessage.channel.id, "guild_id": newMessage.channel.guild.id})
                }
            }
            await messages.save()
        } catch (e){
            console.error('Error reading or parsing file:', e)
        }
    },
};
