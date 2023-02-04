<template>
  <div>
    <div id="container"></div>
  </div>
</template>

<script>
import { fromUrl } from 'geotiff'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Lut } from 'three/addons/math/Lut.js'
export default {
  data() {
    return {
      container: null,
      camera: null,
      orthoCamera: null,
      lut: null,
      controls: null,
      scene: null,
      uiScene: null,
      renderer: null,
      mesh: null,
      animationID: null,
    }
  },
  methods: {
    fetchTIFF() {
      // 使用匿名函数的写法
      (async () => {
        console.log('加载DEM')
        const url = 'http://1.117.224.40/geotiff/test_compress.tif'
        const tiff = await fromUrl(url)
        const image = await tiff.getImage()
        const bbox = image.getBoundingBox()
        const rastersData = await image.readRasters()
        console.log('加载完成，正在渲染')
        this.createTHREE(bbox, rastersData)
      })()
    },

    createTHREE(boundingBox, rastersData) {
      // 角度转弧度
      function D2R(deg) {
        const rad = (deg * Math.PI) / 180
        return rad
      }

      // 模型真实尺寸计算，单位统一为m
      function calcWH(boundingBox) {
        const lngMin = boundingBox[0]
        const lngMax = boundingBox[2]
        const latMin = boundingBox[1]
        const latMax = boundingBox[3]

        const earthRadius = 6371393 //地球半径，用于计算区域边界的真实距离
        const WEdistance = Math.round(
          earthRadius *
            Math.cos(D2R(latMin + latMax) / 2) *
            D2R(lngMax - lngMin)
        )
        const NSdistance = Math.round(earthRadius * D2R(latMax - latMin))
        return { WEdistance, NSdistance }
      }

      // 这里直接修改plane的y坐标，即高度坐标，并将高度数据用于画图
      function reshapePlane(geometry, data) {
        const vertices = geometry.attributes.position.array
        for (let i = 0; i < data.length; i++) {
          vertices[3 * i + 1] = data[i]
        }
        geometry.attributes.position.array = vertices
        const colors = new Array(3 * data.length).fill(1)
        geometry.setAttribute(
          'color',
          new THREE.Float32BufferAttribute(colors, 3)
        )
        geometry.computeVertexNormals()
        return geometry
      }
      // 获取typed array的最大最小值
      function getMinAndMax(data) {
        let min,
          max = data[0]
        for (let i = 0; i < data.length; i++) {
          min = min < data[i] ? min : data[i]
          max = max > data[i] ? max : data[i]
        }
        return { min, max }
      }

      function colorGeometry(data, geometry, lut) {
        for (let i = 0; i < data.length; i++) {
          const colorValue = data[i]
          const rgb = lut.getColor(colorValue)
          geometry.attributes.color.setXYZ(i, rgb.r, rgb.g, rgb.b)
        }
        geometry.attributes.color.needsUpdate = true
      }

      const init = (boundingBox, rastersData) => {
        const { WEdistance, NSdistance } = calcWH(boundingBox)
        const rasterWidth = rastersData.width,
          rasterHeight = rastersData.height
        const data = rastersData[0]

        this.container = document.getElementById('container')
        // 渲染器对象
        this.renderer = new THREE.WebGLRenderer({ antialias: true })
        this.renderer.setSize(
          this.container.clientWidth,
          this.container.clientHeight
        )
        this.renderer.autoClear = false
        this.renderer.shadowMap.enabled = true
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap
        this.container.appendChild(this.renderer.domElement)
        // 场景对象
        this.scene = new THREE.Scene()
        this.scene.background = new THREE.Color('#bfd1e5')
        // 摄像机对象
        const fov = 35
        const aspect = this.container.clientWidth / this.container.clientHeight
        const near = 50
        const far = 500000
        this.camera = new THREE.PerspectiveCamera(fov, aspect, near, far)
        this.camera.position.set(0, 0.8 * WEdistance, 0.8 * WEdistance) // 第二个坐标是高度，第三个坐标是前后
        this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2)
        this.orthoCamera.position.set(-0.9, 0, 1)
        // 拖拽控制器对象
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.minDistance = near
        this.controls.maxDistance = far
        this.controls.maxPolarAngle = Math.PI / 2
        this.controls.target.y = data[Math.floor(data.length / 2)] + 1000
        this.controls.update()
        // 定义几何对象
        let geometry = new THREE.PlaneGeometry(
          WEdistance,
          NSdistance,
          rasterWidth - 1,
          rasterHeight - 1
        )
        geometry.rotateX(-Math.PI / 2)
        geometry = reshapePlane(geometry, data)
        //设置颜色映射表
        this.uiScene = new THREE.Scene()
        this.lut = new Lut()
        this.lut.setColorMap('rainbow')
        const { min, max } = getMinAndMax(data)
        this.lut.setMax(max)
        this.lut.setMin(min)
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(this.lut.createCanvas()),
          })
        )
        sprite.scale.x = 0.04
        this.uiScene.add(sprite)

        // 设置模型颜色

        colorGeometry(data, geometry, this.lut)

        // 组装成Mesh
        this.mesh = new THREE.Mesh(
          geometry,
          new THREE.MeshLambertMaterial({
            color: 0xc7c7c7,
            vertexColors: true,
          })
        )
        this.mesh.receiveShadow = true
        this.mesh.castShadow = true
        this.scene.add(this.mesh)
        // 坐标轴指示，后面删掉
        const axesHelper = new THREE.AxesHelper(NSdistance)
        this.scene.add(axesHelper)
        // 光源对象
        const light = new THREE.DirectionalLight('#fff', 1)
        light.position.set(5, 3, 0)
        light.castShadow = true
        this.scene.add(light)

        const gridHelper = new THREE.GridHelper(1.25 * WEdistance, 50)
        this.scene.add(gridHelper)
        // 自适应窗口尺寸
        window.onresize = () => {
          const newAspect =
            this.container.clientWidth / this.container.clientHeight
          this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
          )
          this.camera.aspect = newAspect
          this.camera.updateProjectionMatrix()
          this.orthoCamera.aspect = newAspect
          this.orthoCamera.updateProjectionMatrix()
        }
      }
      // 动画循环
      const animate = () => {
        this.animationID = requestAnimationFrame(animate)
        this.renderer.render(this.scene, this.camera)
        this.renderer.render(this.uiScene, this.orthoCamera)
      }

      init(boundingBox, rastersData)
      animate()
    },
  },

  mounted() {
    this.fetchTIFF()
  },
  beforeDestroy() {
    this.mesh.remove()
    this.scene.clear()
    this.uiScene.clear()
    this.renderer.dispose()
    this.renderer.forceContextLoss()
    this.renderer.content = null
    cancelAnimationFrame(this.animationID)
  },
}
</script>
<style lang="less" scoped>
#container {
  width: 100%;
  height: calc(100vh - 155px);
}
</style>