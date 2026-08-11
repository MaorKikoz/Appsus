const { useState, useEffect } = React

import { NoteList } from "../cmps/NoteList"
import { noteService } from "../services/note.service"


export function NoteIndex() {
    const [notes, setNotes] = useState([])
    //const [filterBy, setFilterBy] = useState({})
    const [selectedNote, setSelectedNote] = useState(null)
       


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

    return <section className="NoteIndex">
        {/* <NoteFilter filterBy={filterBy} setFilterBy={setFilterBy} /> */}
        <NoteList notes={notes} onRemoveNote={onRemoveNote} onSetSelectedNote={setSelectedNote} />
        {/* <NoteDetails selectedNote={selectedNote} onCloseDetails={onCloseDetails}/> */}
    </section>
}