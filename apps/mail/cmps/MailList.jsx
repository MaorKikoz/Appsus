const { Link } = ReactRouterDOM

import { MailPreview } from './MailPreview.jsx'

export function MailList({ mails, searchStr, onRemoveMail, onToggleRead, onToggleStar }) {
    if (!mails.length) return <p className="mail-list-empty">No mails to show</p>

    function getDetailsUrl(mailId) {
        return searchStr ? `/mail/${mailId}?${searchStr}` : `/mail/${mailId}`
    }

    return (
        <section className="mail-list">
            <ul className="clean-list">
                {mails.map(mail => (
                    <li key={mail.id} className={mail.isRead ? 'is-read' : 'is-unread'}>
                        <button
                            className="btn-star"
                            title="Star"
                            onClick={() => onToggleStar(mail)}>
                            {mail.isStared ? '★' : '☆'}
                        </button>

                        <Link to={getDetailsUrl(mail.id)}>
                            <MailPreview mail={mail} />
                        </Link>

                        <div className="actions">
                            <button
                                className="btn-toggle-read"
                                title="Mark as read / unread"
                                onClick={() => onToggleRead(mail)}>
                                {mail.isRead ? '📭' : '✉'}
                            </button>
                            <button
                                className="btn-remove"
                                title="Remove"
                                onClick={() => onRemoveMail(mail.id)}>
                                🗑
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    )
}
