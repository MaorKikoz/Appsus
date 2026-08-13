// note service
import { utilService } from "../../../services/util.service.js"
import { storageService } from "../../../services/async-storage.service.js"

const NOTE_KEY = 'noteDB'
_createNotes()

export const noteService = {
    query,
    get,
    remove,
    save,
    getEmptyNote,
    getDefaultFilter,
    getFilterFromSearchParams
}

function _createNotes() {
    let notes = utilService.loadFromStorage(NOTE_KEY)
    if (!notes || !notes.length) {
        notes = [
    {
        id: 'n101',
        createdAt: 1112222,
        type: 'NoteTxt',
        isPinned: true,
        style: { backgroundColor: '#00d' },
        info: { txt: 'Fullstack Me Baby!' }
    }, {
        id: 'n102',
        createdAt: 1112223,
        type: 'NoteImg',
        isPinned: false,
        style: { backgroundColor: '#0d0' },
        info: {
            url: 'http://some-img/me',
            title: 'Bobi and Me'
        }
    }, {
        id: 'n103',
        createdAt: 1112224,
        type: 'NoteTodos',
        isPinned: false,
        style: { backgroundColor: '#d00' },
        info: {
            title: 'Get my stuff together',
            todos: [{
                txt: 'Driving license',
                isDone: true
            },
            {
                txt: 'Coding power',
                isDone: false
            }
            ]
        }
    }
]
        utilService.saveToStorage(NOTE_KEY, notes)
    }
}

function query(filterBy = {}) {
    return storageService.query(NOTE_KEY)
        .then(notes => {
            if (filterBy.txt) {
                const regExp = new RegExp(filterBy.txt, 'i')
                notes = notes.filter(note => regExp.test(_getSearchableTxt(note)))
            }

            if (filterBy.type) {
                notes = notes.filter(note => note.type === filterBy.type)
            }

            return notes
        })
}


function get(noteId) {
    return storageService.get(NOTE_KEY, noteId)
        .then(note => {
            note = _setNextPrevNoteId(note)
            return note
        })
}


function remove(noteId) {
    return storageService.remove(NOTE_KEY, noteId)
}

function save(note) {
    if (note.id) {
        return storageService.put(NOTE_KEY, note)
    } else {
        return storageService.post(NOTE_KEY, note)
    }
}

function getEmptyNote(type = 'NoteTxt') {
    return {
        type,
        createdAt: Date.now(),
        isPinned: false,
        style: { backgroundColor: '#ffffff' },
        info: _getEmptyInfo(type)
    }
}

function getDefaultFilter() {
    return { txt: '', type: '' }
}

function getFilterFromSearchParams(searchParams) {
    const defaultFilter = getDefaultFilter()
    const filterBy = {}
    for (const field in defaultFilter) {
        filterBy[field] = searchParams.get(field) || defaultFilter[field]
    }
    return filterBy
}

function _getEmptyInfo(type) {
    switch (type) {
        case 'NoteImg':
            return { url: '', title: '' }
        case 'NoteTodos':
            return { title: '', todos: [] }
        case 'NoteTxt':
        default:
            return { txt: '' }
    }
}

// The three note types keep their text in different places
function _getSearchableTxt(note) {
    const { info = {} } = note
    switch (note.type) {
        case 'NoteImg':
            return info.title || ''
        case 'NoteTodos':
            const todoTxts = (info.todos || []).map(todo => todo.txt)
            return [info.title || '', ...todoTxts].join(' ')
        case 'NoteTxt':
        default:
            return info.txt || ''
    }
}

function _setNextPrevNoteId(note) {
    return query().then(notes => {
        const noteIdx = notes.findIndex(currNote => currNote.id === note.id)
        const nextNote = notes[noteIdx + 1] || notes[0]
        const prevNote = notes[noteIdx - 1] || notes[notes.length - 1]
        note.nextNoteId = nextNote.id
        note.prevNoteId = prevNote.id
        return note
    })
}

window.ms = noteService