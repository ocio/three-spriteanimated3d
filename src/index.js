import SpriteAnimated from '@ocio/three-spriteanimated'

export default function SpriteAnimated3D({ onEnterFrame, onFinishLoop }) {
    const animation = SpriteAnimated({ onEnterFrame: onEnterFrameWrapper })
    const loops = {}
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

    function onEnterFrameWrapper(frame) {
        // console.log(current_loop, frame)
        if (typeof onEnterFrame === 'function') {
            const loop_item = loops[current_loop].find(
                ({ start, end }) => frame <= end && frame >= start
            )
            if (loop_item !== undefined) {
                onEnterFrame(frame - loop_item.start, frame)
            }
        }
    }

    function onLeaveFrame() {
        const current_frame = animation.getFrame()
        const loop_item = loops[current_loop].find(
            ({ end }) => end === current_frame
        )
        if (loop_item !== undefined) {
            if (onFinishLoop && current_frame === loop_item.end) {
                onFinishLoop({
                    current_loop,
                    current_frame,
                    loop_item,
                })
            }
            return loop_item.start
        }
    }

    function reduceExcessRotation(rotation) {
        const onecircle = Math.PI * 2
        const cicles = rotation / onecircle
        return cicles > 1 ? rotation - Math.floor(cicles) * onecircle : rotation
    }

    function update(delta) {
        // console.log(animation)
        return animation.update(delta)
    }

    function setRotation(rot) {
        rotation = reduceExcessRotation(rot)
        updateRotation()
    }

    function updateRotation() {
        const current_frame = animation.getFrame()
        const loops_name = loops[current_loop]
        const { current, selected } = getIndexLoop(
            loops_name,
            current_frame,
            rotation
        )
        if (current !== selected) {
            const relative_frame = current_frame - loops_name[current].start
            animation.goto(loops_name[selected].start + relative_frame)
        }
    }

    function goto(name, frame = 0) {
        const current_frame = animation.getFrame()
        const { selected } = getIndexLoop(
            loops[current_loop],
            current_frame,
            rotation
        )
        current_loop = name
        animation.playing = true
        animation.goto(loops[name][selected].start + frame)
    }

    function gotoAndStop(name) {
        animation3d.goto(name, 0)
        animation.pause()
    }

    function getIndexLoop(loops, current_frame, rotation) {
        let min_orientation = Infinity
        let min_index
        let min_difference = Infinity
        let selected = 0
        let current = 0
        loops.forEach(({ start, end, orientation }, index) => {
            const difference = Math.abs(orientation - rotation)
            if (current_frame >= start && current_frame <= end) {
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
        const onecircle = Math.PI * 2
        const orientation = onecircle + min_orientation
        const difference = Math.abs(orientation - rotation)
        if (difference < min_difference) {
            selected = min_index
        }

        return { current, selected }
    }

    function getCurrentLoop() {
        return current_loop
    }

    const animation3d = {
        loops,
        animation,
        createLoop,
        setRotation,
        update,
        goto,
        gotoAndStop,
        getCurrentLoop,
    }

    return animation3d
}
