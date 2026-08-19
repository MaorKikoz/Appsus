const { useState, useEffect } = React
const { Link } = ReactRouterDOM

import { bookService } from '../services/book.service.js'
import { showSuccessMsg, showErrorMsg } from '../../../services/event-bus.service.js'

import { BookFilter } from '../cmps/BookFilter.jsx'
import { BookList } from '../cmps/BookList.jsx'
import { Loader } from '../cmps/Loader.jsx'

export function BookIndex() {
	const [books, setBooks] = useState(null)
	const [filterBy, setFilterBy] = useState(bookService.getDefaultFilter())

	useEffect(() => {
		loadBooks()
	}, [filterBy])

	function loadBooks() {
		bookService.query(filterBy)
            .then(setBooks)
	}

	function onRemoveBook(bookId) {
		bookService.remove(bookId)
			.then(() => {
				setBooks(prev => prev.filter(book => book.id !== bookId))
				showSuccessMsg(`Book Removed! ${bookId}`)
			})
			.catch(err => {
				console.error(err)
				showErrorMsg(`Problem Removing ${bookId}`)
			})
	}

	function onSetFilterBy(filterBy) {
		setFilterBy(prev => ({ ...prev, ...filterBy }))
	}

	if (!books) return <Loader />
	return (
		<section className="book-index">
			<BookFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
			<button className="btn-add-book">
				<Link to="/book/edit">+</Link>
			</button>
			<BookList books={books} onRemoveBook={onRemoveBook} />
		</section>
	)
}
