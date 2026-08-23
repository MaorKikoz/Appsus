// mail service

// imports
import { utilService } from '../../../services/util.service.js'
import { storageService } from '../../../services/async-storage.service.js'

const MAIL_KEY = 'mailDB'



const HOUR = 1000 * 60 * 60
const DAY = 1000 * 60 * 60 * 24

export const loggedInUser = {
    email: 'user@appsus.com',
    fullname: 'Mahatma Appsus'
}

const MAIL_LABELS = ['work', 'family', 'important', 'spam', 'romantic']

_createMails()

export const mailService = {
    query,
    get,
    remove,
    removeMany,
    save,
    saveMany,
    send,
    getEmptyMail,
    getDefaultFilter,
    getFilterFromSearchParams,
    getTrimmedFilter,
    getUnreadCount,
    getFolderCounts,
    getKeepUrl,
    getLabels,
    loggedInUser,
}


function query(filterBy = {}) {
    return storageService.query(MAIL_KEY)
        .then(mails => {
            const {
                status = 'inbox',
                txt = '',
                isStared = 'all',
                isRead = 'all',
                labels = [],
                from = '',
                subject = '',
                fromDate = '',
                toDate = '',
                sortBy = 'date',
                sortDir = -1,
            } = filterBy


            mails = mails.filter(mail => _isInFolder(mail, status))

            if (txt) {
                const regExp = new RegExp(_escapeRegex(txt), 'i')
                mails = mails.filter(mail =>
                    regExp.test(mail.subject) ||
                    regExp.test(mail.body) ||
                    regExp.test(mail.from) ||
                    regExp.test(mail.to)
                )
            }

            if (isRead !== 'all') {
                const shouldBeRead = (isRead === 'read')
                mails = mails.filter(mail => !!mail.isRead === shouldBeRead)
            }

            if (isStared !== 'all') {
                const shouldBeStared = (isStared === 'stared')
                mails = mails.filter(mail => !!mail.isStared === shouldBeStared)
            }

            // has ANY of the picked labels. the guard covers mails saved before labels existed
            if (labels.length) {
                mails = mails.filter(mail =>
                    mail.labels && mail.labels.some(label => labels.includes(label)))
            }

            if (from) {
                const regExp = new RegExp(_escapeRegex(from), 'i')
                mails = mails.filter(mail => regExp.test(mail.from))
            }

            if (subject) {
                const regExp = new RegExp(_escapeRegex(subject), 'i')
                mails = mails.filter(mail => regExp.test(mail.subject))
            }

            if (fromDate) {
                const fromTime = new Date(fromDate).getTime()
                mails = mails.filter(mail => (mail.sentAt || mail.createdAt) >= fromTime)
            }

            if (toDate) {
                // + DAY so a date input includes the whole day picked, not just its midnight
                const toTime = new Date(toDate).getTime() + DAY
                mails = mails.filter(mail => (mail.sentAt || mail.createdAt) < toTime)
            }

            if (sortBy === 'date') {
                mails.sort((m1, m2) =>
                    ((m1.sentAt || m1.createdAt) - (m2.sentAt || m2.createdAt)) * sortDir)
            } else if (sortBy === 'title') {
                mails.sort((m1, m2) => m1.subject.localeCompare(m2.subject) * sortDir)
            }

            return mails
        })
}

function _isInFolder(mail, status) {
    switch (status) {
        case 'trash':
            return !!mail.removedAt
        case 'inbox':
            return !mail.removedAt && !!mail.sentAt && mail.to === loggedInUser.email
        case 'sent':
            return !mail.removedAt && !!mail.sentAt && mail.from === loggedInUser.email
        case 'draft':
            return !mail.removedAt && !mail.sentAt
        default:
            return !mail.removedAt
    }
}

function get(mailId, filterBy = null) {
    return storageService.get(MAIL_KEY, mailId)
        .then(mail => {
            if (!filterBy) return mail
            return _setNextPrevMailId(mail, filterBy)
        })
}

