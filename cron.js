const fs = require('fs').promises

const Nodeactyl = require('nodeactyl')

const config = require('./config/config.json')
const Cache = require('./class/json_cache')
const {buildEmbed, consoleLog} = require("./api/builder")

const server = new Nodeactyl.NodeactylApplication(config.panelAddress, config.serverApi)
const client = new Nodeactyl.NodeactylClient(config.panelAddress, config.clientApi)

const getAllServers = () => server.getAllServers()
const getServerPage = (idx) => server.getServerPage(idx)

const getServerStatus = (id) => client.getServerStatus(id)
const getServerDetails = (id) => client.getServerDetails(id)

let cache = new Cache("cache")
let messages = new Cache("messages")

let inited = false
let locked = false

async function init(){

    try {
        await fs.access('./data').catch( e => consoleLog(e));
    } catch (error) {
        await fs.mkdir('./data').catch( e => consoleLog(e))
    }

    inited = true

    await Promise.all([
        cache.load(),
        messages.load()
    ]).catch( e => consoleLog(e))

    return null
}

async function cron(discord){
    if (locked){
        return
    }
    locked = true

    if (!inited){
        await init()
    }

    try {
        let dateNow = new Date()
        consoleLog(1, "Fetching all servers...")
        await update_servers().catch( e => consoleLog(e))
        await cache.save().catch( e => consoleLog(e))
        let dateDone = new Date()
        consoleLog(1, `Server data updated successfully, done in (${(dateDone - dateNow) / 1000}) seconds.`)

        dateNow = new Date()
        consoleLog(1, "Updating messages...")
        await update_messages(discord).catch( e => consoleLog(e))
        dateDone = new Date()
        consoleLog(1, `Message data updated successfully, done in (${(dateDone - dateNow) / 1000}) seconds.`)
    } catch (e){
        consoleLog(2, "An error occurred in during the cron job:", e)
    } finally {
        locked = false
    }
}

async function update_servers(){
    try {
        const response = await getAllServers().catch( e => consoleLog(e))
        let servers

        if (response.meta.pagination.total_pages === 1){
            servers = response.data
        } else {
            servers = []
            for (let page = 2; page < reponse.meta.pagination.total_pages; page++){
                servers.push(
                    getServerPage(page)
                        .then((returnedPage) => returnedPage)
                )
            }
            servers.splice(1, 0, Promise.resolve(response.data))
            servers = await Promise.all(servers).catch( e => consoleLog(e))
            servers = servers.flat(1)
        }

        const details = await Promise.all(servers.map((server) => new Promise(async function (res, rej){
            const id = server.attributes.identifier
            let out = [id]
            let wait = [getServerStatus(id), getServerDetails(id)]
            wait = await Promise.all(wait)

            let allocation = wait[1].relationships.allocations.data.find(allocation => allocation.attributes.is_default)
            let ip = null
            if (allocation !== undefined){
                ip = `${allocation.attributes.ip_alias}:${allocation.attributes.port}`
            }

            out.push({
                'id': wait[1].internal_id,
                'online_status': wait[0],
                'address': ip,
                'identifier': id,
                'name': wait[1].name,
                'description': wait[1].description === "" ? "N/A" : wait[1].description,
                'thumbnail': `https://clart.zip/resources/${id}.png`,
            })
            return res(out)
        }))).catch( e => consoleLog(e))

        let ink = cache.keys()
        let outk = new Set(details.map(([id, _]) => id))

        for (const inKey of ink){
            if (!outk.has(inKey)){
                cache.delete(inKey)
            }
        }

        for (const [id, detail] of details){
            cache.set(id, detail)
        }
    } catch (e){
        consoleLog(2, "An error occurred in update_servers:", e)
    }
}

async function update_messages(discord){
    try {
        let changed = false

        for (const [key, messageData] of messages.entries()){
            const serverData = cache.get(key)

            if (serverData === undefined){
                let guild = await discord.guilds.fetch(messageData.guild_id)
                let channel = await guild.channels.fetch(messageData.channel_id)
                let message = await channel.messages.fetch(messageData.message_id)
                await message.delete().catch( e => consoleLog(e))
                messages.delete(key)
                changed = true
                consoleLog(1, ` Deleted ${messageData.name} server message, server no longer exists.`)
            } else if (
                messageData.online_status !== serverData.online_status ||
                messageData.address !== serverData.address ||
                messageData.identifier !== serverData.identifier ||
                messageData.name !== serverData.name ||
                messageData.description !== serverData.description ||
                messageData.thumbnail !== serverData.thumbnail
            ){
                let guild = await discord.guilds.fetch(messageData.guild_id)
                let channel = await guild.channels.fetch(messageData.channel_id)
                let message = await channel.messages.fetch(messageData.message_id)
                await message.edit({embeds: [buildEmbed(serverData)]}).catch( e => consoleLog(e))

                messageData.online_status = serverData.online_status
                messageData.address = serverData.address
                messageData.identifier = serverData.identifier
                messageData.name = serverData.name
                messageData.description = serverData.description
                messageData.thumbnail = serverData.thumbnail
                messages.set(key, messageData)
                changed = true
                consoleLog(1, ` Updated ${serverData.name}`)
            }
        }

        if (changed){
            await messages.save().catch( e => consoleLog(e))
        }
    } catch (e){
        consoleLog(2, "An error occurred in update_messages:", e)
    }
}

module.exports = {init, cron, cache, messages}
