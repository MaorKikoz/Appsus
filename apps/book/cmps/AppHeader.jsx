import { UserMsg } from "./UserMsg"

const { NavLink } = ReactRouterDOM

export function AppHeader() {
	return (
		<header className="app-header full main-layout">
			<h1>Book Shop</h1>
			<nav className="app-nav">
				<NavLink to="/">Home</NavLink>
				<NavLink to="/about">About</NavLink>
				<NavLink to="/book">Books</NavLink>
				<NavLink to="/add-book">Add</NavLink>
			</nav>
			<UserMsg />
		</header>
	)
}
