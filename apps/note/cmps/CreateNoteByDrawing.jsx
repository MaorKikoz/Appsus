import { NoteModal } from './NoteModal.jsx'
import { Canvas } from './Canvas.jsx'

export function CreateNoteByDrawing({ note, setIsExpandedForm, setNoteToAdd, isDrawingModalOpen, closeDrawingModal, setDrawingUrl, isAddingNote, setNoteToEdit }) {

    return (

        <NoteModal isOpen={isDrawingModalOpen} onCloseModal={closeDrawingModal}>
            <Canvas
                setNoteToAdd={setNoteToAdd}
                closeDrawingModal={closeDrawingModal}
                setIsExpandedForm={setIsExpandedForm}
                isAddingNote={isAddingNote}
                setNoteToEdit={setNoteToEdit}
                note={note} />
        </NoteModal>
    )
}