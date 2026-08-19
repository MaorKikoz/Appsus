const { useState, useEffect, Fragment, useRef } = React
const { Link, useSearchParams, useNavigate } = ReactRouterDOM

import { NoteList } from "../cmps/NoteList.jsx"
import { NotePreview } from "../cmps/NotePreview.jsx"
import { NoteFilter } from "../cmps/NoteFilter.jsx"
import { Menu } from "../cmps/Menu.jsx"
import { notes, noteService } from "../services/note.service.js"
import { utilService } from "../../../services/util.service.js"
import { showErrorMsg, showSuccessMsg } from "../../../services/event-bus.service.js"


export function NoteIndex() {
	const [notes, setNotes] = useState(null)

	const [searchParams, setSearchParams] = useSearchParams()
	const [filterBy, setFilterBy] = useState(noteService.getFilterFromSearchParams(searchParams))
	const [showFilterOption, setShowFilterOption] = useState(false)
	const [noteToAdd, setNoteToAdd] = useState(noteService.getEmptyNote())
	const [isExpandedMenu, setIsExpandedMenu] = useState(false)
	const [isExpandedForm, setIsExpandedForm] = useState(false)

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


	function handleBodyClick(ev) {
		if (!ev.target.closest('.collapsible-element')) {
			setIsExpandedForm(false)

			if (noteToAddRef.current.noteTitle || noteToAddRef.current.info.txt || noteToAddRef.current.info.drawingUrl ||
				noteToAddRef.current.info.imgUrl || noteToAddRef.current.info.videoUrl || noteToAddRef.current.info.todos) {
				onSubmit(noteToAddRef.current, true)
			}
			resetValues()
		}
	}

	function onSetFilter(filterByToEdit) {
		setFilterBy(prevFilter => ({ ...prevFilter, ...filterByToEdit }))
	}

	function handleFromClick() {
		setShowFilterOption(true)
	}

	function handleInfoChange({ target }) {
		let { value, name: field, type } = target
		switch (type) {
			case 'number':
			case 'range':
				value = +value
				break;

			case 'checkbox':
				value = target.checked
				break
		}

		function onClearForm() {
			setNoteToAdd(noteService.getEmptyNote())
		}

		function onPinNote(note) {
			const noteToPin = { ...note, isPinned: !note.isPinned }
			noteService.save(noteToPin, noteToPin.isPinned)
				.then(() => loadNotes())
				.catch(err => console.error('Error pin a book:', err))
		}

		function onDuplicateNote(note) {
			const noteToDuplicate = { ...note, id: '', isPinned: false }
			noteService.save(noteToDuplicate)
				.then(() => {
					console.log('note duplicated')
					showSuccessMsg('Note has been duplicated successfully')
					loadNotes()
				})
				.catch(err => {
					console.log('err:', err)
					showErrorMsg(`Problems duplicating note`)
				})
		}

		function resetValues() {
			setCmpType('NoteTxt')
			setIsNoteStyle(false)
			setTodosCounter(0)
			setNoteToAdd(noteService.getEmptyNote())
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

		function handleTypeChange(value) {
			setFilterBy(prevFilter => ({ ...prevFilter, type: value }))
		}

		const bgColor = noteToAdd.style.backgroundColor

		if (!notes) return <div className="note-index">Loading...</div>

		return (
			<div className="note-index">
				<section className="main-note">
					<section className="keep-header">
						<div className="menu-and-logo">
							<button className="note-bars-btn" onClick={() => { setIsExpandedMenu(prevValue => !prevValue) }}>
								<img src="assets\img\menu.png" />
							</button>
							<div className="keep-logo">
								<img src="assets\img\keeps.png" />
								<span>Keep</span>
							</div>
						</div>

						<NoteFilter onSetFilter={onSetFilter} filterBy={filterBy} handleFromClick={handleFromClick} />
					</section>

					<section className="menu-and-notes">

						<Menu
							setShowFilterOption={setShowFilterOption}
							isExpandedMenu={isExpandedMenu}
							setIsExpandedMenu={setIsExpandedMenu}
							handleTypeChange={handleTypeChange} />
						<div>
							{showFilterOption &&
								<section className="search">
									<FilterOptions setFilterBy={setFilterBy} filterBy={filterBy} handleTypeChange={handleTypeChange} />
								</section>}

							<section className="new-note">
								<div className="add-note-form collapsible-element" style={{ backgroundColor: bgColor }}>

									<div className="add-video-or-img">
										{isExpandedForm && noteToAdd.info.imgUrl && renderImgOrVideo(<img src={noteToAdd.info.imgUrl} />, 'img')}
										{isExpandedForm && noteToAdd.info.videoUrl && renderImgOrVideo(<iframe src={noteToAdd.info.videoUrl} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture">
										</iframe>, 'video')}
									</div>

									<div className="info-area">
										{isExpandedForm && <button
											className={`pin-btn-adding-form ${(noteToAdd.isPinned ? 'pinned' : '')}`}
											onClick={(ev) => { ev.stopPropagation(); onToggleIsPinned() }}>
											{noteToAdd.isPinned ? <img src="assets/img/pin-full.png" /> : <img src="assets/img/pin-empty.png" />}
										</button>}

										<textarea
											className="textarea-input"
											type="text"
											name="noteTitle"
											id="title"
											placeholder={`${isExpandedForm ? 'Title' : 'New note...'}`}
											value={noteToAdd.noteTitle}
											onChange={handleInfoChange}
											onClick={() => setIsExpandedForm(true)}
											style={{ backgroundColor: bgColor }} />

										{!isExpandedForm && <div className="actions-collapsed-form">
											<div><img src="assets/img/check-box-icon.png"
												onClick={(ev) => {
													ev.stopPropagation()
													setCmpType('NoteTodos')
													setTodosCounter(prevCount => prevCount + 1);
													setIsExpandedForm(true)
												}} /></div>

											<div><img src="assets/img/image-icon.png"
												onClick={(ev) => {
													ev.stopPropagation()
													setCmpType('NoteImg')
													setIsExpandedForm(true)
												}} /></div>

											<div><img src="assets/img/brush.png"
												onClick={(ev) => {
													ev.stopPropagation()
													setCmpType('NoteDrawing')
													setIsExpandedForm(true)
													setIsDrawingModalOpen(true)
												}} /></div>

											<div><img src="assets/img/videocam-icon.png"
												onClick={(ev) => {
													ev.stopPropagation();
													setCmpType('NoteVideo');
													setIsExpandedForm(true)
												}} /></div>
										</div>}

										{isExpandedForm && <section className="expanded-form">
											<textarea
												className="textarea-input"
												type="text"
												name="txt"
												id="txt"
												placeholder="New note..."
												value={noteToAdd.info.txt || ''}
												onChange={(ev) => { handleInfoChange(ev); handleChangeTextAreaDimensions(ev) }}
												style={{ backgroundColor: bgColor }} />


											<div className="actions">
												<div className="actions-toolbar">
													<button
														title="Background color"
														onClick={() => setIsNoteStyle(isNoteStyle => !isNoteStyle)}>
														<i className="fa-solid fa-palette"></i>
													</button>

													<button
														type='button'
														title="Add image"
														onClick={() => { setCmpType('NoteImg'); setTodosCounter(0) }}>
														<i className="fa-solid fa-image"></i>
													</button>

													<button
														type='button'
														title="Add video"
														onClick={() => { setCmpType('NoteVideo'); setTodosCounter(0) }}>
														<i className="fa-solid fa-video">
														</i></button>

													<button
														type='button'
														title="Todo list"
														onClick={() => { setCmpType('NoteTodos'); setTodosCounter(prevCount => prevCount + 1) }}>
														<i className="fa-regular fa-square-check"></i>
													</button>

													<button
														type='button'
														title="Drawing"
														onClick={() => { setCmpType('NoteDrawing'); setIsDrawingModalOpen(true) }}>
														<i className="fa-solid fa-paintbrush"></i>
													</button>

													<button
														type='button'
														title="Tag"
														onClick={() => { setCmpType('NoteTag') }}>
														<i className="fa-solid fa-tag"></i>
													</button>
												</div>
												{isNoteStyle && <ColorInput onSetNoteStyle={onSetNoteStyle} bgColor={bgColor} />}
												<button className="save-new-note-btn" onClick={onSubmit}>Save</button>
											</div>

										</section>
										}
									</div>
								</div>

								<NotePreview
									notes={notes}
									onRemoveNote={onRemoveNote}
									loadNotes={loadNotes}
									onPinNote={onPinNote}
									onDuplicateNote={onDuplicateNote}
									// setNoteType={setNoteType}
									setNotes={setNotes}
								/>

							</section>
						</div>
					</section>

				</section>
			</div>
		)
	}
}
