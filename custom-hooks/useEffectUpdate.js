const { useRef, useEffect } = React

export function useEffectUpdate(effect, dependencies) {
    const isFirstRender = useRef(true)

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }

        return effect()
    }, dependencies)
}