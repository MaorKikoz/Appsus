export function About() {
    return <section className="about">
        <h1>About Appsus</h1>

        <p>
            Appsus is a single page application that gathers a set of mini apps behind one
            navigation. It runs entirely in the browser - there is no server, so everything
            is kept in localStorage and served back through a promise based service layer
            that mimics real network latency.
        </p>

        <h2>The apps</h2>
        <ul>
            <li><strong>misterEmail</strong> - a mail client with folders, labels, filtering, auto-saved drafts and a compose overlay.</li>
            <li><strong>missKeep</strong> - a notes board with several note types, colours and pinning.</li>
        </ul>

        <h2>The team</h2>
        <ul>
            <li><strong>Omer Tito</strong> - misterEmail</li>
            <li><strong>Maor Kizoz</strong> - missKeep</li>
        </ul>

    </section>
}
