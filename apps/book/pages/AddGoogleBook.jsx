const { useState, useEffect } = React
const { useNavigate } = ReactRouter

import { Loader } from '../cmps/Loader.jsx'
import { bookService } from '../services/book.service.js'
import { showSuccessMsg } from '../services/event-bus.service.js'


export function AddGoogleBook() {
	const [searchTxt, setSearchTxt] = useState('')
	const [googleBooks, setGoogleBooks] = useState(null)

    const navigate = useNavigate()

	useEffect(() => {
		bookService.getGoogleBooks(searchTxt)
            .then(books => setGoogleBooks(books))
	}, [searchTxt])

    function onAddGoogleBook(book) {
        bookService.addGoogleBook(book)
            .then(savedBook => {
                showSuccessMsg(`book ${book.id} saved`)
                navigate('/book')
            })
    }

    function handleChange({ target }) {
        const { value } = target
        setSearchTxt(value)
    }

    if (!googleBooks) return <Loader />
	return (
		<section className="add-google-book main-layout">
            <input 
                value={searchTxt}
                onChange={handleChange}
                type="text" />

			<ul className="google-books">
                {googleBooks.map(book => 
                    <li key={book.id}>
                        <span>{book.volumeInfo.title}</span>
                        <button onClick={() => onAddGoogleBook(book)}>+</button>
                    </li>)}
            </ul>
		</section>
	)
}
