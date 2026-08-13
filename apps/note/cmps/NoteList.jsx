const { Link } = ReactRouterDOM
// import { NotePreview } from "./NotePreview.jsx"

export function NoteList({ notes, onRemoveNote }) {
    return <section className="note-list">
        <ul>
            {notes.map(note => <li key={note.id}>
                <NotePreview note={note} />
                
                <div className="actions">
                    <Link to={`/note/${note.id}`}>
                        <button className="btn-details">Details</button>
                    </Link>
                    <Link to={`/note/edit/${note.id}`}>
                        <button className="btn-edit">Edit</button>
                    </Link>
                    <button onClick={() => onRemoveNote(note.id)} className="btn-remove">x</button>
                </div>
            </li>)}
        </ul>
    </section>
}