// https://www.codeandweb.com/free-sprite-sheet-packer
import './styles.css'
import * as THREE from 'three'
import SpriteAnimated3D from './SpriteAnimated3D'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {
    sphericalToCartesian,
    cartesianToSpherical,
} from '@ocio/three-camera-utils'

const vertical = 35
const horizontal = 0
const radius = 200

// INTERESTING
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

function convertNegativeRadianIntoDouble(rad, max = Math.PI) {
    // if (rad < 0) return max * 2 + rad
    // console.log(rad)
    return rad
}

function init() {
    const animation = SpriteAnimated3D()
    const { addFrames } = animation.animation
    add(addFrames, 'http://localhost:1234/axeman-blue.png', 46, 8)

    const iddle_loops = []
    const attack_loops = []
    const run_loops = []
    for (let i = 0; i < 8; ++i) {
        const orientation = 45 * i //> 180 ? (360 - 45 * i) * -1 : 45 * i
        console.log({ orientation })

        iddle_loops.push({
            start: 46 * i,
            end: 46 * i,
            orientation: orientation * DEG2RAD,
        })
        attack_loops.push({
            start: 46 * i,
            end: 46 * i + 29,
            orientation: orientation * DEG2RAD,
        })
        run_loops.push({
            start: 46 * i + 29 + 1,
            end: 46 * i + 29 + 15 + 1,
            orientation: orientation * DEG2RAD,
        })
    }

    animation.createLoop('iddle', iddle_loops)
    animation.createLoop('attack', attack_loops)
    animation.createLoop('run', run_loops)

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
    material.map.minFilter = THREE.NearestFilter
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

const cameraPosition = sphericalToCartesian({
    vertical: vertical * DEG2RAD,
    horizontal: horizontal * DEG2RAD,
    radius,
})

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

const { animation, update, setRotation, goto } = init()
const scale = 5
window.soldier = animation
window.goto = goto
window.setRotationSoldier = (rotation) => {
    soldierRotation = rotation
    updateCamera()
}
animation.sprites.position.y = 0.5
animation.sprites.scale.set(scale, scale, scale)
scene.add(animation.sprites)

let soldierRotation = 0
let cameraRotation = 0
controls.addEventListener('change', (e) => {
    const { horizontal } = cartesianToSpherical(camera.position)
    cameraRotation = convertNegativeRadianIntoDouble(horizontal)
    updateCamera()
})

function updateCamera() {
    const rotation = soldierRotation + cameraRotation
    // console.log('updateCamera', {
    //     soldierRotation: soldierRotation * RAD2DEG,
    //     cameraRotation: cameraRotation * RAD2DEG,
    //     rotation: rotation * RAD2DEG,
    // })
    setRotation(rotation)
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
    //     Math.round(cartesianToSpherical(camera.position, 1)[0])
    //     // Math.round(controls.getAzimuthalAngle() * RAD2DEG)
    // )

    // console.log(
    //     'vertical',
    //     Math.round(cartesianToSpherical(camera.position, 1)[1])
    //     // Math.round(controls.getPolarAngle() * RAD2DEG)
    // )
}

animate()
