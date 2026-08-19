const FOLDERS = [
    { status: 'inbox', label: 'Inbox', icon: '📥' },
    { status: 'sent', label: 'Sent', icon: '📤' },
    { status: 'draft', label: 'Drafts', icon: '📝' },
    { status: 'trash', label: 'Trash', icon: '🗑' },
]

export function MailFolderList({ status, counts = {}, onSetStatus }) {
    return (
        <nav className="mail-folder-list">
            <ul>
                {FOLDERS.map(folder => (
                    <li key={folder.status}>
                        <button
                            className={folder.status === status ? 'btn-folder active' : 'btn-folder'}
                            onClick={() => onSetStatus(folder.status)}>
                            <span className="folder-icon">{folder.icon}</span>
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
