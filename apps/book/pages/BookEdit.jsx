const { useState, useEffect } = React
const { Link, useNavigate, useParams } = ReactRouterDOM

import { bookService } from '../services/book.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

export function BookEdit() {
	const [book, setBook] = useState(bookService.getEmptyBook())

	const navigate = useNavigate()
	const params = useParams()
    console.log(params)

	useEffect(() => {
		if (params.bookId) loadBook()
	}, [])

	function loadBook() {
		bookService.get(params.bookId)
			.then(setBook)
			.catch(err => console.log('err:', err))
	}

	function handleChange({ target }) {
		const field = target.name
		let value = target.value

		if (field === 'categories' || field === 'authors') value = [value]

		switch (target.type) {
			case 'number':
			case 'range':
				value = +value
				break

			case 'checkbox':
				value = target.checked
				break
		}
		setBook(prev => ({ ...prev, [field]: value }))
	}

	function handlePriceChange({ target }) {
		let value = +target.value
		const listPrice = { ...book.listPrice, amount: value }
		setBook(prev => ({ ...prev, listPrice }))
	}

	function onSubmitBook(ev) {
		ev.preventDefault()

		bookService.save(book)
			.then(() => {
				showSuccessMsg(`Book saved successfully`)
				navigate('/book')
			})
			.catch(err => {
				console.log('err:', err)
				showErrorMsg("Couldn't save book")
			})
	}

	return (
		<section className="book-edit main-layout">
			{book.id ? <h2>Edit book</h2> : <h2>Add a new book</h2>}
			<form onSubmit={onSubmitBook}>
				<label htmlFor="title">Title: </label>
				<input 
                    value={book.title} 
                    onChange={handleChange} 
                    type="text" 
                    placeholder="Title" 
                    id="title" 
                    name="title" 
                    required />

				<label htmlFor="subtitle">Subtitle:</label>
				<input 
                    value={book.subtitle} 
                    onChange={handleChange} 
                    type="text" 
                    placeholder="Subtitle" 
                    id="subtitle" 
                    name="subtitle" 
                    required />

				<label htmlFor="price">Price: </label>
				<input 
                    value={book.listPrice.amount || 0} 
                    onChange={handlePriceChange} 
                    type="number" 
                    placeholder="price" 
                    id="price" 
                    name="price" 
                    required />

				<div className="actions">
                    <button>Save</button>
                    <Link to="/book">
                        <button type="button">Cancel</button>
                    </Link>
                </div>
			</form>
		</section>
	)
}
