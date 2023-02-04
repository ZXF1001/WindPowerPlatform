<template>
  <div>
    <div id="container"></div>
  </div>
</template>

<script>
import * as THREE from 'three'
import { GUI } from 'three/addons/libs/lil-gui.module.min.js'

import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { Lut } from 'three/addons/math/Lut.js'
export default {
  data() {
    return {}
  },
  methods: {},

  mounted() {
    let container
    let perpCamera, orthoCamera, renderer, lut
    let mesh, sprite
    let scene, uiScene
    init()

    function init() {
      container = document.getElementById('container')

      scene = new THREE.Scene()
      scene.background = new THREE.Color(0xffffff)

      uiScene = new THREE.Scene()

      lut = new Lut()

      const width = window.innerWidth
      const height = window.innerHeight

      perpCamera = new THREE.PerspectiveCamera(60, width / height, 1, 100)
      perpCamera.position.set(0, 0, 10)
      scene.add(perpCamera)

      orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 1, 2)
      orthoCamera.position.set(-0.5, 0, 1)

      sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: new THREE.CanvasTexture(lut.createCanvas()),
        })
      )
      sprite.scale.x = 0.1
      uiScene.add(sprite)

      mesh = new THREE.Mesh(
        undefined,
        new THREE.MeshLambertMaterial({
          side: THREE.DoubleSide,
          color: 0xf5f5f5,
          vertexColors: true, // 顶点着色
        })
      )
      scene.add(mesh)

      loadModel()

      const pointLight = new THREE.PointLight(0xffffff, 1)
      perpCamera.add(pointLight)

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.autoClear = false
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(width, height)
      container.appendChild(renderer.domElement)

      const controls = new OrbitControls(perpCamera, renderer.domElement)
      controls.addEventListener('change', render)
    }

    function render() {
      renderer.clear()
      renderer.render(scene, perpCamera)
      renderer.render(uiScene, orthoCamera)
    }

    function loadModel() {
      const loader = new THREE.BufferGeometryLoader()
      loader.load(
        'https://raw.githubusercontent.com/mrdoob/three.js/master/examples/models/json/pressure.json',
        function (geometry) {
          console.log(geometry)
          geometry.center()
          geometry.computeVertexNormals()

          // default color attribute
          const colors = []

          for (let i = 0, n = geometry.attributes.position.count; i < n; ++i) {
            colors.push(1, 1, 1)
          }

          geometry.setAttribute(
            'color',
            new THREE.Float32BufferAttribute(colors, 3)
          )

          mesh.geometry = geometry
          updateColors()

          render()
        }
      )
    }

    function updateColors() {
      lut.setColorMap('rainbow')
      lut.setMax(2000)
      lut.setMin(0)

      const geometry = mesh.geometry
      const pressures = geometry.attributes.pressure
      const colors = geometry.attributes.color

      for (let i = 0; i < pressures.array.length; i++) {
        const colorValue = pressures.array[i]

        const color = lut.getColor(colorValue)

        if (color === undefined) {
          console.log('Unable to determine color for value:', colorValue)
        } else {
          colors.setXYZ(i, color.r, color.g, color.b)
        }
      }

      colors.needsUpdate = true
    }
  },
}
</script>
<style lang="less" scoped>
#container {
  width: 100%;
  height: calc(100vh - 155px);
}
</style>