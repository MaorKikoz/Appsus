export function MailToolbar({
    mailCount,
    selectedCount,
    onRefresh,
    onToggleSelectAll,
    onSetSelectedRead,
    onSetSelectedStared,
    onRemoveSelected,
}) {
    const isAllSelected = mailCount > 0 && selectedCount === mailCount
    const hasSelection = selectedCount > 0

    return (
        <section className="mail-toolbar">
            <input
                type="checkbox"
                className="select-all"
                title="Select all"
                disabled={!mailCount}
                checked={isAllSelected}
                // the dash between none and all - react has no prop for it
                ref={el => { if (el) el.indeterminate = hasSelection && !isAllSelected }}
                onChange={onToggleSelectAll} />

            <button className="btn-refresh" title="Refresh" onClick={onRefresh}>
                <i className="fa-solid fa-rotate-right"></i>
            </button>

            {/* gmail swaps its overflow menu for the bulk actions once a row is
                ticked - here there is nothing else to overflow, so they just appear */}
            {hasSelection && <div className="bulk-actions">
                <button
                    className="btn-read"
                    title="Mark as read"
                    onClick={() => onSetSelectedRead(true)}>
                    <i className="fa-regular fa-envelope-open"></i>
                </button>

                <button
                    className="btn-unread"
                    title="Mark as unread"
                    onClick={() => onSetSelectedRead(false)}>
                    <i className="fa-solid fa-envelope"></i>
                </button>

                <button
                    className="btn-star"
                    title="Star"
                    onClick={() => onSetSelectedStared(true)}>
                    <i className="fa-solid fa-star"></i>
                </button>

                <button
                    className="btn-unstar"
                    title="Remove star"
                    onClick={() => onSetSelectedStared(false)}>
                    <i className="fa-regular fa-star"></i>
                </button>

                <button
                    className="btn-remove"
                    title="Delete"
                    onClick={onRemoveSelected}>
                    <i className="fa-regular fa-trash-can"></i>
                </button>
            </div>}

            <span className="toolbar-count">
                {hasSelection
                    ? `${selectedCount} selected`
                    : `${mailCount} ${mailCount === 1 ? 'conversation' : 'conversations'}`}
            </span>
        </section>
    )
}
