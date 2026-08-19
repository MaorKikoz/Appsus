const { useState, useEffect } = React
import { eventBusService } from "../../../services/event-bus.service.js"

export function UserMsg() {
	const [msg, setMsg] = useState(null)

	useEffect(() => {
		const unsubscribe = eventBusService.on('show-user-msg', msg => {
			setMsg(msg)
			setTimeout(() => setMsg(null), 2000)
		})
		return unsubscribe
	}, [])

	if (!msg) return null
	return (
		<section className={`user-msg ${msg.type}`}>
			<span>{msg.txt}</span>
		</section>
	)
}
