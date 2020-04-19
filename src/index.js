// https://www.codeandweb.com/free-sprite-sheet-packer
import './styles.css'
import * as THREE from 'three'
import SpriteAnimated3D from './SpriteAnimated3D'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { cartesianToPolar, degToRad } from '@ocio/three-camera-utils'

// INTERESTING
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

function init() {
    const animation = SpriteAnimated3D()
    addFrames(animation.animation, 'https://i.ibb.co/k0sw5NS/60.png', 30, 2)
    addFrames(
        animation.animation,
        'https://i.ibb.co/k0sw5NS/60.png',
        30,
        2,
        true
    )

    // animation.createLoop('iddle', [
    //     { start: 0, end: 0, orientation: 0 * DEG2RAD },
    //     { start: 30, end: 30, orientation: 90 * DEG2RAD },
    //     { start: 60, end: 60, orientation: 180 * DEG2RAD },
    //     { start: 90, end: 90, orientation: 270 * DEG2RAD },
    // ])

    animation.createLoop('run', [
        { start: 0, end: 29, orientation: 0 * DEG2RAD },
        { start: 30, end: 59, orientation: 90 * DEG2RAD },
        { start: 60, end: 89, orientation: 180 * DEG2RAD },
        { start: 90, end: 119, orientation: 270 * DEG2RAD },
    ])

    return animation
}

function addFrames(
    soldier,
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

    soldier.addFrames({
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

const cameraPosition = 200
const scene = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
const camera = new THREE.PerspectiveCamera(
    5, // fov
    window.innerWidth / window.innerHeight, // aspect
    1, // near
    999999 // far
)
const controls = new OrbitControls(camera, renderer.domElement)
camera.position.set(0, cameraPosition, cameraPosition)
camera.lookAt(new THREE.Vector3(0, 0, 0))
renderer.setSize(window.innerWidth, window.innerHeight)

// geometry
const grid = new THREE.GridHelper(50, 50, 0x426800, 0x426800)
grid.position.y = -1
scene.add(grid)

document.body.appendChild(renderer.domElement)

const { animation, update, setRotation, setRotationCamera, goto } = init()
const scale = 5
window.soldier = animation
window.goto = goto
window.setRotation = setRotation
animation.sprites.position.set(0, 1, 0)
animation.sprites.scale.set(scale, scale, scale)
scene.add(animation.sprites)

controls.addEventListener('change', (e) => {
    const { angleH } = cartesianToPolar(camera.position)
    setRotationCamera(angleH * DEG2RAD)
})

// animate
const clock = new THREE.Clock()
function animate(time) {
    ;[scene].forEach((scene) => {
        renderer.render(scene, camera)
        // renderer_css.render(scene, camera)
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
