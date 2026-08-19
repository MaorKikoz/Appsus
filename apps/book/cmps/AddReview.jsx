import { bookService } from '../services/book.service.js'
import { StarRating } from './StarRating.jsx'

const { useState } = React

export function AddReview({ onAddReview }) {
	const [reviewToEdit, setReviewToEdit] = useState(bookService.getEmptyReview())

	function handleChange({ target }) {
		const field = target.name
		let value = target.value

        console.log(typeof target.value)
		switch (target.type) {
			case 'number':
			case 'range':
				value = +value || ''
				break

			case 'checkbox':
				value = target.checked
				break

			default:
				break
		}

		setReviewToEdit(prevReview => ({ ...prevReview, [field]: value }))
	}

	function onSaveReview(ev) {
		ev.preventDefault()
		onAddReview(reviewToEdit)
	}

	const { fullname, readAt } = reviewToEdit

	return (
        <form className="add-review" onSubmit={onSaveReview}>
            <input onChange={handleChange} value={fullname} type="text" name="fullname" id="fullname" required />
            <StarRating handleChange={handleChange} />
            <input onChange={handleChange} value={readAt} type="date" name="readAt" id="readAt" required />
            
            <button>Save</button>
        </form>
	)
}