function _setNextPrevMailId(mail, filterBy) {
    // status === null means "whichever folder this mail actually lives in"
    if (!filterBy.status) filterBy = { ...filterBy, status: _getMailFolder(mail) }


    return query(filterBy)
        .then(mails => {
            if (!mails.length) {
                mail.nextMailId = mail.id
                mail.prevMailId = mail.id
                return mail
            }
            const mailIdx = mails.findIndex(currMail => currMail.id === mail.id)
            const nextMail = mails[mailIdx + 1] ? mails[mailIdx + 1] : mails[0]
            const prevMail = mails[mailIdx - 1] ? mails[mailIdx - 1] : mails[mails.length - 1]
            mail.nextMailId = nextMail.id
            mail.prevMailId = prevMail.id
            return mail
        })
}



function _getMailFolder(mail) {
    if (mail.removedAt) return 'trash'
    if (!mail.sentAt) return 'draft'
    return (mail.to === loggedInUser.email) ? 'inbox' : 'sent'
}


// nextMailId/prevMailId are computed by get(), they must never reach storage
function _stripSiblingIds(mail) {
    const mailToSave = { ...mail }
    delete mailToSave.nextMailId
    delete mailToSave.prevMailId
    return mailToSave
}

function save(mail) {
    const mailToSave = _stripSiblingIds(mail)

    if (mailToSave.id) {
        return storageService.put(MAIL_KEY, mailToSave)
    } else {
        return storageService.post(MAIL_KEY, mailToSave)
    }
}

function send(mail) {
    const mailToSend = {
        ...mail,
        from: loggedInUser.email,
        sentAt: Date.now(),
        removedAt: null,
        isRead: true,
    }
    return save(mailToSend)
}

function remove(mailId) {
    return storageService.get(MAIL_KEY, mailId)
        .then(mail => {
            if (mail.removedAt) return storageService.remove(MAIL_KEY, mailId)
            return storageService.put(MAIL_KEY, { ...mail, removedAt: Date.now() })
        })
}

// the bulk ops read once and write once. looping the single item versions would
// have every call resolve off the same snapshot, and the last save would
// quietly undo all the others
function removeMany(mailIds) {
    return storageService.query(MAIL_KEY)
        .then(mails => {
            const removedAt = Date.now()
            // same rule as remove(): from the trash it is gone, elsewhere it is trashed
            const remaining = mails
                .filter(mail => !(mailIds.includes(mail.id) && mail.removedAt))
                .map(mail => mailIds.includes(mail.id) ? { ...mail, removedAt } : mail)

            utilService.saveToStorage(MAIL_KEY, remaining)
            return mailIds
        })
}

function saveMany(mailsToSave) {
    return storageService.query(MAIL_KEY)
        .then(mails => {
            const savedById = {}
            mailsToSave.forEach(mail => savedById[mail.id] = _stripSiblingIds(mail))

            utilService.saveToStorage(MAIL_KEY, mails.map(mail => savedById[mail.id] || mail))
            return Object.values(savedById)
        })
}

function getEmptyMail(subject = '', body = '', to = '') {
    return {
        subject,
        body,
        to,
        from: loggedInUser.email,
        createdAt: Date.now(),
        sentAt: null,
        removedAt: null,
        isRead: true,
        isStared: false,
        labels: [],
    }
}


function getLabels() {
    // a copy - a caller that sorts or splices it must not corrupt the source list
    return [...MAIL_LABELS]
}


function getDefaultFilter() {
    return {
        status: 'inbox',
        txt: '',
        isRead: 'all',
        isStared: 'all',
        labels: [],
        from: '',
        subject: '',
        fromDate: '',
        toDate: '',
        sortBy: 'date',
        sortDir: -1,
    }
}

function getFilterFromSearchParams(searchParams) {
    const defaultFilter = getDefaultFilter()
    const filterBy = {}
    for (const field in defaultFilter) {
        filterBy[field] = searchParams.get(field) || defaultFilter[field]
    }
    filterBy.sortDir = +filterBy.sortDir
    // labels travel as one comma separated param: ?labels=work,family
    filterBy.labels = searchParams.get('labels')
        ? searchParams.get('labels').split(',')
        : []
    return filterBy
}

function getTrimmedFilter(filterBy) {
    const defaultFilter = getDefaultFilter()
    const trimmed = {}
    for (const field in filterBy) {
        const value = filterBy[field]
        // arrays need their own branch - [] !== [] is always true
        if (Array.isArray(value)) {
            if (value.length) trimmed[field] = value.join(',')
        } else if (value !== defaultFilter[field]) {
            trimmed[field] = value
        }
    }
    return trimmed
}

