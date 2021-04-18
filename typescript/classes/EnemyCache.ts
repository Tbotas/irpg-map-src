import { Area, EnemyDataJSON } from '../types/types'

class EnemyCache {
    enemies: EnemyDataJSON[]
    hardMode: boolean

    constructor(enemies: EnemyDataJSON[] = [], hardMode: boolean = false) {
        this.hardMode = hardMode
        this.enemies = enemies
    }

    fetch() {
        return fetch("./json/enemies.json")
            .then(value => value.json())
            .then(json => {
                this.enemies = json
            })
    }

    getEnemiesFromArea(area: Area, fetchBonus: boolean = false, group: string = "") {
        let enemies = this.enemies.filter(el => { 
            return el.areaLvl === area.level 
            && el.hardmode === this.hardMode
            && (el.isBoss || el.areaXPMulti === area.xpMulti)
            && fetchBonus == el.isBonus
            && (el.areaIndex === -1 || el.areaIndex === area.index)
            && (el.regionIndex === -1 || el.regionIndex === area.region.index)
            && (el.group === group)
        })

        return new EnemyCache(enemies, this.hardMode)
    }

    getAverageOf(value: 'gold' | 'xp') {
        return this.enemies.reduce((acc, current) => {
            return acc + ((current.isBoss) ? 0 : current[value] * current.spawnRate)
        }, 0)
    }

    getEnemyByName(name: string) {
        return this.enemies.filter(el => el.name === name)
    }

    setHardMode(hardMode: boolean) {
        this.hardMode = hardMode
    }
}

export { EnemyCache }