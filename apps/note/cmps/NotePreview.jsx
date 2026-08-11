export function NotePreview( {note} ) {
   return <article className="note-preview">
    <h2>{note.info[0]}</h2>
    <p>{note.isPinned}</p>
   </article>
}