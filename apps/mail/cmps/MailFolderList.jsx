const FOLDERS = [
    { status: 'inbox', label: 'Inbox', icon: 'fa-solid fa-inbox' },
    { status: 'sent', label: 'Sent', icon: 'fa-regular fa-paper-plane' },
    { status: 'draft', label: 'Drafts', icon: 'fa-regular fa-file-lines' },
    { status: 'trash', label: 'Trash', icon: 'fa-regular fa-trash-can' },
]

export function MailFolderList({ status, counts = {}, onSetStatus }) {
    return (
        <nav className="mail-folder-list">
            <ul>
                {FOLDERS.map(folder => (
                    <li key={folder.status}>
                        <button
                            className={folder.status === status ? 'btn-folder active' : 'btn-folder'}
                            title={folder.label}
                            onClick={() => onSetStatus(folder.status)}>
                            <i className={`folder-icon ${folder.icon}`}></i>
                            <span className="folder-label">{folder.label}</span>
                            {counts[folder.status] > 0 &&
                                <span className="folder-count">{counts[folder.status]}</span>}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    )
}
