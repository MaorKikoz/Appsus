const { useState, useEffect } = React
const { Link, useSearchParams, Outlet } = ReactRouterDOM

import { MailList } from '../cmps/MailList.jsx'
import { MailFilter } from '../cmps/MailFilter.jsx'
import { MailToolbar } from '../cmps/MailToolbar.jsx'
import { MailFolderList } from '../cmps/MailFolderList.jsx'
import { mailService } from '../services/mail.service.js'
import { showErrorMsg, showSuccessMsg } from '../../../services/event-bus.service.js'
import { useEffectUpdate } from '../../../custom-hooks/useEffectUpdate.js'
import { LabelPicker } from '../../../cmps/LabelPicker.jsx'

// the css breakpoint, mirrored here. below it the sidebar is a drawer sliding
// over the list, above it a column the hamburger shrinks down to an icon rail
const DESKTOP_MIN_WIDTH = 750

function isDesktop() {
    return window.matchMedia(`(min-width: ${DESKTOP_MIN_WIDTH}px)`).matches
}

export function MailIndex() {
    const [mails, setMails] = useState(null)
    const [folderCounts, setFolderCounts] = useState({})
    // desktop opens with the sidebar out, a phone opens with the drawer shut
    const [isSidebarOpen, setIsSidebarOpen] = useState(isDesktop)
    const [selectedIds, setSelectedIds] = useState([])

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

    // unread inbox count in the browser tab, the way a real client does it
    useEffect(() => {
        document.title = folderCounts.inbox ? `Appsus (${folderCounts.inbox})` : 'Appsus'
        return () => { document.title = 'Appsus' }
    }, [folderCounts])

    function loadMails() {
        mailService.query(filterBy)
            .then(mails => {
                setMails(mails)
                // rows leave the list when the filter moves - dropping them from the
                // selection keeps the bulk actions honest about what they will hit
                setSelectedIds(prev => prev.filter(mailId =>
                    mails.some(mail => mail.id === mailId)))
            })
            .catch(err => showErrorMsg('Could not load mails'))
    }

    function loadFolderCounts() {
        mailService.getFolderCounts()
            .then(setFolderCounts)
            .catch(err => console.log('err:', err))
    }

    function onSetFilterBy(fieldsToUpdate) {
        setFilterBy(prev => ({ ...prev, ...fieldsToUpdate }))
    }

    function onRefresh() {
        loadMails()
        loadFolderCounts()
    }

    function onSetStatus(status) {
        setFilterBy(prev => ({ ...prev, status }))
        // on a phone the drawer covers the list it just filtered - get out of the
        // way. on desktop it is a column, closing it here would be a surprise
        if (!isDesktop()) setIsSidebarOpen(false)
    }

    // the picker reports one label - this decides add vs remove
    function onToggleLabel(label) {
        setFilterBy(prev => ({
            ...prev,
            labels: prev.labels.includes(label)
                ? prev.labels.filter(currLabel => currLabel !== label)
                : [...prev.labels, label],
        }))
    }

    function onRemoveMail(mailId) {
        mailService.remove(mailId)
            .then(() => {
                setMails(prev => prev.filter(mail => mail.id !== mailId))
                setSelectedIds(prev => prev.filter(id => id !== mailId))
                loadFolderCounts()
                showSuccessMsg(`Mail ${mailId} removed`)
            })
            .catch(err => showErrorMsg(`Could not remove ${mailId}`))
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

    function onToggleSelect(mailId) {
        setSelectedIds(prev => prev.includes(mailId)
            ? prev.filter(id => id !== mailId)
            : [...prev, mailId])
    }

    // gmail's header checkbox: all on, or - from any partial state - all off
    function onToggleSelectAll() {
        setSelectedIds(prev =>
            prev.length === mails.length ? [] : mails.map(mail => mail.id))
    }

    function onRemoveSelected() {
        const idsToRemove = selectedIds

        mailService.removeMany(idsToRemove)
            .then(() => {
                setMails(prev => prev.filter(mail => !idsToRemove.includes(mail.id)))
                setSelectedIds([])
                loadFolderCounts()
                showSuccessMsg(`${idsToRemove.length} mails removed`)
            })
            .catch(err => showErrorMsg('Could not remove the selected mails'))
    }

    // mark read/unread and star/unstar only differ by the field they set
    function onSaveSelected(fieldsToUpdate) {
        const mailsToSave = mails
            .filter(mail => selectedIds.includes(mail.id))
            .map(mail => ({ ...mail, ...fieldsToUpdate }))

        mailService.saveMany(mailsToSave)
            .then(savedMails => {
                setMails(prev => prev.map(mail =>
                    savedMails.find(savedMail => savedMail.id === mail.id) || mail))
                loadFolderCounts()
            })
            .catch(err => showErrorMsg('Could not update the selected mails'))
    }

    if (!mails) return <div className="loader">Loading…</div>

    return (
        <section className={isSidebarOpen ? 'mail-index' : 'mail-index is-sidebar-collapsed'}>
            {/* the dimmer belongs to the phone drawer - css drops it on desktop */}
            {isSidebarOpen && <div
                className="sidebar-backdrop"
                onClick={() => setIsSidebarOpen(false)}></div>}

            {/* gmail's top bar: it spans the sidebar and the list both, so the
                hamburger sits outside the column it collapses */}
            <header className="mail-topbar">
                <button
                    className="btn-menu"
                    title={isSidebarOpen ? 'Hide folders' : 'Show folders'}
                    onClick={() => setIsSidebarOpen(prev => !prev)}>
                    <i className="fa-solid fa-bars"></i>
                </button>

                <MailFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
            </header>

            <aside className={isSidebarOpen ? 'mail-sidebar is-open' : 'mail-sidebar'}>
                <Link to="/mail/compose" className="compose-link">
                    <button className="btn-compose" title="Compose">
                        <i className="fa-solid fa-pen compose-icon"></i>
                        <span className="compose-label">Compose</span>
                    </button>
                </Link>

                <MailFolderList
                    status={filterBy.status}
                    counts={folderCounts}
                    onSetStatus={onSetStatus} />

                <section className="sidebar-labels">
                    <h3>Labels</h3>
                    <LabelPicker
                        labels={mailService.getLabels()}
                        selectedLabels={filterBy.labels}
                        onToggleLabel={onToggleLabel} />
                </section>
            </aside>

            <section className="mail-main">
                <MailToolbar
                    mailCount={mails.length}
                    selectedCount={selectedIds.length}
                    onRefresh={onRefresh}
                    onToggleSelectAll={onToggleSelectAll}
                    onSetSelectedRead={isRead => onSaveSelected({ isRead })}
                    onSetSelectedStared={isStared => onSaveSelected({ isStared })}
                    onRemoveSelected={onRemoveSelected} />

                <MailList
                    mails={mails}
                    searchStr={searchParams.toString()}
                    selectedIds={selectedIds}
                    onToggleSelect={onToggleSelect}
                    onRemoveMail={onRemoveMail}
                    onToggleRead={onToggleRead}
                    onToggleStar={onToggleStar} />

                <Outlet context={{ onDraftSaved: loadMails }} />
            </section>
        </section>
    )
}
