const { useState, useEffect, useRef } = React
const { useSearchParams } = ReactRouterDOM

import { NotePreview } from "../cmps/NotePreview.jsx"
import { NoteFilter } from "../cmps/NoteFilter.jsx"
import { Menu } from "../cmps/Menu.jsx"
import { ColorInput } from "../cmps/ColorInput.jsx"
import { noteService } from "../services/note.service.js"
import { showErrorMsg, showSuccessMsg } from "../../../services/event-bus.service.js"


export function NoteIndex() {
	const [notes, setNotes] = useState(null)

	const [searchParams, setSearchParams] = useSearchParams()
	const [filterBy, setFilterBy] = useState(noteService.getFilterFromSearchParams(searchParams))
	const [noteToAdd, setNoteToAdd] = useState(noteService.getEmptyNote())
	const [isExpandedMenu, setIsExpandedMenu] = useState(false)
	const [isExpandedForm, setIsExpandedForm] = useState(false)
	const [isNoteStyle, setIsNoteStyle] = useState(false)

	const noteToAddRef = useRef(noteToAdd)

	useEffect(() => {
		setSearchParams(filterBy)
		loadNotes()
	}, [filterBy])

	useEffect(() => {
		document.body.style.backgroundColor = '#FFFFFF'
	}, [])

	useEffect(() => {
		document.addEventListener('click', handleBodyClick)

		return () => {
			document.removeEventListener('click', handleBodyClick)
		}
	}, [])

	useEffect(() => {
		noteToAddRef.current = noteToAdd
	}, [noteToAdd])

	function loadNotes() {
		return noteService.query(filterBy)
			.then(notes => setNotes(notes))
			.catch(err => showErrorMsg(`Couldn't load notes`))
	}

	// clicking outside the form collapses it, and saves it if anything was typed
	function handleBodyClick(ev) {
		if (ev.target.closest('.collapsible-element')) return

		setIsExpandedForm(false)
		setIsNoteStyle(false)

		const { noteTitle, info = {} } = noteToAddRef.current
		if (noteTitle || info.txt) onAddNote(noteToAddRef.current)
		else resetValues()
	}

	function onSetFilter(filterByToEdit) {
		setFilterBy(prevFilter => ({ ...prevFilter, ...filterByToEdit }))
	}

	function handleTypeChange(value) {
		setFilterBy(prevFilter => ({ ...prevFilter, type: value }))
	}

	function handleInfoChange({ target }) {
		let { value, name: field, type } = target
		switch (type) {
			case 'number':
			case 'range':
				value = +value
				break

			case 'checkbox':
				value = target.checked
				break
		}

		setNoteToAdd(prevNote => {
			if (field === 'noteTitle') return { ...prevNote, noteTitle: value }
			return { ...prevNote, info: { ...prevNote.info, [field]: value } }
		})
	}

	function onSetNoteStyle(style) {
		setNoteToAdd(prevNote => ({ ...prevNote, style }))
	}

	function onToggleIsPinned() {
		setNoteToAdd(prevNote => ({ ...prevNote, isPinned: !prevNote.isPinned }))
	}

	function resetValues() {
		setIsExpandedForm(false)
		setIsNoteStyle(false)
		setNoteToAdd(noteService.getEmptyNote())
	}

	function onAddNote(note) {
		noteService.save({ ...note, id: '' })
			.then(() => {
				showSuccessMsg('Note has been saved successfully')
				resetValues()
				loadNotes()
			})
			.catch(err => {
				console.log('err:', err)
				showErrorMsg(`Problems saving note`)
			})
	}

	function onPinNote(note) {
		const noteToPin = { ...note, isPinned: !note.isPinned }
		noteService.save(noteToPin, noteToPin.isPinned)
			.then(() => loadNotes())
			.catch(err => console.error('Error pinning a note:', err))
	}

	function onDuplicateNote(note) {
		const noteToDuplicate = { ...note, id: '', isPinned: false }
		noteService.save(noteToDuplicate)
			.then(() => {
				showSuccessMsg('Note has been duplicated successfully')
				loadNotes()
			})
			.catch(err => {
				console.log('err:', err)
				showErrorMsg(`Problems duplicating note`)
			})
	}

	function onRemoveNote(noteId) {
		noteService.remove(noteId)
			.then(() => {
				setNotes(prev => prev.filter(note => note.id !== noteId))
				showSuccessMsg(`note ${noteId} removed`)
			})
			.catch(err => showErrorMsg(`Couldn't remove ${noteId}`))
	}

	if (!notes) return <div className="note-index">Loading...</div>

	const bgColor = noteToAdd.style.backgroundColor

	return (
		<div className="note-index">
			<section className="main-note">
				<section className="keep-header">
					<div className="menu-and-logo">
						<button className="note-bars-btn" onClick={() => setIsExpandedMenu(prevValue => !prevValue)}>
							<i className="fa-solid fa-bars"></i>
						</button>
						<div className="keep-logo">
							<i className="fa-regular fa-lightbulb"></i>
							<span>Keep</span>
						</div>
					</div>

					<NoteFilter onSetFilter={onSetFilter} filterBy={filterBy} />
				</section>

				<section className="menu-and-notes">

					<Menu
						isExpandedMenu={isExpandedMenu}
						setIsExpandedMenu={setIsExpandedMenu}
						handleTypeChange={handleTypeChange} />

					<div>
						<section className="new-note">
							<div className="add-note-form collapsible-element" style={{ backgroundColor: bgColor }}>
								<div className="info-area">
									{isExpandedForm && <button
										className={`pin-btn-adding-form ${(noteToAdd.isPinned ? 'pinned' : '')}`}
										onClick={ev => { ev.stopPropagation(); onToggleIsPinned() }}>
										<i className="fa-solid fa-thumbtack"></i>
									</button>}

									<textarea
										className="textarea-input"
										name="noteTitle"
										id="title"
										placeholder={isExpandedForm ? 'Title' : 'New note...'}
										value={noteToAdd.noteTitle || ''}
										onChange={handleInfoChange}
										onClick={() => setIsExpandedForm(true)}
										style={{ backgroundColor: bgColor }} />

									{isExpandedForm && <section className="expanded-form">
										<textarea
											className="textarea-input"
											name="txt"
											id="txt"
											placeholder="New note..."
											value={noteToAdd.info.txt || ''}
											onChange={handleInfoChange}
											style={{ backgroundColor: bgColor }} />

										<div className="actions">
											<div className="actions-toolbar">
												<button
													type="button"
													title="Background color"
													onClick={() => setIsNoteStyle(prevValue => !prevValue)}>
													<i className="fa-solid fa-palette"></i>
												</button>
											</div>
											{isNoteStyle && <ColorInput onSetStyle={onSetNoteStyle} />}
											<button
												className="save-new-note-btn"
												onClick={() => onAddNote(noteToAdd)}>Save</button>
										</div>
									</section>}
								</div>
							</div>

							<NotePreview
								notes={notes}
								onRemoveNote={onRemoveNote}
								loadNotes={loadNotes}
								onPinNote={onPinNote}
								onDuplicateNote={onDuplicateNote}
								setNotes={setNotes}
							/>

						</section>
					</div>
				</section>

			</section>
		</div>
	)
}
