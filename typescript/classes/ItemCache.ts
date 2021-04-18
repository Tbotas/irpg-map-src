import { Equipment, Accessory } from '../types/types'

class ItemCache {
    weapons: Equipment[]
    armors: Equipment[]
    accessories: Accessory[]

    constructor() {
    }

    fetch() {
        return Promise.all([
            fetch("./json/weapons.json").then(value => value.json()), 
            fetch("./json/armors.json").then(value => value.json()), 
            fetch("./json/accessories.json").then(value => value.json())
        ]).then((values) => {
            this.weapons = values[0]
            this.armors = values[1]
            this.accessories = values[2]
        })
    }

    getItemFromId(id: number, type: number): Equipment | Accessory {
        switch (type) {
            case 0:
                return this.getWeaponFromId(id)
            case 1:
                return this.getArmorFromId(id)
            case 2:
                return this.getAccessoryFromId(id)
        }
    }

    getStringFromType(type: number): string {
        switch (type) {
            case 0:
                return "weapons"
            case 1:
                return "armors"
            case 2:
                return "accessories"
        }
    }

    getWeaponFromId(id: number) {
        return this.weapons.find(el => el.id === id)
    }

    getArmorFromId(id: number) {
        return this.armors.find(el => el.id === id)
    }

    getAccessoryFromId(id: number) {
        return this.accessories.find(el => el.id === id)
    }
}

export { ItemCache }