const { useState, useEffect } = React
const { Link, useSearchParams } = ReactRouterDOM

// import { NoteList } from "../cmps/NoteList"
import { notes, noteService } from "../services/note.service"
import { utilService } from "../../../services/util.service"
import { showErrorMsg, showSuccessMsg } from "../../../services/event-bus.service"


export function NoteIndex() {
    const [notes, setNotes] = useState(null)

	const [searchParams, setSearchParams] = useSearchParams()
	const [filterBy, setFilterBy] = useState(noteService.getFilterFromSearchParams(searchParams))
 

    function loadNotes() {
        return noteService.query()
        .then(notes => setNotes(notes))
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