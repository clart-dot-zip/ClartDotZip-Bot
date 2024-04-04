module.exports = class ServerCache {
    constructor(){
        this.data = new Map()
    }

    set(id, data){
        this.data.set(id, data)
    }

    get(id){
        return this.data.get(id)
    }

    delete(id){
        this.data.delete(id)
    }

    has(id){
        return this.data.has(id)
    }

    keys(){
        return new Set(this.data.keys())
    }

    entries(){
        return this.data.entries()
    }

    [Symbol.iterator](){
        return this.data[Symbol.iterator]
    }

    load(){}
    save(){}
}
