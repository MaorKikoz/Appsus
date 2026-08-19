const { useState } = React

import { mailService } from '../services/mail.service.js'
import { useEffectUpdate } from '../../../custom-hooks/useEffectUpdate.js'
import { LabelPicker } from '../../../cmps/LabelPicker.jsx'

export function MailFilter({ filterBy, onSetFilterBy }) {
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false)

    const [filterByToEdit, setFilterByToEdit] = useState({
        txt: filterBy.txt,
        isRead: filterBy.isRead,
        isStared: filterBy.isStared,
        labels: filterBy.labels,
        from: filterBy.from,
        subject: filterBy.subject,
        fromDate: filterBy.fromDate,
        toDate: filterBy.toDate,
        sortBy: filterBy.sortBy,
        sortDir: filterBy.sortDir,
    })

    useEffectUpdate(() => {
        onSetFilterBy(filterByToEdit)
    }, [filterByToEdit])

    function handleChange(ev) {
        const { value, name, type } = ev.target
        setFilterByToEdit(prev => ({ ...prev, [name]: type === 'number' ? +value : value }))
    }

    function onToggleSortDir() {
        setFilterByToEdit(prev => ({ ...prev, sortDir: prev.sortDir * -1 }))
    }

    function onClearFilter() {
        const defaultFilter = mailService.getDefaultFilter()
        setFilterByToEdit({
            txt: defaultFilter.txt,
            isRead: defaultFilter.isRead,
            isStared: defaultFilter.isStared,
            labels: defaultFilter.labels,
            from: defaultFilter.from,
            subject: defaultFilter.subject,
            fromDate: defaultFilter.fromDate,
            toDate: defaultFilter.toDate,
            sortBy: defaultFilter.sortBy,
            sortDir: defaultFilter.sortDir,
        })
    }

    // the picker reports one label - this decides add vs remove
    function onToggleLabel(label) {
        setFilterByToEdit(prev => ({
            ...prev,
            labels: prev.labels.includes(label)
                ? prev.labels.filter(currLabel => currLabel !== label)
                : [...prev.labels, label],
        }))
    }

    const { txt, isRead, isStared, labels, from, subject, fromDate, toDate, sortBy, sortDir } = filterByToEdit

    return (
        <section className="mail-filter">
            <input
                type="text"
                name="txt"
                value={txt}
                placeholder="Search mail"
                onChange={handleChange} />

            <select name="isRead" value={isRead} onChange={handleChange}>
                <option value="all">All</option>
                <option value="read">Read</option>
                <option value="unread">Unread</option>
            </select>

            <select name="isStared" value={isStared} onChange={handleChange}>
                <option value="all">All</option>
                <option value="stared">Stared</option>
                <option value="unstared">Not stared</option>
            </select>

            <select name="sortBy" value={sortBy} onChange={handleChange}>
                <option value="date">Date</option>
                <option value="title">Title</option>
            </select>

            <button className="btn-sort-dir" onClick={onToggleSortDir}>
                {sortDir === 1 ? '▲' : '▼'}
            </button>

            <button className="btn-clear" onClick={onClearFilter}>Clear</button>

            <button
                className="btn-advanced"
                onClick={() => setIsAdvancedOpen(prev => !prev)}>
                {isAdvancedOpen ? '▲' : '▼'} Advanced
            </button>

            <LabelPicker
                labels={mailService.getLabels()}
                selectedLabels={labels}
                onToggleLabel={onToggleLabel} />

            {isAdvancedOpen && <div className="advanced-filter">
                <input
                    type="text"
                    name="from"
                    value={from}
                    placeholder="From"
                    onChange={handleChange} />

                <input
                    type="text"
                    name="subject"
                    value={subject}
                    placeholder="Subject"
                    onChange={handleChange} />

                <label htmlFor="fromDate">After</label>
                <input
                    type="date"
                    id="fromDate"
                    name="fromDate"
                    value={fromDate}
                    onChange={handleChange} />

                <label htmlFor="toDate">Before</label>
                <input
                    type="date"
                    id="toDate"
                    name="toDate"
                    value={toDate}
                    onChange={handleChange} />
            </div>}
        </section>
    )
}
