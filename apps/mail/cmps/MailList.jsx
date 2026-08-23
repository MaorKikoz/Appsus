const { Link } = ReactRouterDOM

import { MailPreview } from './MailPreview.jsx'

export function MailList({
    mails,
    searchStr,
    selectedIds = [],
    onToggleSelect,
    onRemoveMail,
    onToggleRead,
    onToggleStar,
}) {
    if (!mails.length) return <p className="mail-list-empty">No mails to show</p>

    function getDetailsUrl(mailId) {
        return searchStr ? `/mail/${mailId}?${searchStr}` : `/mail/${mailId}`
    }

    function getRowClass(mail) {
        const classNames = [mail.isRead ? 'is-read' : 'is-unread']
        if (selectedIds.includes(mail.id)) classNames.push('is-selected')
        return classNames.join(' ')
    }

    return (
        <section className="mail-list">
            <ul className="clean-list">
                {mails.map(mail => (
                    <li key={mail.id} className={getRowClass(mail)}>
                        <input
                            type="checkbox"
                            className="mail-select"
                            title="Select"
                            checked={selectedIds.includes(mail.id)}
                            onChange={() => onToggleSelect(mail.id)} />

                        <button
                            className="btn-star"
                            title="Star"
                            onClick={() => onToggleStar(mail)}>
                            {mail.isStared ? <i className="fa-solid fa-star"></i> : <i className="fa-regular fa-star"></i>}
                        </button>

                        <Link to={getDetailsUrl(mail.id)}>
                            <MailPreview mail={mail} />
                        </Link>

                        <div className="actions">
                            <button
                                className="btn-toggle-read"
                                title="Mark as read / unread"
                                onClick={() => onToggleRead(mail)}>
                                {mail.isRead ? <i className="fa-regular fa-envelope-open"></i> : <i className="fa-solid fa-envelope"></i>}
                            </button>
                            <button
                                className="btn-remove"
                                title="Remove"
                                onClick={() => onRemoveMail(mail.id)}>
                                <i className="fa-regular fa-trash-can"></i>
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}
