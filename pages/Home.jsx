const { Link } = ReactRouterDOM

export function Home() {
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
            <Link to="/book" className="app-card note-card">
                <span className="card-icon">📕</span>
                <h2>missBooks</h2>
                <p>Shop from a select variety of books, be it digitall or delivered to your dorrstep.</p>
                <span className="card-cta">Open Keep →</span>
            </Link>
        </div>
    </section>
}
