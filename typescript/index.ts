import { Polygon } from './classes/Polygon'
import { ItemCache } from './classes/ItemCache'
import { fabric } from 'fabric'
import { GlobalSettings, WorldDataJSON } from './types/types'
import { PolygonGroup } from './classes/PolygonGroup'
import { getAreaInfoNode, getEnemyInfoNode } from './helpers'
import { EnemyCache } from './classes/EnemyCache'

const DEFAULT_SCALE: number = 0.2

let canvas = new fabric.Canvas("canvas", {
    backgroundColor: 'black',
    hoverCursor: 'pointer',
    selection: false
})

canvas.setDimensions({ width: '100%', height: '100%' }, { cssOnly: true });

function drawMenu(menuOpened: boolean) {
    let menuDiv = document.getElementById('menu')
    if (menuOpened) {
        menuDiv.classList.remove('hidden')
    } else {
        menuDiv.classList.add('hidden')
    }
}

function init() {
    function resizeCanvas() {
        var width = (window.innerWidth > 0) ? window.innerWidth : screen.width
        var height = (window.innerHeight > 0) ? window.innerHeight : screen.height
        var canvasHTML = <HTMLCanvasElement>document.getElementById("canvas")
        canvasHTML.width = width
        canvasHTML.height = height
    
        canvas.width = width
        canvas.height = height
        canvas.renderAll()
    }
    
    window.onresize = resizeCanvas

    resizeCanvas()

    function handleMouseEvent(event: any) {
        if (event.clientX !== undefined){
            return {type: "pc", mouseCoordinates: { x: event.clientX, y: event.clientY }}
        }
        else if (event.touches !== undefined) {
            if (event.touches.length === 1)
                return {type: "phoneClick", mouseCoordinates: { x: event.touches[0].clientX, y: event.touches[0].clientY }}
            else if (event.touches.length === 0 && event.changedTouches.length === 1)
                return {type: "phoneClick", mouseCoordinates: { x: event.changedTouches[0].clientX, y: event.changedTouches[0].clientY }}
            else if (event.touches.length === 2) {
                phoneZoom(event)
                return {type: "phoneZoom", mouseCoordinates: { x: 0, y: 0 }}
            }
        }
        return {type: "unknown", mouseCoordinates: { x: 0, y: 0 }}
    }

    canvas.on('mouse:wheel', function(opt) {
        let event: any = opt.e
        let delta: number = event.deltaY
        let zoom = canvas.getZoom()
        zoom *= 0.999 ** delta
        if (zoom > 10) zoom = 10
        if (zoom < 0.5) zoom = 0.5
        let point: any = { x: event.offsetX, y: event.offsetY }
        canvas.zoomToPoint(point, zoom)
        opt.e.preventDefault()
        opt.e.stopPropagation()
    })

    canvas.on('mouse:down', function(opt) {
        let pointer = handleMouseEvent(opt.e)

        if (pointer.type !== "pc" && pointer.type !== "phoneClick") {
            opt.e.preventDefault()  
            return
        }
        
        this.isDragging = true
        this.selection = false
        this.lastPosX = pointer.mouseCoordinates.x
        this.lastMouseDownX = pointer.mouseCoordinates.x
        this.lastPosY = pointer.mouseCoordinates.y
        this.lastMouseDownY = pointer.mouseCoordinates.y

        opt.e.preventDefault()
    });


    function phoneZoom(event: any) {
        console.log("fuk")
    }

    canvas.on('mouse:move', function(opt) {
        let pointer = handleMouseEvent(opt.e)
        
        if (pointer.type !== "pc" && pointer.type !== "phoneClick")
            return
        
        if (this.isDragging) {
            let vpt = this.viewportTransform
            vpt[4] += pointer.mouseCoordinates.x - this.lastPosX
            vpt[5] += pointer.mouseCoordinates.y - this.lastPosY

            canvas.requestRenderAll()
            this.lastPosX = pointer.mouseCoordinates.x
            this.lastPosY = pointer.mouseCoordinates.y
        } else {
            resetAreas(false)

            this.requestRenderAll()

            for (let object of globalSettings.canvasObjects) {
                if (!object.isActive && object.isPointInsidePerimeter(<any>pointer.mouseCoordinates)) {
                    
                    object.setProperty('stroke', 'red')

                    this.requestRenderAll()
                    return
                }
            }         
        }
    });

    canvas.on('mouse:up', function(opt) {
        // on mouse up we want to recalculate new interaction
        // for all objects, so we call setViewportTransform
        this.setViewportTransform(this.viewportTransform)
        this.isDragging = false
        this.selection = true

        let pointer = handleMouseEvent(opt.e)
        
        if (pointer.type !== "pc" && pointer.type !== "phoneClick")
            return

        if (this.lastMouseDownX === pointer.mouseCoordinates.x && this.lastMouseDownY === pointer.mouseCoordinates.y) {
            for (let object of globalSettings.canvasObjects) {
                if (object.isPointInsidePerimeter(<any>pointer.mouseCoordinates)) {
                    handleAreaClick(object)
                    this.requestRenderAll()
                    return
                }
            }
            
            resetAreas(true)
            drawMenu(false)
        }
    });
}

