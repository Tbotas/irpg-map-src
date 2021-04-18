import { fabric } from 'fabric'
import { Polygon } from "./Polygon";
import { Area, Region, WorldDataJSON } from "../types/types"

class PolygonGroup {
    polygons: Polygon[]
    canvas: fabric.Canvas
    group: fabric.Group

    isActive: boolean
    area: Area


    constructor(canvas: fabric.Canvas) {
        this.canvas = canvas
        this.polygons = []
        this.isActive = false
    }
    
    addPolygons(area: Area) {
        for (let i = 0; i < area.group.length; i++) {
            this.polygons.push(new Polygon(this.canvas, area, area.group[i], area.groupPositions[i]))
        }

        this.area = area
    }

    setProperty(property: any, value: string | number) {
        for (let poly of this.polygons) {
            poly.setProperty(property, value)
        }
    }

    createGroup(): fabric.Group {
        let fabricPolygons: fabric.Polygon[] = this.polygons.map(p => p.base)
        this.group = new fabric.Group(fabricPolygons, {
            selectable: false,
            hasControls: false,
        })
        return this.group
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
 
    addToCanvas() {
        this.canvas.add(this.group)
    }

    isPointInsidePerimeter(point: fabric.Point) {
        for (let poly of this.polygons) {
            if (poly.isPointInsidePerimeter(point)) {
                return true
            }
        }

        return false
    }
}

export { PolygonGroup }