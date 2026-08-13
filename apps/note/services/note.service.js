// note service
import { utilService } from "../../../services/util.service";
import { storageService } from "../../../services/async-storage.service";

const NOTE_KEY = 'noteDB'
_createNotes()

export const noteService = {
    query,
    get,
    remove,
    save,
    // getEmptyNote,
    // getDefaultFilter,
    // getFilterFromSearchParams
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

// filterBy = {}
function query() {
    return storageService.query(NOTE_KEY)
        // .then(notes => {
            // if (filterBy.txt) {
            //     const regExp = new RegExp(filterBy.txt, 'i')
                // notes = notes.filter(note => regExp.test(note.))
            // }

            // if (filterBy.) {
            //     notes = notes.filter(note => note. >= filterBy.)
            // }

            return notes
        // })
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


window.ms = noteService