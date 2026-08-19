const { useState, useEffect } = React
const { Link } = ReactRouterDOM
const { useParams, useNavigate } = ReactRouter

import { bookService } from '../services/book.service.js'
import { showSuccessMsg, showErrorMsg } from '../../../services/event-bus.service.js'

import { AddReview } from '../cmps/AddReview.jsx'
import { LongTxt } from '../cmps/LongTxt.jsx'
import { ReviewList } from '../cmps/ReviewList.jsx'
import { Loader } from '../cmps/Loader.jsx'

export function BookDetails() {
	const [book, setBook] = useState(null)

	const { bookId } = useParams()
	const navigate = useNavigate()
    
	useEffect(() => {
		bookService.get(bookId)
			.then(setBook)
			.catch(err => {
				console.log('err:', err)
				navigate('/book')
			})
	}, [bookId])

	function readingType(pageCount) {
		if (pageCount > 500) return ' / Serious Reading'
		if (pageCount > 200) return ' / Decent Reading'
		if (pageCount < 100) return ' / Light Reading'
	}

	function vintageOrNew(publishedDate) {
		if (new Date().getFullYear() - publishedDate > 10) return ' / Vintage'
		if (new Date().getFullYear() - publishedDate < 1) return ' / New'
	}

	function expensiveOrCheap(amount) {
		if (amount > 150) return 'red'
		if (amount < 20) return 'green'
	}

	function onAddReview(reviewToAdd) {
		console.log('review to add', reviewToAdd)
		bookService.addReview(bookId, reviewToAdd)
			.then(updatedBook => {
				setBook(updatedBook)
				showSuccessMsg('Review saved successfully')
			})
			.catch(err => {
				console.log('err:', err)
				showErrorMsg('Error saving review')
			})
	}

	function onRemoveReview(reviewId) {
		bookService.removeReview(bookId, reviewId)
			.then(updatedBook => {
				setBook(updatedBook)
				showSuccessMsg('Review deleted successfully')
			})
			.catch(err => {
				console.log('err:', err)
				showErrorMsg('Error deleting review')
				navigate('/book')
			})
	}

	if (!book) return <Loader />

	return (
		<section className="book-details main-layout">
			{book.listPrice.isOnSale && <img src="../assets/imgs/sale.png" />}

			<header>
                <h1>{book.title}</h1>
                <h2 className={expensiveOrCheap(book.listPrice.amount)}>{book.listPrice.amount + ' ' + book.listPrice.currencyCode}</h2>
            </header>
            
			<h3>{book.subtitle}</h3>
			<h3>Authors: {book.authors.join()}</h3>
			<h3>
				Published: {book.publishedDate}
				{vintageOrNew(book.publishedDate)}
			</h3>
			<LongTxt txt={book.description} length={book.description.length} />
			<h3>
				Page Count: {book.pageCount}
				{readingType(book.pageCount)}
                <span> | </span>
                {book.language}
			</h3>
			<ul className="categories">
				{book.categories.map(category => (
					<li key={category}>{category}</li>
				))}
			</ul>
			<img src={book.thumbnail} alt="" />
			
			<div className="actions">
                <Link to={`/book/${book.prevBookId}`} ><button>Prev</button></Link>
                <Link to={`/book/${book.nextBookId}`} ><button>Next</button></Link>
                <button onClick={() => navigate('/book')}>Back</button>
            </div>

			<section className="reviews">
				<h4>Reviews:</h4>
				 
                <ReviewList 
                    reviews={book.reviews} 
                    onAddReview={onAddReview} 
                    onRemoveReview={onRemoveReview} />
			</section>
		</section>
	)
}
