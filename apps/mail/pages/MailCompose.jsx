const { useState, useEffect, useRef } = React
const { Link, useParams, useNavigate, useSearchParams, useOutletContext } = ReactRouterDOM

import { mailService } from '../services/mail.service.js'
import { showErrorMsg, showSuccessMsg } from '../../../services/event-bus.service.js'

const AUTO_SAVE_INTERVAL = 5000

export function MailCompose() {
    const [searchParams] = useSearchParams()

    const [mail, setMail] = useState(mailService.getEmptyMail(
        searchParams.get('subject') || '',
        searchParams.get('body') || '',
        searchParams.get('to') || ''
    ))

    const [savedAt, setSavedAt] = useState(null)

    const params = useParams()
    const navigate = useNavigate()

    // null when rendered outside an outlet - guard so this stays standalone-safe
    const { onDraftSaved } = useOutletContext() || {}

    const backUrl = searchParams.toString() ? `/mail?${searchParams}` : '/mail'

    const intervalIdRef = useRef(null)
    const mailRef = useRef(mail)

    // keep the ref pointed at the newest draft - setInterval would otherwise
    // close over the mail from the render that started it, forever
    useEffect(() => {
        mailRef.current = mail
    }, [mail])

    useEffect(() => {
        intervalIdRef.current = setInterval(saveDraft, AUTO_SAVE_INTERVAL)
        return () => clearInterval(intervalIdRef.current)
    }, [])

    useEffect(() => {
        if (!params.mailId) return
        mailService.get(params.mailId)
            .then(setMail)
            .catch(err => {
                showErrorMsg('Could not load draft')
                navigate('/mail')
            })
    }, [])

    function saveDraft() {
        const currMail = mailRef.current
        if (currMail.sentAt) return                                                 // already sent
        if (!currMail.to && !currMail.subject && !currMail.body) return             // nothing typed yet

        mailService.save(currMail)
            .then(savedMail => {
                // merge back only the id - anything else would clobber what is being
                // typed during the service's fake latency
                setMail(prev => ({ ...prev, id: savedMail.id }))
                setSavedAt(Date.now())
                // let the list behind the overlay pick the new draft up
                if (onDraftSaved) onDraftSaved()
            })
            // a red toast every 5 seconds while typing is worse than a silent failure
            .catch(err => console.log('Auto-save failed:', err))
    }

    function handleChange(ev) {
        const { value, name, type } = ev.target
        setMail(prev => ({ ...prev, [name]: type === 'number' ? +value : value }))
    }

    function onSendMail(ev) {
        ev.preventDefault()
        if (!mail.to) return showErrorMsg('Please fill in a recipient')

        // stop the timer first - a tick in flight would resurrect the draft
        clearInterval(intervalIdRef.current)

        mailService.send(mail)
            .then(() => {
                showSuccessMsg('Mail sent')
                navigate('/mail?status=sent')
            })
            .catch(err => showErrorMsg('Could not send mail'))
    }

    function onSaveDraft() {
        clearInterval(intervalIdRef.current)

        mailService.save(mail)
            .then(() => {
                showSuccessMsg('Draft saved')
                navigate('/mail?status=draft')
            })
            .catch(err => showErrorMsg('Could not save draft'))
    }

    return (
        <form className="mail-compose" onSubmit={onSendMail}>
            <h2>
                New Message
                <Link to={backUrl}>
                    <button type="button" className="btn-close" title="Close">✕</button>
                </Link>
            </h2>

            <label htmlFor="to">To:</label>
            <input type="text" id="to" name="to" value={mail.to} onChange={handleChange} />

            <label htmlFor="subject">Subject:</label>
            <input type="text" id="subject" name="subject" value={mail.subject} onChange={handleChange} />

            <label htmlFor="body">Body:</label>
            <textarea id="body" name="body" rows="10" value={mail.body} onChange={handleChange}></textarea>

            {savedAt && <span className="draft-status">
                Draft saved {new Date(savedAt).toLocaleTimeString()}
            </span>}

            <div className="actions">
                <button className="btn-send">Send</button>
                <button type="button" className="btn-draft" onClick={onSaveDraft}>Save as draft</button>
                <Link to={backUrl}><button type="button" className="btn-cancel">Cancel</button></Link>
            </div>
        </form>
    )
}