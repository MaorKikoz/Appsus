const { useState } = React

export function LongTxt({ txt, length = 100 }) {
	const [isExpanded, setIsExpanded] = useState(false)

	return (
		<div>
			{(length <= 100 && txt) || (
				<div>
					{isExpanded ? txt : txt.substring(0, 100) + ' ...'}
					<span style={{ cursor: 'pointer', color: 'blue' }} onClick={() => setIsExpanded(!isExpanded)}>
						{isExpanded ? ' Read less' : ' Read more'}
					</span>
				</div>
			)}
		</div>
	)
}
