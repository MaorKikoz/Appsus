import { AddReview } from './AddReview.jsx'
import { ReviewPreview } from './ReviewPreview.jsx'

export function ReviewList({ reviews, onAddReview, onRemoveReview }) {
	return (
		<ul className="review-list">
            <li>
                <span>by</span>
                <span>rating</span>
                <span>date</span>
            </li>

            <AddReview 
                onAddReview={onAddReview}/>
                
			{reviews && reviews.map(review => (
				<li key={review.id}>
					<ReviewPreview 
                        review={review} 
                        onRemoveReview={onRemoveReview} />
				</li>
			))}
		</ul>
	)
}
