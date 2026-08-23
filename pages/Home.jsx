const { Link } = ReactRouterDOM
const { useState } = React

// the three services each own one localStorage key and reseed their demo data
// at import time, so dropping the keys and reloading is the whole reset.
// removing them by name rather than calling localStorage.clear(): a live server
// on localhost is one origin shared with every other project on the machine
const APP_STORAGE_KEYS = ['mailDB', 'noteDB', 'booksDB']

export function Home() {
    const [isConfirmingReset, setIsConfirmingReset] = useState(false)

    function onResetStorage() {
        APP_STORAGE_KEYS.forEach(key => localStorage.removeItem(key))
        window.location.reload()
    }

    return <section className="home">
        <div className="hero">
            <h1>Your favorite apps in one place</h1>
            <p>Appsus bundles a mail client and a notes board behind a single navigation.</p>
        </div>

        <div className="app-cards">
            <Link to="/mail" className="app-card mail-card">
                <span className="card-icon">✉</span>
                <h2>misterEmail</h2>
                <p>Read, compose, label and search your mail. Drafts save themselves every few seconds.</p>
                <span className="card-cta">Open Mail →</span>
            </Link>

            <Link to="/note" className="app-card note-card">
                <span className="card-icon">📝</span>
                <h2>missKeep</h2>
                <p>Keep text, images and todo lists on a board you can pin, colour and search.</p>
                <span className="card-cta">Open Keep →</span>
            </Link>
            <Link to="/book" className="app-card book-card">
                <span className="card-icon">📕</span>
                <h2>missBooks</h2>
                <p>Browse a curated shelf, read the reviews, and add your own rating.</p>
                <span className="card-cta">Open Books →</span>
            </Link>
        </div>

        <footer className="storage-reset">
            <p>
                Everything you write here lives in this browser's local storage.
                Resetting drops it and reloads the demo data.
            </p>

            {!isConfirmingReset
                ? <button
                    className="btn-reset"
                    onClick={() => setIsConfirmingReset(true)}>
                    Reset local storage
                </button>

                : <div className="reset-confirm">
                    <span className="reset-warning">
                        This deletes every mail, note and book you have added or changed. Sure?
                    </span>

                    <div className="reset-buttons">
                        <button className="btn-reset-yes" onClick={onResetStorage}>
                            Yes, reset
                        </button>
                        <button
                            className="btn-reset-no"
                            onClick={() => setIsConfirmingReset(false)}>
                            Cancel
                        </button>
                    </div>
                </div>}
        </footer>
    </section>
}
