import { utilService } from '../../../services/util.service.js'

export function MailPreview({ mail }) {
    const sentAt = mail.sentAt || mail.createdAt
    // mails saved before labels existed have no labels field
    const labels = mail.labels || []

    return (
        <article className="mail-preview">
            <span
                className="mail-avatar"
                style={{ backgroundColor: utilService.getAvatarColor(mail.from) }}>
                {(mail.from || '?').charAt(0).toUpperCase()}
            </span>

            <span className="mail-from">{mail.from}</span>

            <span className="mail-subject">
                {!!labels.length && <span className="mail-labels">
                    {labels.map(label =>
                        <span key={label} className={`label-chip label-${label}`}>{label}</span>)}
                </span>}
                {mail.subject || '(no subject)'}
                <span className="mail-snippet"> — {mail.body}</span>
            </span>

            <span className="mail-date">{_formatDate(sentAt)}</span>
        </article>
    )
}

// gmail shows a time for today and a short date for anything older
function _formatDate(timestamp) {
    const date = new Date(timestamp)
    const isToday = date.toDateString() === new Date().toDateString()

    return isToday
        ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : date.toLocaleDateString([], { day: 'numeric', month: 'short' })
}
