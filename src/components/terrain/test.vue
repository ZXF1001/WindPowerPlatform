<template>
  <div>
    <el-button @click="test">test</el-button>
    <div id="container"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import readRemoteCSV from '@/utils/readCSV'
export default {
  data() {
    return {
      container: null,
      camera: null,
      controls: null,
      scene: null,
      renderer: null,
      mesh: null,
      texture: null,
      animationID: null,
    }
  },
  methods: {
    test() {},
    fetchData() {
      readRemoteCSV('http://localhost:8080/example/DEM/2dDEM.csv', (res) => {
        const jsonData = res.data
        if (jsonData[jsonData.length - 1][0] === '') {
          jsonData.pop()
        }
        const width = jsonData[0].length //x方向数据数量
        const height = jsonData.length //z向数据数量
        // 创建y高度数据
        const data = new Float32Array(width * height)
        for (let i = 0; i < height; i++) {
          const rowData = jsonData[i]
          for (let j = 0; j < width; j++) {
            const heightData = rowData[j]
            const index = i * width + j
            data[index] = heightData
          }
        }
        console.log('进入init')
        this.init(width, height, data)
      })
    },
    init(worldWidth, worldDepth, data) {
      console.log(data)
      const that = this
      const worldHalfWidth = worldWidth / 2,
        worldHalfDepth = worldDepth / 2
      this.container = document.getElementById('container')
      // 渲染器对象
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(
        this.container.clientWidth,
        this.container.clientHeight
      )
      // 添加canvas容器
      this.container.appendChild(this.renderer.domElement)
      // 场景对象
      this.scene = new THREE.Scene()
      this.scene.background = new THREE.Color(0xbfd1e5)
      // 摄像机对象
      this.camera = new THREE.PerspectiveCamera(
        60,
        this.container.clientWidth / this.container.clientHeight,
        50,
        200000
      )
      // 拖拽控制器对象
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
      // this.controls.minDistance = 10
      // this.controls.maxDistance = 10000000
      this.controls.maxPolarAngle = Math.PI / 2
      this.controls.target.y =
        data[worldHalfWidth + worldHalfDepth * worldWidth] + 500
      this.camera.position.y = this.controls.target.y + 4000
      this.camera.position.x = 5000
      this.controls.update()
      // 定义几何对象
      const geometry = new THREE.PlaneGeometry(
        worldWidth * 10,
        worldDepth * 10,
        worldWidth - 1,
        worldDepth - 1
      )
      geometry.rotateX(-Math.PI / 2)
      // 这里直接修改plane的y坐标，即高度坐标
      const vertices = geometry.attributes.position.array
      for (let i = 0, l = vertices.length; i < l; i++) {
        vertices[3 * i + 1] = data[i]
      }
      geometry.computeVertexNormals()
      // // 纹理贴图对象
      // this.texture = new THREE.CanvasTexture(
      //   generateTexture(data, worldWidth, worldDepth)
      // )
      // this.texture.wrapS = THREE.ClampToEdgeWrapping
      // this.texture.wrapT = THREE.ClampToEdgeWrapping
      // 组装成Mesh并添加到场景
      this.mesh = new THREE.Mesh(
        geometry,
        // new THREE.MeshPhongMaterial({ map: this.texture })
        new THREE.MeshLambertMaterial({ color: 0xc7c7c7 })
      )
      this.mesh.receiveShadow = true
      this.mesh.castShadow = true
      this.scene.add(this.mesh)
      // 光源对象
      const light = new THREE.DirectionalLight(0xffffff, 1)
      light.position.set(2500, 1500, 0)
      this.scene.add(light)

      // 动画循环
      animate()

      // function generateTexture(data, width, height) {
      //   // bake lighting into texture

      //   let context, image, imageData, shade

      //   const vector3 = new THREE.Vector3(0, 0, 0)

      //   const sun = new THREE.Vector3(1, 1, 1)
      //   sun.normalize()

      //   const canvas = document.createElement('canvas')
      //   canvas.width = width
      //   canvas.height = height

      //   context = canvas.getContext('2d')
      //   context.fillStyle = '#000'
      //   context.fillRect(0, 0, width, height)

      //   image = context.getImageData(0, 0, canvas.width, canvas.height)
      //   imageData = image.data

      //   for (let i = 0, j = 0, l = imageData.length; i < l; i += 4, j++) {
      //     vector3.x = data[j - 2] - data[j + 2]
      //     vector3.y = 2
      //     vector3.z = data[j - width * 2] - data[j + width * 2]
      //     vector3.normalize()

      //     shade = vector3.dot(sun)

      //     imageData[i] = (96 + shade * 128) * (0.5 + data[j] * 0.007)
      //     imageData[i + 1] = (32 + shade * 96) * (0.5 + data[j] * 0.007)
      //     imageData[i + 2] = shade * 96 * (0.5 + data[j] * 0.007)
      //   }

      //   context.putImageData(image, 0, 0)

      //   // Scaled 4x

      //   const canvasScaled = document.createElement('canvas')
      //   canvasScaled.width = width * 4
      //   canvasScaled.height = height * 4

      //   context = canvasScaled.getContext('2d')
      //   context.scale(4, 4)
      //   context.drawImage(canvas, 0, 0)

      //   image = context.getImageData(
      //     0,
      //     0,
      //     canvasScaled.width,
      //     canvasScaled.height
      //   )
      //   imageData = image.data

      //   for (let i = 0, l = imageData.length; i < l; i += 4) {
      //     const v = ~~(Math.random() * 5)

      //     imageData[i] += v
      //     imageData[i + 1] += v
      //     imageData[i + 2] += v
      //   }

      //   context.putImageData(image, 0, 0)

      //   return canvasScaled
      // }
      function animate() {
        that.animationID = requestAnimationFrame(animate)
        that.renderer.render(that.scene, that.camera)
      }
    },
  },

  mounted() {
    this.fetchData()
    // this.init(6, 6)
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
  height: calc(100vh - 210px);
}
</style>