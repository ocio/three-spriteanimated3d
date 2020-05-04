// https://www.codeandweb.com/free-sprite-sheet-packer
import './styles.css'
import * as THREE from 'three'
import SpriteAnimated3D from '../src/index'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {
    sphericalToCartesian,
    cartesianToSpherical,
    radToDeg,
} from '@ocio/three-camera-utils'

const vertical = 35
const horizontal = 45
const distance = 200

// INTERESTING
const DEG2RAD = Math.PI / 180
const RAD2DEG = 180 / Math.PI

function convertNegativeRadianIntoDouble(rad, max = Math.PI) {
    return rad < 0 ? max * 2 + rad : rad
}

const url = 'http://localhost:1234/axeman-blue.png'
let sprite

function init() {
    const animation = SpriteAnimated3D()
    const texture = new THREE.TextureLoader().load(url)
    texture.minFilter = THREE.NearestFilter
    // const material = new THREE.SpriteMaterial({ map:texture  })
    sprite = new THREE.Sprite(material)
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
    })
    sprite = new THREE.Mesh(new THREE.PlaneBufferGeometry(), material)

    animation.animation.addFrames({
        object: sprite,
        framesHorizontal: 46,
        framesVertical: 8,
    })

    const iddle_loops = []
    const attack_loops = []
    const run_loops = []
    for (let i = 0; i < 8; ++i) {
        const orientation = 45 * i //> 180 ? (360 - 45 * i) * -1 : 45 * i

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

    // console.log('iddle', iddle_loops)
    // console.log('attack', attack_loops)
    // console.log('run', run_loops)

    return animation
}

// NOT INTERESTING
// NOT INTERESTING
// NOT INTERESTING

const cameraPosition = sphericalToCartesian({
    vertical: vertical * DEG2RAD,
    horizontal: horizontal * DEG2RAD,
    distance,
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
animation.objects.position.y = 0.5
animation.objects.scale.set(scale, scale, scale)
scene.add(animation.objects)

let soldierRotation = 0
let cameraRotation = 0
controls.addEventListener('change', (e) => {
    const { horizontal } = cartesianToSpherical(camera.position)
    // console.log(radToDeg(horizontal))
    cameraRotation = convertNegativeRadianIntoDouble(horizontal)
    sprite.quaternion.copy(camera.quaternion)
    updateCamera()
})

function updateCamera() {
    const rotation = soldierRotation + cameraRotation
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
}

animate()
