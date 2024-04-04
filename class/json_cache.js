const {promises: fs} = require("fs")
const ServerCache = require("./server_cache")

module.exports = class JsonServerCache extends ServerCache {
    constructor(fileKey){
        super()
        this.data = new Map()
        this.fileKey = fileKey
    }

    async load(){
        try {
            const data = await fs.readFile(`./data/${this.fileKey}.json`, 'utf8');
            let cache = JSON.parse(data)
            for (const [key, value] of Object.entries(cache)){
                this.set(key, value)
            }
        } catch (e){   
        }
    }
    async save(){
        let out = {}
        for (const key of this.keys()){
            out[key] = this.get(key)
        }

        await fs.writeFile(`./data/${this.fileKey}.json`, JSON.stringify(out), 'utf8')
    }
}
