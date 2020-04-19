// https://www.codeandweb.com/free-sprite-sheet-packer
import './styles.css'
import * as THREE from 'three'
import SpriteAnimated3D from './SpriteAnimated3D'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { polarToCartesian } from '@ocio/three-camera-utils'

// INTERESTING
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

function init() {
    const animation = SpriteAnimated3D()
    const { addFrames } = animation.animation
    add(addFrames, 'http://localhost:1234/axeman-blue-row8.png', 46, 1)
    add(addFrames, 'http://localhost:1234/axeman-blue-row7.png', 46, 1)
    add(addFrames, 'http://localhost:1234/axeman-blue-row6.png', 46, 1)
    add(addFrames, 'http://localhost:1234/axeman-blue-row5.png', 46, 1)
    add(addFrames, 'http://localhost:1234/axeman-blue-row4.png', 46, 1)
    add(addFrames, 'http://localhost:1234/axeman-blue-row3.png', 46, 1)
    add(addFrames, 'http://localhost:1234/axeman-blue-row2.png', 46, 1)
    add(addFrames, 'http://localhost:1234/axeman-blue-row1.png', 46, 1)

    const iddle_loops = []
    const attack_loops = []
    const run_loops = []
    for (let i = 0; i < 8; ++i) {
        iddle_loops.push({
            start: 46 * i,
            end: 46 * i,
            orientation: 45 * i * DEG2RAD,
        })
        attack_loops.push({
            start: 46 * i,
            end: 46 * i + 29,
            orientation: 45 * i * DEG2RAD,
        })
        run_loops.push({
            start: 46 * i + 29 + 1,
            end: 46 * i + 29 + 15 + 1,
            orientation: 45 * i * DEG2RAD,
        })
    }

    animation.createLoop('iddle', iddle_loops)
    animation.createLoop('attack', attack_loops)
    animation.createLoop('run', run_loops)

    // animation.createLoop('attack', [
    //     { start: 0, end: 29, orientation: 0 * DEG2RAD },
    //     { start: 46, end: 75, orientation: 45 * DEG2RAD },
    // ])

    // animation.createLoop('run', [
    //     { start: 30, end: 45, orientation: 0 * DEG2RAD },
    // ])

    // animation.createLoop('run', [
    //     { start: 0, end: 29, orientation: 0 * DEG2RAD },
    //     { start: 30, end: 59, orientation: 90 * DEG2RAD },
    //     { start: 60, end: 89, orientation: 180 * DEG2RAD },
    //     { start: 90, end: 119, orientation: 270 * DEG2RAD },
    // ])

    return animation
}

function add(
    addFrames,
    url,
    framesHorizontal,
    framesVertical,
    flipHorizontal = false,
    flipVertical = false,
    fps = 30
) {
    const loader = new THREE.TextureLoader()
    const material = new THREE.SpriteMaterial({ map: loader.load(url) })
    material.map.minFilter = THREE.LinearFilter
    addFrames({
        material,
        framesHorizontal,
        framesVertical,
        flipHorizontal,
        flipVertical,
        frameDisplayDuration: 1000 / fps, // 30 frames per second,
    })
}

// NOT INTERESTING
// NOT INTERESTING
// NOT INTERESTING

const cameraPosition = polarToCartesian(35, 45, 200)
const scene = new THREE.Scene()
const scene_sprites = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
const camera = new THREE.PerspectiveCamera(
    5, // fov
    window.innerWidth / window.innerHeight, // aspect
    1, // near
    999999 // far
)
const controls = new OrbitControls(camera, renderer.domElement)
camera.position.set(cameraPosition.x, cameraPosition.y, cameraPosition.z)
camera.lookAt(new THREE.Vector3(0, 0, 0))
renderer.setSize(window.innerWidth, window.innerHeight)

// geometry
const grid = new THREE.GridHelper(50, 50, 0x426800, 0x426800)
const axis = new THREE.AxesHelper()
axis.scale.set(5, 5, 5)
scene.add(grid)
scene.add(axis)

document.body.appendChild(renderer.domElement)

const { animation, update, setRotation, setRotationCamera, goto } = init()
const scale = 5
window.soldier = animation
window.goto = goto
window.setRotation = setRotation
animation.sprites.position.y = 0.5
animation.sprites.scale.set(scale, scale, scale)
scene.add(animation.sprites)

controls.addEventListener('change', (e) => {
    const { angleH } = cartesianToPolar(camera.position)
    setRotationCamera(angleH * DEG2RAD)
})

function cartesianToPolar({ x, y, z }) {
    const angleH = Math.atan2(x, z) * RAD2DEG
    return { angleH: angleH < 0 ? 360 + angleH : angleH }
}

// animate
const clock = new THREE.Clock()
function animate(time) {
    ;[scene_sprites, scene].forEach((scene) => {
        renderer.render(scene, camera)
        // renderer.clearDepth()
    })

    controls.update()
    requestAnimationFrame(animate)

    const delta = clock.getDelta()
    update(delta)

    // console.log(
    //     'horizontal',
    //     Math.round(cartesianToPolar(camera.position, 1)[0])
    //     // Math.round(controls.getAzimuthalAngle() * RAD2DEG)
    // )

    // console.log(
    //     'vertical',
    //     Math.round(cartesianToPolar(camera.position, 1)[1])
    //     // Math.round(controls.getPolarAngle() * RAD2DEG)
    // )
}

animate()
