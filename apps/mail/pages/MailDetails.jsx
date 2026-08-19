const { useState, useEffect } = React
const { Link, useParams, useNavigate, useSearchParams } = ReactRouterDOM

import { mailService } from '../services/mail.service.js'
import { showErrorMsg, showSuccessMsg } from '../../../services/event-bus.service.js'
import { LongTxt } from '../../../cmps/LongTxt.jsx'
import { LabelPicker } from '../../../cmps/LabelPicker.jsx'

export function MailDetails() {
    const [mail, setMail] = useState(null)

    const params = useParams()
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const searchStr = searchParams.toString()
    const backUrl = searchStr ? `/mail?${searchStr}` : '/mail'

    useEffect(() => {
        loadMail()
    }, [params.mailId])


    function loadMail() {
        setMail(null)
        const filterBy = mailService.getFilterFromSearchParams(searchParams)
        
        if (!searchParams.get('status')) filterBy.status = null

        mailService.get(params.mailId, filterBy)
            .then(mail => {
                setMail({ ...mail, isRead: true })
                if (mail.isRead) return
                mailService.save({ ...mail, isRead: true })
            })
            .catch(err => {
                showErrorMsg('Could not load mail')
                navigate(backUrl)
            })
    }

    function onRemoveMail() {
        mailService.remove(mail.id)
            .then(() => {
                showSuccessMsg('Mail removed')
                navigate(backUrl)
            })
            .catch(err => showErrorMsg('Could not remove mail'))
    }

    function onToggleLabel(label) {
        const currLabels = mail.labels || []
        const labels = currLabels.includes(label)
            ? currLabels.filter(currLabel => currLabel !== label)
            : [...currLabels, label]

        mailService.save({ ...mail, labels })
            // merge back only labels - save() strips nextMailId/prevMailId
            .then(savedMail => setMail(prev => ({ ...prev, labels: savedMail.labels })))
            .catch(err => showErrorMsg('Could not update labels'))
    }

    function getSiblingUrl(mailId) {
        return searchStr ? `/mail/${mailId}?${searchStr}` : `/mail/${mailId}`
    }

    if (!mail) return <div className="loader">Loading…</div>

    return (
        <section className="mail-details container">
            <h2>{mail.subject || '(no subject)'}</h2>

            <div className="mail-meta">
                <span>From: {mail.from}</span>
                <span>To: {mail.to}</span>
                <span>{new Date(mail.sentAt || mail.createdAt).toLocaleString()}</span>
            </div>

            <LabelPicker
                labels={mailService.getLabels()}
                selectedLabels={mail.labels || []}
                onToggleLabel={onToggleLabel} />

            <LongTxt length={300}>{mail.body}</LongTxt>

            <nav className="actions">



                <Link to={getSiblingUrl(mail.prevMailId)}>
                    <button className="btn-prev">Prev</button>
                </Link>
                <Link to={getSiblingUrl(mail.nextMailId)}>
                    <button className="btn-next">Next</button>
                </Link>


                <button className="btn-remove" onClick={onRemoveMail}>Delete</button>


                <Link to={mailService.getKeepUrl(mail)}>
                    <button className="btn-keep" title="Save as note">Keep it</button>
                </Link>

                <Link to={backUrl}>
                    <button className="btn-back">Back</button>
                </Link>
            </nav>
        </section>
    )
}