function getFolderCounts() {
    return storageService.query(MAIL_KEY)
        .then(mails => {
            const counts = { inbox: 0, sent: 0, draft: 0, trash: 0 }
            mails.forEach(mail => {
                for (const status in counts) {
                    if (!_isInFolder(mail, status)) continue
                    // gmail badges the inbox with unread, the other folders with totals
                    if (status === 'inbox' && mail.isRead) continue
                    counts[status]++
                }
            })
            return counts
        })
}

function getUnreadCount() {
    return query({ status: 'inbox' })
        .then(mails => mails.filter(mail => !mail.isRead).length)
}


function _createMails() {
    let mails = utilService.loadFromStorage(MAIL_KEY)
    if (!mails || !mails.length) {
        mails = _getDemoMails()
        utilService.saveToStorage(MAIL_KEY, mails)
    }
}


function _getDemoMails() {
    const now = Date.now()
    return [
        {
            id: 'e101', subject: 'Miss you!',
            body: 'Would love to catch up sometimes. It has been way too long since we last talked.',
            isRead: false, isStared: false,
            labels: ['family'],
            createdAt: now - 0.5 * DAY, sentAt: now - 0.5 * DAY, removedAt: null,
            from: 'momo@momo.com', to: 'user@appsus.com',
        },
        {
            id: 'e102', subject: 'Sprint 3 - Appsus submission',
            body: 'Reminder: push your work to GitHub Pages before the review. Make sure both apps are reachable from the main navigation.',
            isRead: false, isStared: true,
            labels: ['work', 'important'],
            createdAt: now - 1 * DAY, sentAt: now - 1 * DAY, removedAt: null,
            from: 'team@coding-academy.com', to: 'user@appsus.com',
        },
        {
            id: 'e103', subject: 'Re: code review',
            body: 'Thanks for the notes, I refactored the service layer as you suggested.',
            isRead: true, isStared: false,
            labels: ['work'],
            createdAt: now - 2 * DAY, sentAt: now - 2 * DAY, removedAt: null,
            from: 'user@appsus.com', to: 'yaron@coding-academy.com',
        },
        {
            id: 'e104', subject: 'New arrivals this week',
            body: 'Your weekly picks are ready. Nine new titles were added to your list.',
            isRead: true, isStared: false,
            labels: [],
            createdAt: now - 3 * DAY, sentAt: now - 3 * DAY, removedAt: null,
            from: 'no-reply@netflix.com', to: 'user@appsus.com',
        },
        {
            id: 'e105', subject: 'Dinner on friday?',
            body: 'We are all meeting at eight. Let me know if you can make it, I need to book a table.',
            isRead: false, isStared: true,
            labels: ['family'],
            createdAt: now - 4 * DAY, sentAt: now - 4 * DAY, removedAt: null,
            from: 'mom@family.com', to: 'user@appsus.com',
        },
        {
            id: 'e106', subject: 'Meeting notes from monday',
            body: 'Attaching the summary. Main decision: we go with the nested routes approach.',
            isRead: true, isStared: false,
            labels: ['work'],
            createdAt: now - 5 * DAY, sentAt: now - 5 * DAY, removedAt: null,
            from: 'user@appsus.com', to: 'puki@puki.com',
        },
        {
            id: 'e107', subject: 'Security alert: new sign-in',
            body: 'We noticed a new sign-in to your account from a new device.',
            isRead: true, isStared: false,
            labels: ['important'],
            createdAt: now - 6 * DAY, sentAt: now - 6 * DAY, removedAt: null,
            from: 'noreply@github.com', to: 'user@appsus.com',
        },
        {
            id: 'e108', subject: 'You have won a free cruise!!!',
            body: 'Click here immediately to claim your completely legitimate prize.',
            isRead: true, isStared: false,
            labels: ['spam'],
            createdAt: now - 7 * DAY, sentAt: now - 7 * DAY, removedAt: now - 6 * DAY,
            from: 'winner@totally-real.com', to: 'user@appsus.com',
        },
        {
            id: 'e109', subject: 'Your monthly statement is ready',
            body: 'Your account statement for last month is now available to view.',
            isRead: true, isStared: false,
            labels: [],
            createdAt: now - 9 * DAY, sentAt: now - 9 * DAY, removedAt: null,
            from: 'service@bank.com', to: 'user@appsus.com',
        },
        {
            id: 'e111', subject: 'Standup moved to 10:15',
            body: 'Only for today - the room is booked until then. Same link, no need to rejoin.',
            isRead: false, isStared: false,
            labels: ['work'],
            createdAt: now - 0.4 * HOUR, sentAt: now - 0.4 * HOUR, removedAt: null,
            from: 'dana@coding-academy.com', to: 'user@appsus.com',
        },
        {
            id: 'e112', subject: 'Your pull request needs one more review',
            body: 'Two approvals are required before merge. I have signed off, still waiting on the second.',
            isRead: false, isStared: true,
            labels: ['work', 'important'],
            createdAt: now - 3 * HOUR, sentAt: now - 3 * HOUR, removedAt: null,
            from: 'noreply@github.com', to: 'user@appsus.com',
        },
        {
            id: 'e113', subject: 'Table for two, Friday 20:00',
            body: 'Confirmed. Let us know in advance if anything changes, the terrace fills up quickly.',
            isRead: true, isStared: false,
            labels: [],
            createdAt: now - 7 * HOUR, sentAt: now - 7 * HOUR, removedAt: null,
            from: 'reservations@thelittlekitchen.com', to: 'user@appsus.com',
        },
        {
            id: 'e114', subject: 'Thinking of you',
            body: 'No reason. Just remembered the walk we took by the river and wanted to say it out loud.',
            isRead: false, isStared: true,
            labels: ['romantic'],
            createdAt: now - 10 * HOUR, sentAt: now - 10 * HOUR, removedAt: null,
            from: 'noa@gmail.com', to: 'user@appsus.com',
        },
        {
            id: 'e115', subject: 'CLAIM YOUR INHERITANCE TODAY',
            body: 'A distant relative has left you a considerable sum. Reply with your bank details to proceed.',
            isRead: true, isStared: false,
            labels: ['spam'],
            createdAt: now - 1.5 * DAY, sentAt: now - 1.5 * DAY, removedAt: null,
            from: 'barrister@definitely-legal.info', to: 'user@appsus.com',
        },
        {
            id: 'e116', subject: 'Re: Standup moved to 10:15',
            body: 'Works for me, I will bring the numbers from yesterday.',
            isRead: true, isStared: false,
            labels: ['work'],
            createdAt: now - 0.2 * HOUR, sentAt: now - 0.2 * HOUR, removedAt: null,
            from: 'user@appsus.com', to: 'dana@coding-academy.com',
        },
        {
            id: 'e117', subject: 'Weekend plans',
            body: 'I was thinking we could',
            isRead: true, isStared: false,
            labels: ['family'],
            createdAt: now - 2 * HOUR, sentAt: null, removedAt: null,
            from: 'user@appsus.com', to: 'mom@family.com',
        },
        {
            id: 'e118', subject: '',
            body: 'Reminder to myself: check whether the compose overlay keeps the filter on close.',
            isRead: true, isStared: false,
            labels: [],
            createdAt: now - 20 * HOUR, sentAt: null, removedAt: null,
            from: 'user@appsus.com', to: '',
        },
        {
            id: 'e119', subject: 'Old newsletter nobody reads',
            body: 'Unsubscribe link is at the bottom, in four point grey on white, as tradition demands.',
            isRead: true, isStared: false,
            labels: ['spam'],
            createdAt: now - 14 * DAY, sentAt: now - 14 * DAY, removedAt: now - 3 * DAY,
            from: 'digest@weekly-things.com', to: 'user@appsus.com',
        },
        {
            id: 'e110', subject: 'Lunch?',
            body: 'There is a new place around the corner, want to try it tomorrow?',
            isRead: false, isStared: false,
            labels: [],
            createdAt: now - 11 * DAY, sentAt: now - 11 * DAY, removedAt: null,
            from: 'muki@muki.com', to: 'user@appsus.com',
        },
    ]

}

function _escapeRegex(txt) {
    return txt.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getKeepUrl(mail) {
    const params = new URLSearchParams({
        addNote: 'NoteTxt',
        noteTitle: mail.subject || '',
        noteTxt: mail.body || '',
    })
    return `/note?${params.toString()}`
}