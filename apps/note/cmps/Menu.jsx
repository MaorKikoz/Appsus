// keep's left nav. the real app lists Notes / Reminders / Labels / Archive /
// Trash - none of which exist here, so the rows below are the honest
// equivalent: the note types the service can actually filter on
const NAV_ITEMS = [
    { type: '', label: 'Notes', icon: 'fa-regular fa-lightbulb' },
    { type: 'NoteTxt', label: 'Text', icon: 'fa-regular fa-note-sticky' },
    { type: 'NoteTodos', label: 'Lists', icon: 'fa-solid fa-list-check' },
    { type: 'NoteImg', label: 'Images', icon: 'fa-regular fa-image' },
    { type: 'NoteVideo', label: 'Videos', icon: 'fa-solid fa-film' },
    { type: 'NoteDrawing', label: 'Drawings', icon: 'fa-solid fa-paintbrush' },
]

export function Menu({ handleTypeChange, activeType = '', isExpandedMenu, onPickType }) {
    return (
        <nav className={isExpandedMenu ? 'note-nav is-open' : 'note-nav'}>
            <ul>
                {NAV_ITEMS.map(item => (
                    <li key={item.label}>
                        <button
                            className={item.type === activeType ? 'nav-item active' : 'nav-item'}
                            title={item.label}
                            onClick={() => {
                                handleTypeChange(item.type)
                                onPickType()
                            }}>
                            <i className={`nav-icon ${item.icon}`}></i>
                            <span className="nav-label">{item.label}</span>
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
