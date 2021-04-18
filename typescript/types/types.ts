import { Polygon } from "../classes/Polygon"
import { EnemyCache } from "../classes/EnemyCache"
import { ItemCache } from "../classes/ItemCache"
import { PolygonGroup } from "../classes/PolygonGroup"

type Position = {
    left: number
    top: number
}


interface Area {
    index: number,
    region: Region,
    level: number,
    xpMulti: number,
    position: {
        top: number,
        left: number
    },
    path: Array<{
        x: number,
        y: number
    }>,
    grouped: boolean,
    group: Array<Array<{
        x: number,
        y: number
    }>>,
    groupPositions: Array<{
        top: number,
        left: number
    }>
}

interface WorldDataJSON {
    index: number,
    mapName: string,
    regions: Array<Region>
}

interface Region {
    index: number,
    mapIndex: number,
    imageOffset: {
        top: number,
        left: number
    },
    imageSize: {
        width: number,
        height: number
    },
    areas: Array<Area>
}

interface EnemyDataJSON {
    gameID: string,
    name: string,
    hardmode: boolean,
    isBonus: boolean,
    areaIndex: number,
    regionIndex: number,
    group: string,
    hp: number,
    attack: number,
    gold: number,
    xp: number,
    areaLvl: number,
    isBoss: boolean,
    areaXPMulti: number,
    spawnRate: number,
    drops: Array<Drop>
}

interface Drop {
    itemType: number,
    itemID: number,
    lucMin: number,
    luc2k: number,
    luc25k: number,
    luc300k: number,
    luc500k: number,
    luc1m: number,
    lucMax: number
}

interface Equipment {
    id: number,
    name: string,
    base: number,
    percentIncrease: number,
    isHardMode: boolean
}

interface Accessory {
    id: number,
    name: string,
    isHardMode: boolean
}

interface GlobalSettings {
    canvasObjects: Array<Polygon | PolygonGroup>
    currentObject: Polygon | PolygonGroup
    itemCache: ItemCache
    enemyCache: EnemyCache
    mapName: string
}

export { Position, WorldDataJSON, EnemyDataJSON, Equipment, Accessory, Area, GlobalSettings, Region }