const { useState, useEffect } = React

export function NoteFilter({ filterBy, onSetFilter }) {

    const [filterByToEdit, setFilterByToEdit] = useState({ ...filterBy })

    useEffect(() => {
        onSetFilter(filterByToEdit)
    }, [filterByToEdit])

    function handleChange({ target }) {
        const field = target.name
        let value = target.value

        switch (target.type) {
            case 'number':
            case 'range':
                value = +value
                break;

            case 'checkbox':
                value = target.checked
                break
        }
        setFilterByToEdit(prevFilter => ({ ...prevFilter, [field]: value }))
    }

    const { txt } = filterByToEdit

    return (
        <section className="note-filter">
            <form className="form-filter" onSubmit={ev => ev.preventDefault()}>
                <button className="search-btn"><i className="fa-solid fa-magnifying-glass"></i></button>
                <input
                    onChange={handleChange}
                    value={txt}
                    type="search"
                    name="txt"
                    placeholder="Search" />
            </form>
        </section>
    )
}