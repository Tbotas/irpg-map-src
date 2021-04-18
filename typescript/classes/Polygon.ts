import { pointInsidePolygon } from "../helpers"
import { fabric } from 'fabric'
import { Area, Region } from "../types/types"

// todo move scale globally
const DEFAULT_SCALE: number = 0.2

class Polygon {
    base: fabric.Polygon
    canvas: fabric.Canvas
    positionOffset: { left: number, top: number }
    isActive: boolean
    level: number
    xpMulti: number
    area: Area

    constructor (canvas: fabric.Canvas, area: Area, path: Array<{ x: number, y: number }>, areaPosition: { left: number, top: number }) {
        this.positionOffset = { left: area.region.imageOffset.left * DEFAULT_SCALE, top: area.region.imageOffset.top * DEFAULT_SCALE }
        
        let base: fabric.Polygon = new fabric.Polygon(path, {
            fill: 'transparent',
            stroke: 'blue',
            hasControls: false,
            selectable: false,
            originX: 'center',
            originY: 'center',
            scaleX: DEFAULT_SCALE,
            scaleY: DEFAULT_SCALE,
            strokeWidth: DEFAULT_SCALE * 20,
            opacity: 1,
            top: areaPosition.top + this.positionOffset.top,
            left: areaPosition.left + this.positionOffset.left,
        })

        this.base = base
        this.canvas = canvas
        this.isActive = false
        this.area = area
    }
    
    addToCanvas(): void {
        this.canvas.add(this.base)
    }
    
    onClick(): void {
        this.isActive = !this.isActive

        if (this.isActive) {
            this.setProperty('stroke', 'green')
        } else {
            this.setProperty('stroke', 'blue')
        }
    }

    resetClicked(): void {
        this.setProperty('stroke', 'blue')
        this.isActive = false
    }
    
    isPointInsidePerimeter(point: fabric.Point) {
        return pointInsidePolygon(point, this.perimeter)
    }

    get perimeter(): fabric.Point[] {
        return this.base.points.map(p => 
            {
                let newPoint: any = { x: p.x * DEFAULT_SCALE + this.positionOffset.left, y: p.y * DEFAULT_SCALE + this.positionOffset.top }
                return fabric.util.transformPoint(newPoint, this.canvas.viewportTransform)
            }
        )
    }

    setProperty(property: any, value: string | number) {
        this.base.set(property, value)
    }
}

export { Polygon }