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
      lut: null,
      controls: null,
      scene: null,
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
      function D2R(deg) {
        // 角度转弧度
        const rad = (deg * Math.PI) / 180
        return rad
      }

      const init = () => {
        const lngMin = boundingBox[0]
        const lngMax = boundingBox[2]
        const latMin = boundingBox[1]
        const latMax = boundingBox[3]

        const earthRadius = 6371393 //地球半径，用于计算区域边界的真实距离
        const geoWidth = Math.round(
          earthRadius *
            Math.cos(D2R(latMin + latMax) / 2) *
            D2R(lngMax - lngMin)
        )
        const geoHeight = Math.round(earthRadius * D2R(latMax - latMin))
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
        this.camera.position.set(0, 0.8 * geoWidth, 0.8 * geoWidth) // 第二个坐标是高度，第三个坐标是前后
        // 拖拽控制器对象
        this.controls = new OrbitControls(this.camera, this.renderer.domElement)
        this.controls.minDistance = near
        this.controls.maxDistance = far
        this.controls.maxPolarAngle = Math.PI / 2
        this.controls.target.y = data[Math.floor(data.length / 2)] + 1000
        this.controls.update()
        // 定义几何对象
        const geometry = new THREE.PlaneGeometry(
          geoWidth,
          geoHeight,
          rasterWidth - 1,
          rasterHeight - 1
        )
        geometry.rotateX(-Math.PI / 2)

        // 这里直接修改plane的y坐标，即高度坐标
        const vertices = geometry.attributes.position.array
        const colors = []
        for (let i = 0; i < data.length; i++) {
          vertices[3 * i + 1] = data[i]
          colors.push(1, 1, 1)
        }

        geometry.setAttribute(
          'color',
          new THREE.Float32BufferAttribute(colors, 3)
        )
        //设置lut
        this.uiScene = new THREE.Scene()
        this.lut = new Lut()

        this.orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2)
        this.orthoCamera.position.set(-0.9, 0, 1)
        const sprite = new THREE.Sprite(
          new THREE.SpriteMaterial({
            map: new THREE.CanvasTexture(this.lut.createCanvas()),
          })
        )
        sprite.scale.x = 0.05

        this.uiScene.add(sprite)
        //todo 需要自动选择最大最小值
        this.lut.setColorMap('rainbow')
        this.lut.setMax(2000)
        this.lut.setMin(0)
        geometry.computeVertexNormals()
        // 设置模型颜色
        //todo 可以和上面的for循环合并
        for (let i = 0; i < data.length; i++) {
          const colorValue = data[i]
          const color = this.lut.getColor(colorValue)
          geometry.attributes.color.setXYZ(i, color.r, color.g, color.b)
        }
        geometry.attributes.color.needsUpdate = true

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
        const axesHelper = new THREE.AxesHelper(geoHeight)
        this.scene.add(axesHelper)
        // 光源对象
        const light = new THREE.DirectionalLight('#fff', 1)
        light.position.set(5, 3, 0)
        light.castShadow = true
        this.scene.add(light)

        const gridHelper = new THREE.GridHelper(1.25 * geoWidth, 50)
        this.scene.add(gridHelper)
        // 自适应窗口尺寸
        window.onresize = () => {
          this.renderer.setSize(
            this.container.clientWidth,
            this.container.clientHeight
          )
          this.camera.aspect = aspect
          this.camera.updateProjectionMatrix()
        }
      }
      // 动画循环
      const animate = () => {
        this.animationID = requestAnimationFrame(animate)
        this.renderer.render(this.scene, this.camera)
        this.renderer.render(this.uiScene, this.orthoCamera)
      }

      init()
      animate()
    },
  },

  mounted() {
    this.fetchTIFF()
  },
  beforeDestroy() {
    this.mesh.remove()
    this.scene.clear()
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