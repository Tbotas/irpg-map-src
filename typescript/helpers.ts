import { ItemCache } from "./classes/ItemCache"
import { EnemyDataJSON } from "./types/types"

function pointInsidePolygon(point: fabric.Point, polygon: fabric.Point[]): boolean {
    if (!polygon.length)
        return false

    // ray-casting algorithm based on
    // https://wrf.ecse.rpi.edu/Research/Short_Notes/pnpoly.html/pnpoly.html
    
    let x = point.x, y = point.y
    
    let inside = false
    for (var i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        var xi = polygon[i].x, yi = polygon[i].y
        var xj = polygon[j].x, yj = polygon[j].y
        
        var intersect = ((yi > y) != (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside
    }
    
    return inside
}

function numberToFixedLength(n: number, l: number) {
    let pointIndex = n.toString().indexOf(".") 
    if (pointIndex === -1 || pointIndex > l)
        return n
    
    return n.toFixed(l - pointIndex)
}

function formatNumber(x: number) {
    if (x < 1e9)
        return numberWithCommas(x)
    else
        return x.toExponential(6)
}

function numberWithCommas(x: number) {
    if (x === null || x === undefined)
        return ""
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function getSettingsHTML() {
    return `
        <li>
            <button onclick="buttonDropClicked(this)" class="hide-button">▼</button>
            <div class="settings hidden">
                <p>Fill type:
                    <select name="fill-type-select" id="fill-type-select">
                        <option value="transparent">Transparent</option>
                        <option value="region-exp">Region EXP</option>
                        <option value="region-gold">Region GOL</option>
                    </select>
                </p>
            </div>
        </li>
    `
}

function getAreaInfoNode(level: number, averageGold: number, averageExp: number) {
    let li = document.createElement('li')

    li.innerHTML = `
        <div class="area-info">
            <p>Area: lvl ${level}</p>
            <p>Average gold: ${formatNumber(Math.round(averageGold))}</p>
            <p>Average EXP: ${formatNumber(Math.round(averageExp))}</p>
        </div>
    `

    return li
}

function getEnemyInfoNode(enemyInfo: EnemyDataJSON, itemCache: ItemCache) {


    let enemyInfoHTML = `
            <div class="enemy-info">
                <div class="enemy-info-flex">
                    <div class="enemy-info-img">   
                        <img class="enemy-img" src="./img/enemies/${enemyInfo.gameID}.png">
                    </div>
                    <div class="enemy-info-text">
                        <p>Name: ${enemyInfo.name}</p>
                        ${ (enemyInfo.spawnRate !== 1) ? "<p>Encounter Chance: " + numberToFixedLength(enemyInfo.spawnRate * 100, 4) +"%</p>" : ""}
                        <p>HP: ${formatNumber(enemyInfo.hp)}</p>
                        <p>Attack: ${formatNumber(enemyInfo.attack)}</p>
                        <p>XP: ${formatNumber(enemyInfo.xp)}</p>
                        <p>Gold: ${formatNumber(enemyInfo.gold)}</p>
                    </div>
                </div>
        `
        
        if (enemyInfo.drops.length > 0) {
            enemyInfoHTML += `
                <button onclick="buttonDropClicked(this)" class="hide-button">▼</button>

                <div class="hidden">
                    <table class="drops-table">
                        <thead>
                            <tr>
                                <th style="width: 25%">Drop</th>
                                <th>Min</th>
                                <th>2k</th>
                                <th>25k</th>
                                <th>300k</th>
                                <th>500k</th>
                                <th>1m</th>
                                <th>Max</th>
                            </tr>
                        </thead>
                        <tbody>
            `

            for (let drop of enemyInfo.drops) {

                let item = itemCache.getItemFromId(drop.itemID, drop.itemType)

                enemyInfoHTML += `
                    <tr>
                        <td style="width: 25%">
                            <img src="./img/${itemCache.getStringFromType(drop.itemType)}/${drop.itemID}.png">
                            <span>${item.name}</span>
                        </td>
                        <td>
                            ${numberToFixedLength(drop.lucMin * 100, 3)}%
                        </td>
                        <td>
                            ${numberToFixedLength(drop.luc2k * 100, 3)}%
                        </td>
                        <td>
                            ${numberToFixedLength(drop.luc25k * 100, 3)}%
                        </td>
                        <td>
                            ${numberToFixedLength(drop.luc300k * 100, 3)}%
                        </td>
                        <td>
                            ${numberToFixedLength(drop.luc500k * 100, 3)}%
                        </td>
                        <td>
                            ${numberToFixedLength(drop.luc1m * 100, 3)}%
                        </td>
                        <td>
                            ${numberToFixedLength(drop.lucMax * 100, 3)}%
                        </td>
                    </tr>
                `
            }

            enemyInfoHTML += `
                        </tbody>
                    </table>
                </div>
            `

        }

        
    enemyInfoHTML += `
        </div> 
    `

    let li = document.createElement('li')
    
    if (enemyInfo.isBoss)
        li.classList.add("enemy-boss")

    li.innerHTML = enemyInfoHTML

    return li
}

export { pointInsidePolygon, getAreaInfoNode, getEnemyInfoNode }