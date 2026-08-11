import { NotePreview } from "./NotePreview"

export function NoteList({ notes,  onSetSelectedNote, onRemoveNote }) {
	return (
		<ul className="note-list">
			{notes.map(note => (
				<li key={note.id}>
					<NotePreview note={note} />
                    <button onClick={() => onRemoveNote(note.id)}>x</button>
                    <button onClick={() => onSetSelectedNote(note)}>Details</button>
				</li>
			))}
		</ul>
	)
}