function resetAreas(resetActives: boolean) {
    for (let object of globalSettings.canvasObjects) {
        if (!object.isActive || resetActives)
            object.resetClicked()
    }
}

function loadRegionsImages(jsonData: WorldDataJSON) {
    let loaded = 0
    let waitUntilLoaded = () => {
        if (loaded != jsonData.regions.length)
            setTimeout(waitUntilLoaded, 100)
        else {
            afterLoad(canvasImages, jsonData)
        }
    }

    let canvasImages: fabric.Image[] = []

    for (let i = 0; i < jsonData.regions.length; i++) {
        fabric.Image.fromURL(`./img/maps/map_${jsonData.mapName}_${jsonData.regions[i].mapIndex}.png`, img => {
            img.set(jsonData.regions[i].imageOffset)
            canvasImages.push(img)
            loaded++
        })
    }
    
    waitUntilLoaded()
}

function afterLoad(canvasImages: fabric.Image[], jsonData: WorldDataJSON) {
    let group = new fabric.Group(canvasImages, {
        selectable: false,
        hasControls: false,
    })

    group.scale(DEFAULT_SCALE);
    canvas.add(group)

    drawAreas(jsonData.regions)
}

function handleAreaClick(area: Polygon | PolygonGroup) {
    resetAreas(true)
    area.onClick()
    globalSettings.currentObject = area
    let fillTypeSelect = <HTMLSelectElement>document.getElementById('fill-type-select')
    changeBackgrounds(fillTypeSelect.value)
    refreshMenuData()
}

function refreshMenuData() {
    let menuList = <HTMLUListElement>document.getElementById("menuList")

    while (menuList.childElementCount > 1) {
        menuList.removeChild(menuList.lastElementChild)
    }
    
    for (let poly of globalSettings.canvasObjects) {
        let totalSpawnChance = globalSettings.enemyCache.getEnemiesFromArea(poly.area).enemies.reduce((acc, cur) => acc + ((cur.isBoss) ? 0 : cur.spawnRate), 0)

        if (Math.abs(totalSpawnChance - 1) > 0.1) {
            console.log("spawn chance doesn't add up :")
            console.log(poly.area)
        }
    }

    let polygon = globalSettings.currentObject

    if (polygon && polygon.isActive) {
        let areaEnemies;

        if (globalSettings.mapName === "world_bba") {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(polygon.area, true, "BBA")
        } else if (globalSettings.mapName === "world_wba") {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(polygon.area, true, "WBA")
        } else {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(polygon.area)
        }

        let averageGold = areaEnemies.getAverageOf('gold')
    
        let averageEXP = areaEnemies.getAverageOf('xp')
    
        menuList.appendChild(getAreaInfoNode(polygon.area.level, averageGold, averageEXP))

        for (let enemy of areaEnemies.enemies) {
            menuList.appendChild(getEnemyInfoNode(enemy, globalSettings.itemCache))
        }
    } 
    
    drawMenu(polygon.isActive)
}

function perc2color(perc: number) {
    perc = 100 - perc
	var r, g, b = 0;
	if(perc < 50) {
		r = 255;
		g = Math.round(5.1 * perc);
	}
	else {
		g = 255;
		r = Math.round(510 - 5.10 * perc);
	}
	var h = r * 0x10000 + g * 0x100 + b * 0x1;
	return ('000000' + h.toString(16)).slice(-6);
}

function changeAreaBackground(type: 'xp' | 'gold') {
    let regionXP: number[] = []
    let areasXP: number[][] = []

    for (let object of globalSettings.canvasObjects) {
        let areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(object.area)
        let regionIndex = object.area.region.index

        let averageEXP = Math.floor(areaEnemies.getAverageOf(type) / 10) * 10

        regionXP[regionIndex] = (regionXP[regionIndex] === undefined) ? 0 : regionXP[regionIndex] + averageEXP

        if (areasXP[regionIndex] === undefined) {
            areasXP[regionIndex] = []
        }

        areasXP[regionIndex].push(averageEXP)
    }

    for (let i = 0; i < areasXP.length; i++) {
        areasXP[i] = areasXP[i].sort((a, b) => b - a)
    }

    for (let object of globalSettings.canvasObjects) {

        let areaEnemies;

        if (globalSettings.mapName === "world_bba") {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(object.area, true, "BBA")
        } else if (globalSettings.mapName === "world_wba") {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(object.area, true, "WBA")
        } else {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(object.area)
        }
        
        let regionIndex = object.area.region.index

        let averageEXP = Math.floor(areaEnemies.getAverageOf(type) / 10) * 10

        let index = areasXP[regionIndex].findIndex(n => n === averageEXP)

        let color = perc2color(Math.round(index / areasXP[regionIndex].length * 100))
        
        let fabricColor = new fabric.Color(color)
        fabricColor.setAlpha(0.75)

        object.setProperty('fill', fabricColor.toRgba())  
    }

    console.log(areasXP)

    canvas.requestRenderAll()
}

