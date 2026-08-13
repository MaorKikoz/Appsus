const { useState, useEffect } = React
const { Link, useSearchParams } = ReactRouterDOM

// import { NoteList } from "../cmps/NoteList.jsx"
import { notes, noteService } from "../services/note.service.js"
import { utilService } from "../../../services/util.service.js"
import { showErrorMsg, showSuccessMsg } from "../../../services/event-bus.service.js"


export function NoteIndex() {
	const [notes, setNotes] = useState(null)

	const [searchParams, setSearchParams] = useSearchParams()
	const [filterBy, setFilterBy] = useState(noteService.getFilterFromSearchParams(searchParams))

	useEffect(() => {
		setSearchParams(filterBy)
		loadNotes()
	}, [filterBy])


	function loadNotes() {
		return noteService.query(filterBy)
			.then(notes => setNotes(notes))
			.catch(err => showErrorMsg(`Couldn't load notes`))
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

	if (!notes) return <div className="note-index">Loading...</div>

	return (
		<div className="note-index">
			<pre>{JSON.stringify(notes, null, 2)}</pre>
		</div>
	)
}








//render demodata (which way i'm supposed to do that?????)
// design ui (help me)