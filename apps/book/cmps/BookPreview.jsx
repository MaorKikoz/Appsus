export function BookPreview({ book }) {
	return (
		<article className="book-preview">
			<h2>{book.title}</h2>
			<h4>Price: {`${book.listPrice.amount} ${book.listPrice.currencyCode}`}</h4>
			<h4>Published: {book.publishedDate}</h4>
			<img src={book.thumbnail} alt={book.title} />
		</article>
	)
}
