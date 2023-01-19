<template>
  <div>
    <el-button @click="test">test</el-button>
    <div id="container"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
export default {
  data() {
    return {
      camera: null,
      scene: null,
      renderer: null,
      mesh: null,
      controls: null,
    }
  },
  methods: {
    test() {},
    //初始化
    init() {
      let container = document.getElementById('container') // 获取绘图区域的dom
      this.scene = new THREE.Scene() // Scene对象
      this.camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      ) // Camera对象
      this.renderer = new THREE.WebGLRenderer({ antialias: true }) // Render对象
      this.renderer.setSize(container.clientWidth, container.clientHeight)
      container.appendChild(this.renderer.domElement)

      const geometry = new THREE.BoxGeometry(1, 1, 1) // Geometry对象
      const material = new THREE.MeshNormalMaterial({
        color: 'white',
      }) // Material对象
      this.mesh = new THREE.Mesh(geometry, material) // Mesh对象
      this.scene.add(this.mesh)

      this.camera.position.z = 10
      this.controls = new OrbitControls(this.camera, this.renderer.domElement) // 拖拽Controller对象
    },
    animate() {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
    },
  },

  mounted() {
    this.init()
    this.animate()
  },
}
</script>
<style lang="less" scoped>
#container {
  width: 100%;
  height: calc(100vh - 210px);
}
</style>