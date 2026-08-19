import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

export default function Typewriter({ text, as: Tag = 'span', className = '', speed = 32, startDelay = 300 }) {
    const ref = useRef(null)
    const isInView = useInView(ref, { once: true, amount: 0.6 })
    const [count, setCount] = useState(0)

    useEffect(() => {
        if (!isInView) return

        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setCount(text.length)
            return
        }

        let charIndex = 0
        let intervalId
        const delayId = setTimeout(() => {
            intervalId = setInterval(() => {
                charIndex += 1
                setCount(charIndex)
                if (charIndex >= text.length) clearInterval(intervalId)
            }, speed)
        }, startDelay)

        return () => {
            clearTimeout(delayId)
            clearInterval(intervalId)
        }
    }, [isInView, text, speed, startDelay])

    return (
        <Tag ref={ref} className={className} aria-label={text}>
            <span aria-hidden="true">
                {text.slice(0, count)}
                <span className="inline-block w-[2px] h-[0.85em] -mb-[0.1em] ml-0.5 bg-current align-middle animate-[blink_0.9s_step-end_infinite]" />
            </span>
        </Tag>
    )
}
