import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { fabric } from 'fabric'
import styled from 'styled-components'
import 'fabric-history'

import { debounce } from '../../utils/debounce'
import { UploadButton } from '../UploadButton'
import { getBase64 } from '../../utils/imageUtils'
import { Button } from '../UI/Button'
import DownloadIcon from '../icons/DownloadIcon'
import BrushIcon from '../icons/BrushIcon'
import EraserIcon from '../icons/EraserIcon'
import { savePrompt, SourceProcessing } from '../../utils/promptUtils'
import UndoIcon from '../icons/UndoIcon'
import RedoIcon from '../icons/RedoIcon'
import { useEffectOnce } from '../../hooks/useEffectOnce'
import {
  getCanvasStore,
  getI2IString,
  storeCanvas
} from '../../store/canvasStore'
import Uploader from '../CreatePage/Uploader'
import { inputCSS } from 'react-select/dist/declarations/src/components/Input'

const maxSize = {
  height: 768,
  width: 512
}

interface IHistory {
  path: fabric.Path
  drawPath?: fabric.Path
  visibleDrawPath?: fabric.Path
}

let redoHistory: Array<IHistory> = []
let undoHistory: Array<IHistory> = []

interface CanvasProps {
  ref: any
}

interface LayerParams {
  absolute?: boolean
  fill?: string
  image?: fabric.Image
  layerHeight?: number
  layerWidth?: number
  opacity?: number
}

const StyledCanvas = styled.canvas<CanvasProps>`
  border: 1px solid ${(props) => props.theme.border};
`

interface Props {
  input: any
  setInput: any
}

