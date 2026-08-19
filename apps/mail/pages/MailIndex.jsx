const { useState, useEffect } = React
const { Link, useSearchParams, Outlet } = ReactRouterDOM

import { MailList } from '../cmps/MailList.jsx'
import { MailFilter } from '../cmps/MailFilter.jsx'
import { MailFolderList } from '../cmps/MailFolderList.jsx'
import { mailService } from '../services/mail.service.js'
import { showErrorMsg, showSuccessMsg } from '../../../services/event-bus.service.js'
import { useEffectUpdate } from '../../../custom-hooks/useEffectUpdate.js'

export function MailIndex() {
    const [mails, setMails] = useState(null)
    const [folderCounts, setFolderCounts] = useState({})

    const [searchParams, setSearchParams] = useSearchParams()
    const [filterBy, setFilterBy] = useState(mailService.getFilterFromSearchParams(searchParams))

    useEffect(() => {
        loadMails()
        loadFolderCounts()
    }, [])

    useEffectUpdate(() => {
        loadMails()
        loadFolderCounts()
        setSearchParams(mailService.getTrimmedFilter(filterBy))
    }, [filterBy])

    // the compose overlay navigates while this component stays mounted, so the
    // url can change without us. returning prev when nothing moved stops the loop
    // with the effect above
    useEffectUpdate(() => {
        const urlFilter = mailService.getFilterFromSearchParams(searchParams)
        setFilterBy(prev =>
            JSON.stringify(prev) === JSON.stringify(urlFilter) ? prev : urlFilter)
    }, [searchParams])

    function loadMails() {
        mailService.query(filterBy)
            .then(setMails)
            .catch(err => showErrorMsg('Could not load mails'))
    }

    function loadMail() {
        setMail(null)
        const filterBy = mailService.getFilterFromSearchParams(searchParams)
        // a direct link like #/mail/e103 carries no status — let the service infer the folder
        if (!searchParams.get('status')) filterBy.status = null

        mailService.get(params.mailId, filterBy)
            .then(mail => {
                // ...unchanged
            })
    }


    function loadFolderCounts() {
        mailService.getFolderCounts()
            .then(setFolderCounts)
            .catch(err => console.log('err:', err))
    }

    function onSetFilterBy(fieldsToUpdate) {
        setFilterBy(prev => ({ ...prev, ...fieldsToUpdate }))
    }

    function onSetStatus(status) {
        setFilterBy(prev => ({ ...prev, status }))
    }

    function onRemoveMail(mailId) {
        mailService.remove(mailId)
            .then(() => {
                setMails(prev => prev.filter(mail => mail.id !== mailId))
                loadFolderCounts()
                showSuccessMsg(`Mail ${mailId} removed`)
            })
            .catch(err => showErrorMsg(`Couldn't remove ${mailId}`))
    }

    function onToggleRead(mail) {
        mailService.save({ ...mail, isRead: !mail.isRead })
            .then(savedMail => {
                setMails(prev => prev.map(currMail =>
                    currMail.id === savedMail.id ? savedMail : currMail))
                loadFolderCounts()
            })
            .catch(err => showErrorMsg('Could not update mail'))
    }

    function onToggleStar(mail) {
        mailService.save({ ...mail, isStared: !mail.isStared })
            .then(savedMail => {
                setMails(prev => prev.map(currMail =>
                    currMail.id === savedMail.id ? savedMail : currMail))
            })
            .catch(err => showErrorMsg('Could not update mail'))
    }

    if (!mails) return <div className="loader">Loading…</div>

    return (
        <section className="mail-index">
            <aside className="mail-sidebar">
                <Link to="/mail/compose">
                    <button className="btn-compose">
                        <span className="compose-icon">✎</span>
                        Compose
                    </button>
                </Link>

                <MailFolderList
                    status={filterBy.status}
                    counts={folderCounts}
                    onSetStatus={onSetStatus} />
            </aside>

            <section className="mail-main">
                <MailFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />

                <MailList
                    mails={mails}
                    searchStr={searchParams.toString()}
                    onRemoveMail={onRemoveMail}
                    onToggleRead={onToggleRead}
                    onToggleStar={onToggleStar} />

                <Outlet context={{ onDraftSaved: loadMails }} />
            </section>
        </section>
    )
}
