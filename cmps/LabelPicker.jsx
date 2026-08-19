export function LabelPicker({ labels, selectedLabels = [], onToggleLabel }) {

    function getClassName(label) {
        const classNames = ['label-chip', `label-${label}`]
        if (selectedLabels.includes(label)) classNames.push('is-selected')
        return classNames.join(' ')
    }

    return <section className="label-picker">
        {labels.map(label => (
            <button
                key={label}
                type="button"
                className={getClassName(label)}
                onClick={() => onToggleLabel(label)}>
                {label}
            </button>
        ))}
    </section>
}
