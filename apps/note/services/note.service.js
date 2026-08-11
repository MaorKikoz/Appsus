// note service
import { storageService } from "../../../services/async-storage.service";
import { utilService } from "../../../services/util.service";

const NOTES_KEY = 'notesDB'
// _createNotes()

const notes = [
    {
        id: 'n101',
        createdAt: 1112222,
        type: 'NoteTxt',
        isPinned: true,
        style: {
            backgroundColor: '#00d'
        },
        info: {
            txt: 'Fullstack Me Baby!'
        }
    },
    {
        id: 'n102',
        createdAt: 1112223,
        type: 'NoteImg',
        isPinned: false,
        style: {
            backgroundColor: '#0d0'
        },
        info: {
            url: 'http://some-img/me', title: 'Bobi and Me'
        }
    },
    {
        id: 'n103',
        createdAt: 1112224,
        type: 'NoteTodos',
        isPinned: false,
        style: {
            backgroundColor: '#d00'
        },
        info: {
            title: 'Get my stuff together',
            todos: [
                {
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


export const noteService = {
    query,
    get,
    remove,
    save
    // getEmptyNote,
    // getFilterBy,
    // setFilterBy,
    // getDefaultFilter
}

function query(filterBy) {
    return storageService.query(NOTES_KEY)  //.then(notes => {
    // 	if (filterBy.title) {
    // 		const regex = new RegExp(filterBy.title, 'i')
    // 		console.log('regex', regex)
    // 		notes = notes.filter(note => {
    // 			return regex.test(note.title) 
    // 		})
    // 	}
    // if (filterBy.price) {
    // 	notes = notes.filter(note => note.listPrice.amount >= filterBy.price)
    // }

    return notes
}


function get(noteId) {
    return storageService.get(NOTES_KEY, noteId)
        .then(_setNextPrevNoteId)
}

function remove(noteId) {
    return storageService.remove(NOTES_KEY, noteId)
}

function save(note) {
    if (note.id) {
        return storageService.put(NOTES_KEY, note)
    } else {
        return storageService.post(NOTES_KEY, note)
    }
}

function _setNextPrevNoteId(note) {
    return storageService.query(NOTES_KEY)
        .then(notes => {
            const noteIdx = notes.findIndex(currNote => currNote.id === note.id)

            const nextNote = notes[noteIdx + 1] ? notes[noteIdx + 1] : notes[0]
            const prevNote = notes[noteIdx - 1] ? notes[noteIdx - 1] : notes[notes.length - 1]

            note.nextNoteId = nextNote.id
            note.prevNoteId = prevNote.id

            return note
        })
}

// function _createNotes() {
//     let notes = utilService.loadFromStorage(NOTES_KEY)
//     if (!notes || !notes.length) {
//         notes = [
//             {
//                 id: 'n101',
//                 createdAt: 1112222,
//                 type: 'NoteTxt',
//                 isPinned: true,
//                 style: {
//                     backgroundColor: '#00d'
//                 },
//                 info: {
//                     txt: 'Fullstack Me Baby!'
//                 }
//             },
//             {
//                 id: 'n102',
//                 createdAt: 1112223,
//                 type: 'NoteImg',
//                 isPinned: false,
//                 style: {
//                     backgroundColor: '#0d0'
//                 },
//                 info: {
//                     url: 'http://some-img/me', title: 'Bobi and Me'
//                 }
//             },
//             {
//                 id: 'n103',
//                 createdAt: 1112224,
//                 type: 'NoteTodos',
//                 isPinned: false,
//                 style: {
//                     backgroundColor: '#d00'
//                 },
//                 info: {
//                     title: 'Get my stuff together',
//                     todos: [
//                         {
//                             txt: 'Driving license',
//                             isDone: true
//                         },
//                         {
//                             txt: 'Coding power',
//                             isDone: false
//                         }
//                     ]
//                 }
//             }
//         ] utilService.saveToStorage(NOTES_KEY, notes)
//         console.log(notes)
// 	}
// }