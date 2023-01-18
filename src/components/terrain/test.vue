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
      //  创建场景对象Scene

      let container = document.getElementById('container')
      this.scene = new THREE.Scene()
      this.camera = new THREE.PerspectiveCamera(
        75,
        container.clientWidth / container.clientHeight,
        0.1,
        1000
      )
      this.renderer = new THREE.WebGLRenderer({ antialias: true })
      this.renderer.setSize(container.clientWidth, container.clientHeight)
      container.appendChild(this.renderer.domElement)
      //网格模型添加到场景中
      const geometry = new THREE.BoxGeometry(1, 1, 1)
      const material = new THREE.MeshNormalMaterial({
        color: 'white',
      })
      this.mesh = new THREE.Mesh(geometry, material)
      this.scene.add(this.mesh)

      this.camera.position.z = 10

      this.animate()

      // //创建控件对象
      this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    },
    animate() {
      requestAnimationFrame(this.animate)
      this.renderer.render(this.scene, this.camera)
    },
  },

  mounted() {
    this.init()
  },
}
</script>
<style lang="less" scoped>
#container {
  width: 100%;
  height: calc(100vh - 210px);
}
</style>