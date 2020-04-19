import SpriteAnimated from './SpriteAnimated'

export default function SpriteAnimated3D() {
    const animation = SpriteAnimated()
    const loops = {}
    let rotation_camera = 0
    let rotation = 0
    let current_loop

    function createLoop(name, orientations) {
        if (current_loop === undefined) {
            current_loop = name
        }
        loops[name] = orientations
        orientations.forEach(({ start, end }) => {
            animation.setKeyFrame(end, { onLeaveFrame })
        })
    }

    function onLeaveFrame() {
        const current_farme = animation.getFrame()
        const loop_item = loops[current_loop].find(
            ({ end }) => end === current_farme
        )
        if (loop_item !== undefined) {
            return loop_item.start
        }
    }

    function update(delta) {
        // console.log(animation)
        return animation.update(delta)
    }

    function getIndexLoop(loops, current_farme, rotation) {
        let min_orientation = Infinity
        let min_index
        let min_difference = Infinity
        let selected = 0
        let current = 0
        loops.forEach(({ start, end, orientation }, index) => {
            const difference = Math.abs(orientation - rotation)
            if (current_farme >= start && current_farme <= end) {
                current = index
            }
            if (difference < min_difference) {
                min_difference = difference
                selected = index
            }
            if (orientation < min_orientation) {
                min_orientation = orientation
                min_index = index
            }
        })

        // Initial orientation
        const orientation = Math.PI * 2 + min_orientation
        const difference = Math.abs(orientation - rotation)
        if (difference < min_difference) {
            selected = min_index
        }

        return { current, selected }
    }

    function setRotation(rot) {
        console.log('LOOOL')
        rotation = rot
        updateRotation()
    }

    function setRotationCamera(rot) {
        rotation_camera = rot
        updateRotation()
    }

    function updateRotation() {
        const rot = rotation + rotation_camera
        const cicles = Math.floor(rot / (Math.PI * 2))
        const rotation_reduced = rot - cicles * (Math.PI * 2)
        const current_farme = animation.getFrame()
        const loops_name = loops[current_loop]
        const { current, selected } = getIndexLoop(
            loops_name,
            current_farme,
            rotation_reduced
        )

        if (current !== selected) {
            const relative_frame = current_farme - loops_name[current].start
            animation.goto(loops_name[selected].start + relative_frame)
        }
    }

    function goto(name, frame = 0) {
        const current_farme = animation.getFrame()
        const { selected } = getIndexLoop(
            loops[current_loop],
            current_farme,
            rotation
        )
        current_loop = name
        animation.goto(loops[name][selected].start + frame)
    }

    const animation3d = {
        loops,
        animation,
        createLoop,
        setRotation,
        setRotationCamera,
        update,
        goto,
    }

    return animation3d
}