const Inpaint = ({ input, setInput }: Props) => {
  const router = useRouter()

  const [hasImage, setHasImage] = useState(false)
  const [drawMode, setDrawMode] = useState<string>('paint')

  const brushRef = useRef<any>(null)
  const drawModeRef = useRef<string>('paint')

  const brushPreviewRef = useRef<fabric.Circle | null>(null)
  const canvasElementRef = useRef<HTMLCanvasElement | null>(null)

  const canvasRef = useRef<fabric.Canvas | null>(null)
  const drawLayerRef = useRef<any | null>(null)
  const imageLayerRef = useRef<any | null>(null)
  const visibleDrawLayerRef = useRef<any | null>(null)

  const asyncClone = async (object: any) => {
    return new Promise(function (resolve, reject) {
      try {
        object.clone(function (cloned_object: any) {
          resolve(cloned_object)
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  interface IFileSelect {
    file: any
    skipRead: boolean
    skipSetup: boolean
  }

  const handleFileSelect = async ({
    file,
    skipRead = false,
    skipSetup = false
  }: IFileSelect) => {
    if (typeof window === 'undefined') {
      return
    }

    if (!file) {
      return
    }

    if (!canvasRef.current) {
      return
    }

    let resizedImage
    let fullDataString: string = ''

    if (!skipRead) {
      const { readAndCompressImage } = await import('browser-image-resizer')
      resizedImage = await readAndCompressImage(file, {
        quality: 0.9,
        maxWidth: 1024,
        maxHeight: 1024
      })

      if (file) {
        fullDataString = await getBase64(resizedImage)
        storeCanvas('imageLayerRef', fullDataString)
      }
    } else {
      fullDataString = file
    }

    if (!fullDataString) {
      return
    }

    fabric.Image.fromURL(fullDataString, function (image) {
      if (!canvasRef.current) {
        return
      }
      resetCanvas()

      const maxSize = 768
      let height = image.height || maxSize
      let width = image.width || maxSize

      if (width !== maxSize || height !== maxSize) {
        if (width > height) {
          image.scaleToWidth(maxSize)
          height = maxSize * (height / width)
          width = maxSize
        } else {
          image.scaleToHeight(maxSize)
          width = maxSize * (width / height)
          height = maxSize
        }
      }

      // Init canvas settings
      canvasRef.current.isDrawingMode = true
      canvasRef.current.setHeight(height)
      canvasRef.current.setWidth(width)

      // Generate various layers
      imageLayerRef.current = makeNewLayer({
        image,
        layerHeight: height,
        layerWidth: width
      })

      if (!skipSetup) {
        drawLayerRef.current = makeInvisibleDrawLayer(height, width)

        visibleDrawLayerRef.current = makeNewLayer({
          layerHeight: height,
          layerWidth: width
        })
        visibleDrawLayerRef.current.set('opacity', 0.8)

        // Add to Canvas
        canvasRef?.current?.add(imageLayerRef.current)
        canvasRef?.current?.add(visibleDrawLayerRef.current)
      }

      if (brushPreviewRef.current) {
        canvasRef?.current?.add(brushPreviewRef.current)
      }
    })
  }

  const downloadWebp = (base64Data: string, fileName = 'test') => {
    const linkSource = `${base64Data}`
    const downloadLink = document.createElement('a')
    downloadLink.href = linkSource
    downloadLink.download = fileName.substring(0, 255) + '.webp' // Only get first 255 characters so we don't break the max file name limit
    downloadLink.click()
  }

  ///////////////////////

  const initCanvas = ({ height = 512, width = 768 } = {}) => {
    canvasRef.current = new fabric.Canvas(canvasElementRef.current, {
      backgroundColor: 'white',
      isDrawingMode: false,
      height,
      width
    })

    canvasRef.current.freeDrawingCursor = 'crosshair'
    canvasRef.current.selection = false
    canvasRef.current.setHeight(height)
    canvasRef.current.setWidth(width)
    makeBrushPreviewLayer()
    setBrush('white')

    canvasRef.current.on('mouse:move', onMouseMove)
    canvasRef.current.on('path:created', onPathCreated)
    canvasRef.current.renderAll()
  }

  const makeBrushPreviewLayer = () => {
    brushPreviewRef.current = new fabric.Circle({
      radius: 20,
      left: 0,
      originX: 'center',
      originY: 'center',
      angle: 0,
      fill: '',
      stroke: 'red',
      strokeWidth: 3,
      opacity: 0
    })
  }

  const makeInvisibleDrawLayer = (height = 512, width = 768) => {
    const newDrawLayer = new fabric.Canvas(null)

    newDrawLayer.backgroundColor = 'black'
    newDrawLayer.selection = false
    newDrawLayer.setHeight(height)
    newDrawLayer.setWidth(width)

    return newDrawLayer
  }

  const makeNewLayer = ({
    absolute = true,
    fill = 'transparent',
    image,
    layerHeight = 512,
    layerWidth = 768,
    opacity = 1
  }: LayerParams = {}) => {
    const newLayer =
      image ||
      new fabric.Rect({
        width: layerWidth,
        height: layerHeight,
        left: 0,
        top: 0,
        fill: fill,
        absolutePositioned: absolute,
        selectable: false
      })

    const newGroup = new fabric.Group([newLayer], {
      selectable: false,
      absolutePositioned: absolute,
      opacity
    })

    return newGroup
  }

  const debounceBrushPreview = debounce(() => {
    if (!brushPreviewRef.current || !canvasRef.current) {
      return
    }

    brushPreviewRef.current.opacity = 0
    try {
      canvasRef?.current?.renderAll()
    } catch (err) {
      console.log(`An oopsie happened!`)
    }
  }, 500)

  const onMouseMove = (event: fabric.IEvent<Event>) => {
    if (!canvasRef.current || !brushPreviewRef.current) {
      return
    }

    const pointer = canvasRef.current.getPointer(event.e)
    brushPreviewRef.current.left = pointer.x
    brushPreviewRef.current.top = pointer.y
    brushPreviewRef.current.opacity = 0.5

    if (drawModeRef.current === 'erase') {
      brushPreviewRef.current.set('strokeWidth', 3)
      brushPreviewRef.current.set('fill', 'red')
      setBrush('red')
    } else {
      brushPreviewRef.current.set('strokeWidth', 0)
      brushPreviewRef.current.set('fill', 'white')
      setBrush('white')
    }

    brushPreviewRef.current.set('radius', 20 / 2)
    debounceBrushPreview()
    canvasRef.current.renderAll()
  }

  const onPathCreated = async (e: any) => {
    const path = { path: e.path }
    await pathCreate(path)
    redoHistory.push(path)

    if (canvasRef.current) {
      let baseCanvas = canvasRef.current.toObject()
      storeCanvas('canvasRef', baseCanvas)

      let drawCanvas = drawLayerRef.current.toObject()
      storeCanvas('drawLayerRef', drawCanvas)

      autoSave()
    }
  }

  const pathCreate = async (newPath: any, eraseOverride = false) => {
    if (
      !canvasRef.current ||
      !drawLayerRef.current ||
      !visibleDrawLayerRef.current
    ) {
      return
    }

    newPath.path.selectable = false
    newPath.path.opacity = 1

    newPath.drawPath = (await asyncClone(newPath.path)) as fabric.Path
    newPath.visibleDrawPath = (await asyncClone(newPath.path)) as fabric.Path

    if (!eraseOverride && drawModeRef.current === 'erase') {
      newPath.visibleDrawPath.globalCompositeOperation = 'destination-out'
      newPath.drawPath.stroke = 'black'
    } else {
      newPath.visibleDrawPath.globalCompositeOperation = 'source-over'
    }
    drawLayerRef.current.add(newPath.drawPath)
    visibleDrawLayerRef.current.addWithUpdate(newPath.visibleDrawPath)
    canvasRef.current.remove(newPath.path)
    canvasRef.current.renderAll()
  }

  const resetCanvas = () => {
    if (!canvasRef.current) {
      return
    }

    if (imageLayerRef.current) {
      canvasRef?.current?.remove(imageLayerRef.current)
      imageLayerRef.current = undefined
    }
    if (drawLayerRef.current) {
      drawLayerRef.current = undefined
    }
    if (visibleDrawLayerRef.current) {
      canvasRef?.current?.remove(visibleDrawLayerRef.current)
      visibleDrawLayerRef.current = undefined
    }
    canvasRef.current.isDrawingMode = false
  }

  const saveImageMask = () => {
    const data = {
      image: '',
      mask: ''
    }

    if (imageLayerRef.current) {
      data.image = imageLayerRef.current
        .toDataURL({ format: 'webp' })
        .split(',')[1]
    }

    if (drawLayerRef.current) {
      data.mask = drawLayerRef.current
        .toDataURL({ format: 'webp' })
        .split(',')[1]
    }

    downloadWebp(drawLayerRef.current.toDataURL({ format: 'webp' }), 'mask')
    downloadWebp(imageLayerRef.current.toDataURL({ format: 'webp' }), 'image')

    return data
  }

  const setBrush = (color?: string) => {
    if (!canvasRef.current) {
      return
    }

    brushRef.current = canvasRef.current.freeDrawingBrush
    brushRef.current.color = color || brushRef?.current?.color
    brushRef.current.width = 20
  }

  const redo = () => {
    if (undoHistory.length === 0) {
      return
    }

    const path = undoHistory.pop() as IHistory
    pathCreate(path, true)
    redoHistory.push(path)
  }

  const undo = () => {
    if (
      redoHistory.length === 0 ||
      !drawLayerRef.current ||
      !visibleDrawLayerRef.current ||
      !canvasRef.current
    ) {
      return
    }

    const path = redoHistory.pop() as IHistory
    undoHistory.push(path)
    drawLayerRef.current.remove(path.drawPath as fabric.Path)
    visibleDrawLayerRef.current.remove(path.visibleDrawPath as fabric.Path)
    delete path.drawPath
    delete path.visibleDrawPath

    // saveImages()
    // updateCanvas()
  }

  /////////////

  const handleToggle = () => {
    if (drawModeRef.current === 'paint') {
      setDrawMode('erase')
      drawModeRef.current = 'erase'
      setBrush('red')
    } else {
      setDrawMode('paint')
      drawModeRef.current = 'paint'
      setBrush('white')
    }
  }

  const autoSave = () => {
    if (!canvasRef.current) {
      return
    }

    const data = {
      image: '',
      mask: ''
    }

    if (imageLayerRef.current) {
      data.image = imageLayerRef.current
        .toDataURL({ format: 'webp' })
        .split(',')[1]
    }

    if (drawLayerRef.current) {
      data.mask = drawLayerRef.current
        .toDataURL({ format: 'webp' })
        .split(',')[1]
    }

    setInput({
      imageType: 'image/webp',
      source_image: data.image,
      source_mask: data.mask,
      source_processing: 'inpainting',
      orientation: 'custom',
      height: canvasRef.current.height,
      width: canvasRef.current.width
    })
  }

  const handleUseImageClick = () => {
    if (!canvasRef.current) {
      return
    }

    const data = {
      image: '',
      mask: ''
    }

    if (imageLayerRef.current) {
      data.image = imageLayerRef.current
        .toDataURL({ format: 'webp' })
        .split(',')[1]
    }

    if (drawLayerRef.current) {
      data.mask = drawLayerRef.current
        .toDataURL({ format: 'webp' })
        .split(',')[1]
    }

    savePrompt({
      imageType: 'image/webp',
      sampler: 'k_euler_a',

      source_processing: SourceProcessing.InPainting,
      source_image: data.image,
      source_mask: data.mask,
      orientation: 'custom',
      height: canvasRef.current.height,
      width: canvasRef.current.width
    })

    router.push(`/?edit=true`)
  }

  useEffectOnce(() => {
    redoHistory = []
    undoHistory = []

    if (!getCanvasStore().canvasRef && getI2IString().base64String) {
      console.log(`BUAHAHAH`)
      initCanvas({ height: getI2IString().height, width: getI2IString().width })

      setTimeout(() => {
        handleFileSelect({
          file: getI2IString().base64String,
          skipRead: true,
          skipSetup: false
        })
      }, 250)
    } else if (getCanvasStore().canvasRef) {
      setHasImage(true)
      const { objects } = getCanvasStore().canvasRef
      initCanvas({ height: objects[0].height, width: objects[0].width })

      console.log(`objects`, objects)

      canvasRef.current.clear()
      canvasRef.current.loadFromJSON(getCanvasStore().canvasRef, () => {
        if (!canvasRef.current) {
          return
        }

        const objects = canvasRef?.current?.getObjects()

        console.log(`objects[1]`, objects[1])

        imageLayerRef.current = objects[0]
        visibleDrawLayerRef.current = objects[1]
        brushPreviewRef.current = objects[2]

        visibleDrawLayerRef.current.set('opacity', 0.8)
        visibleDrawLayerRef.current.set('selectable', false)

        drawLayerRef.current = new fabric.Canvas(null)
        drawLayerRef.current.setHeight(canvasRef.current.height)
        drawLayerRef.current.setWidth(canvasRef.current.width)
        drawLayerRef.current.loadFromJSON(getCanvasStore().drawLayerRef)

        // drawLayerRef.current.backgroundColor = 'black'
        // drawLayerRef.current.selection = false
        // drawLayerRef.current.set('backgroundColor', 'black')
        // newDrawLayer.selection = false

        canvasRef.current.isDrawingMode = true
      })

      setTimeout(function () {
        if (!canvasRef.current) {
          return
        }

        canvasRef.current.setHeight(canvasRef.current.height)
        canvasRef.current.setWidth(canvasRef.current.width)
        canvasRef.current.renderAll(canvasRef.current)
      }, 50)

      // const { objects } = getCanvasStore().canvasRef
      // const [imageLayer] = objects

      // imageLayerRef.current = new fabric.Group(imageLayer)
      // canvasRef?.current?.add(imageLayerRef.current)

      // console.log(`objects?`, objects)
      // canvasRef.current.loadFromJSON(getCanvasStore().canvasRef)
    } else {
      initCanvas()
    }

    // if (getCanvasStore().imageLayerRef) {
    //   setTimeout(() => {
    //     handleFileSelect(getCanvasStore().imageLayerRef, true)
    //   }, 500)
    // }

    // canvasRef.current?.renderAll()
    return () => {
      canvasRef?.current?.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  })

  return (
    <div className="relative">
      <div className="flex flex-row gap-2 mb-2">
        <Button onClick={handleToggle}>
          {drawMode === 'paint' ? <BrushIcon /> : <EraserIcon />}
        </Button>
        <UploadButton label="" handleFile={handleFileSelect} />
        <Button onClick={saveImageMask}>
          <DownloadIcon />
        </Button>
        <Button
          //@ts-ignore
          onClick={() => {
            undo()
          }}
        >
          <UndoIcon />
        </Button>
        <Button
          //@ts-ignore
          onClick={() => {
            redo()
          }}
        >
          <RedoIcon />
        </Button>
        <Button onClick={handleUseImageClick}>USE</Button>
      </div>
      <StyledCanvas id="canvas" ref={canvasElementRef} />
    </div>
  )
}

export default Inpaint
