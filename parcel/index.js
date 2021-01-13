// https://www.codeandweb.com/free-sprite-sheet-packer
import './styles.css'
import * as THREE from 'three'
import SpriteAnimated3D from '../src/index'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import {
    sphericalToCartesian,
    cartesianToSpherical,
    cartesianToSphericalByControls,
    radToDeg,
    degToRad,
} from '@ocio/three-camera-utils'
import AXEMAN from './examples/axeman.json'
import KNIGHT from './examples/knight.json'

const vertical = 35
const horizontal = 45
const distance = 200

// INTERESTING

function convertNegativeRadianIntoDouble(rad, max = Math.PI) {
    return rad < 0 ? max * 2 + rad : rad
}

function reduceExcessRotation(rotation) {
    const onecircle = Math.PI * 2
    const cicles = rotation / onecircle
    if (cicles > 1) {
        return rotation - Math.floor(cicles) * onecircle
    } else {
        return rotation
    }
}

let sprite

const { url, loops, framesHorizontal, framesVertical } = KNIGHT

function init() {
    const animation = SpriteAnimated3D({
        onFinishLoop: (params) => {
            // console.log('entra?', params)
        },
    })
    const texture = new THREE.TextureLoader().load(url)
    texture.minFilter = THREE.NearestFilter
    texture.minFilter = THREE.NearestMipmapLinearFilter

    // const material = new THREE.SpriteMaterial({ map:texture  })
    sprite = new THREE.Sprite(material)
    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
    })
    sprite = new THREE.Mesh(new THREE.PlaneBufferGeometry(), material)

    animation.animation.addFrames({
        object: sprite,
        framesHorizontal,
        framesVertical,
    })

    Object.keys(loops).forEach((loop_name) => {
        const orientations = loops[loop_name]
        orientations.forEach((ori) => {
            ori.orientation = degToRad(ori.orientation)
        })
        animation.createLoop(loop_name, orientations)
    })

    return animation
}

// NOT INTERESTING
// NOT INTERESTING
// NOT INTERESTING

const cameraPosition = sphericalToCartesian({
    vertical: degToRad(vertical),
    horizontal: degToRad(horizontal),
    distance,
})

const scene = new THREE.Scene()
const scene_sprites = new THREE.Scene()
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
renderer.autoClear = false
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.setPixelRatio(window.devicePixelRatio)

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
    const { horizontal } = cartesianToSphericalByControls(controls)
    // console.log(radToDeg(horizontal))
    cameraRotation = degToRad(360) - convertNegativeRadianIntoDouble(horizontal)
    sprite.quaternion.copy(camera.quaternion)
    updateCamera()
})

function updateCamera() {
    const rotation = cameraRotation + soldierRotation
    setRotation(rotation)
}

// animate
const clock = new THREE.Clock()
function animate(time) {
    ;[scene_sprites, scene].forEach((scene) => {
        renderer.render(scene, camera)
        // renderer.clearDepth()
    })

    const canvas_width = window.innerWidth
    const canvas_height = window.innerHeight
    renderer.setSize(canvas_width, canvas_height)
    // renderer_css.setSize(canvas_width, canvas_height)
    camera.aspect = canvas_width / canvas_height
    camera.updateProjectionMatrix()

    controls.update()
    requestAnimationFrame(animate)

    const delta = clock.getDelta()
    update(delta)
}

animate()
