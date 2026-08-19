const { Link, NavLink } = ReactRouterDOM
const { useRef } = React

export function AppHeader() {

    return <header className="app-header">
        <Link to="/" className="app-logo">
            <span className="logo-mark">✉</span>
            <h1>Appsus</h1>
        </Link>

        <nav className="app-nav">
            <NavLink to="/">Home</NavLink>
            <NavLink to="/about">About</NavLink>
            <NavLink to="/mail">Mail</NavLink>
            <NavLink to="/note">Note</NavLink>
            <NavLink to="/book">Book</NavLink>
        </nav>
    </header>
}
