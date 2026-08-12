const { useState, useEffect } = React
const { Link, useSearchParams } = ReactRouterDOM

import { NoteList } from "../cmps/NoteList"
import { demoNotes, noteService } from "../services/note.service"
import { utilService } from "../../../services/util.service"
import { showErrorMsg, showSuccessMsg } from "../../../services/event-bus.service"

const demoNotes = [
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

export function NoteIndex() {
    const [notes, setNotes] = useState(null)

	const [searchParams, setSearchParams] = useSearchParams()
	const [filterBy, setFilterBy] = useState(noteService.getFilterFromSearchParams(searchParams))
 

    function loadNotes() {
        return noteService.query()
        .then(notes => setNotes(demoNotes))
    }

    function onRemoveNote(noteId) {
		noteService
			.remove(noteId)
			.then(() => {
				setNotes(prev => prev.filter(note => note.id !== noteId))
				onClearFilter()
				showSuccessMsg(`note ${noteId} removed`)
			})
			.catch(err => showErrorMsg(`Couldn't remove ${noteId}`))
	}
   
    return (
    <div className="note-index">
		<pre>{JSON.stringify(notes, null, 2)}</pre>
		</div>
        )
}








//render demodata (which way i'm supposed to do that?????)
// design ui (help me)