function changeWorldBackground(type: 'xp' | 'gold') {
    let allValues: number[] = []

    for (let object of globalSettings.canvasObjects) {
        let areaEnemies;

        if (globalSettings.mapName === "world_bba") {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(object.area, true, "BBA")
        } else if (globalSettings.mapName === "world_wba") {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(object.area, true, "WBA")
        } else {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(object.area)
        }

        let averageEXP = Math.floor(areaEnemies.getAverageOf(type) / 10) * 10

        allValues.push(averageEXP)
    }

    for (let i = 0; i < allValues.length; i++) {
        allValues = allValues.sort((a, b) => b - a)
    }

    for (let object of globalSettings.canvasObjects) {

        let areaEnemies;

        if (globalSettings.mapName === "world_bba") {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(object.area, true, "BBA")
        } else if (globalSettings.mapName === "world_wba") {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(object.area, true, "WBA")
        } else {
            areaEnemies = globalSettings.enemyCache.getEnemiesFromArea(object.area)
        }

        let averageEXP = Math.floor(areaEnemies.getAverageOf(type) / 10) * 10

        let index = allValues.findIndex(n => n === averageEXP)

        let color = perc2color(Math.round(index / allValues.length * 100))
        
        let fabricColor = new fabric.Color(color)
        fabricColor.setAlpha(0.75)

        object.setProperty('fill', fabricColor.toRgba())  
    }

    canvas.requestRenderAll()
}

function drawAreas(regions: WorldDataJSON["regions"]) {
    for (let region of regions) {
        for (let area of region.areas) {
            area.region = region

            if (area.grouped) {
                let group: PolygonGroup = new PolygonGroup(canvas)
                group.addPolygons(area)
                globalSettings.canvasObjects.push(group)

                group.createGroup()
                group.addToCanvas()
            }
            else {
                let poly: Polygon = new Polygon(canvas, area, area.path, area.position)
                globalSettings.canvasObjects.push(poly)
                poly.addToCanvas()
            }
        }
    }
}

function parseURLData() {
    const urlParams = new URLSearchParams(window.location.search)

    let world = (/^(bba|wba|[1-9])$/.test(urlParams.get('world'))) ? "world_" + urlParams.get('world') : "world_1"
    let select = <HTMLSelectElement>document.getElementById("world-select")
    select.value = world
    
    let hardmode = urlParams.get('hm') == 'true' || urlParams.get('hm') == "1"
    let checkbox = <HTMLInputElement>document.getElementById("hardmode-checkbox")
    checkbox.checked = hardmode

    changeWorld(world)
}

function resetCanvas() {
    canvas.remove(...canvas.getObjects())
    globalSettings.canvasObjects = []
}

function changeWorld(worldName: string) {
    resetCanvas()
    drawMenu(false)
    
    globalSettings.mapName = worldName

    fetch(`./json/${worldName}.json`)
    .then(res => {
        res.json().then(json => {
            loadRegionsImages(json)
        })
    })
    .catch(console.error)
}

function resetAreasBackground() {
    for (let object of globalSettings.canvasObjects) {
        object.setProperty('fill', 'transparent')
    }

    canvas.requestRenderAll()
}

function changeBackgrounds(value: string) {
    switch (value) {
        case "region-exp":
            changeAreaBackground('xp')
            break;
        case "region-gold":
            changeAreaBackground('gold')
            break;
        case "world-exp":
            changeWorldBackground('xp')
            break;
        case "world-gold":
            changeWorldBackground('gold')
            break;
        case "transparent":
        default:
            resetAreasBackground()
    }
}


function attachToHTML() {
    document.getElementById("fill-type-select").onchange = (event) => {
        let select = <HTMLSelectElement>event.target
        changeBackgrounds(select.value)
    }

    document.getElementById("world-select").onchange = (event) => {
        let select = <HTMLSelectElement>event.target
        changeWorld(select.value)
    }

    document.getElementById("hardmode-checkbox").onclick = (event) => {
        let checkbox = <HTMLInputElement>event.target
        globalSettings.enemyCache.setHardMode(checkbox.checked)
        refreshMenuData()
    }
}

function main() {
    attachToHTML()
    parseURLData()
}

init()

let globalSettings: GlobalSettings = {
    itemCache: undefined,
    enemyCache: undefined,
    currentObject: undefined,
    canvasObjects: [],
    mapName: ""
}

globalSettings.itemCache = new ItemCache()
globalSettings.itemCache.fetch().then(() => {
    globalSettings.enemyCache = new EnemyCache() 
    globalSettings.enemyCache.fetch().then(main)
})




