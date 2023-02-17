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
    createTHREE(boundingBox, rastersData) {
      const { WEdistance, NSdistance } = calcWH(boundingBox)
      const rasterWidth = rastersData.width
      const rasterHeight = rastersData.height
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
      const centerHeight = data[Math.floor(data.length / 2)]
      this.controls.target.y = centerHeight + 1000
      this.controls.update()
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
      // 定义几何对象
      let geometry = new THREE.PlaneGeometry(
        WEdistance,
        NSdistance,
        rasterWidth - 1,
        rasterHeight - 1
      )
      geometry.rotateX(-Math.PI / 2)
      geometry = reshapePlane(geometry, data)
      colorGeometry(data, geometry, this.lut) // 设置模型颜色

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

      //方向箭头提示
      const Ndir = new THREE.Vector3(0, 0, -1)
      const origin = new THREE.Vector3(0, 10000, -NSdistance / 2)
      const length = 10000
      const hex = '#ff0'
      const arrowHelper = new THREE.ArrowHelper(Ndir, origin, length, hex)
      this.scene.add(arrowHelper)

      // 坐标轴指示，后面删掉
      const axesHelper = new THREE.AxesHelper(WEdistance)
      this.scene.add(axesHelper)
      const gridHelper = new THREE.GridHelper(1.25 * WEdistance, 50)
      this.scene.add(gridHelper)

      // 光源对象
      const light = new THREE.DirectionalLight('#fff', 1)
      light.position.set(5, 3, 0)
      light.castShadow = true
      this.scene.add(light)

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
      // 开始动画循环
      const that = this
      animate()

      // 角度转弧度
      function D2R(deg) {
        const rad = (deg * Math.PI) / 180
        return rad
      }

      // 模型真实尺寸的计算，单位统一为m
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
      // 动画循环
      function animate() {
        that.animationID = requestAnimationFrame(animate)
        // main scene

        // that.renderer.clear()
        that.renderer.setViewport(
          0,
          0,
          that.container.clientWidth,
          that.container.clientHeight
        )
        that.renderer.render(that.scene, that.camera)
        that.renderer.render(that.uiScene, that.orthoCamera)

        // that.renderer.setScissor(20, 20, 1000, 1000)

        // that.renderer.setViewport(20, 20, 100, 100)
        let insetWidth = that.container.clientWidth / 4
        let insetHeight = that.container.clientHeight / 4
        that.renderer.setClearColor(0x222222, 1)
        that.renderer.clearDepth() // important!

        //! 左下角的小图
        // that.renderer.setScissorTest(true)
        // that.renderer.setScissor(20, 20, insetWidth, insetHeight)
        // that.renderer.setViewport(20, 20, insetWidth, insetHeight)
        // that.renderer.render(that.scene, that.camera)
        // that.renderer.setScissorTest(false)
      }
    },
  },

  mounted() {
    async function fetchTIFF(url, callback) {
      const tiff = await fromUrl(url)
      const image = await tiff.getImage()
      const boundingBox = image.getBoundingBox()
      const rastersData = await image.readRasters()
      callback(boundingBox, rastersData)
    }
    // 传入url和回调函数，渲染三维模型
    const url = 'http://1.117.224.40/geotiff/test_compress.tif'
    fetchTIFF(url, this.createTHREE)
  },
  beforeDestroy() {
    if (this.mesh) this.mesh.remove()
    if (this.scene) this.scene.clear()
    if (this.uiScene) this.uiScene.clear()
    if (this.renderer) {
      this.renderer.dispose()
      this.renderer.forceContextLoss()
      this.renderer.content = null
    }
    if (this.animationID) cancelAnimationFrame(this.animationID)
    window.onresize = () => {}
  },
}
</script>
<style lang="less" scoped>
#container {
  width: 100%;
  height: calc(100vh - 155px);
}
</style>