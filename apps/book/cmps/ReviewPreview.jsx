export function ReviewPreview({ review, onRemoveReview }) {
	function renderStars(rating) {
		const starIcons = []
		for (let i = 0; i < rating; i++) {
			starIcons.push(<i className="fa-solid fa-star fa-lg" style={{ color: '#ffee00' }} key={i}></i>)
		}
		return starIcons
	}

	const { id, fullname, rating, readAt } = review
	return (
		<article className="review-preview">
			<span>{fullname}</span>
			<span>{renderStars(rating)}</span>
			<span>{readAt}</span>

			<button onClick={() => onRemoveReview(id)}>Delete</button>
		</article>
	)
}
