import { noteService } from "../services/note.service.js"

export function ColorPicker({ note, onSetStyle }) {
    const colors = [
        '#41431B',
        '#AEB784',
        '#E3DBBB',
        '#F8F3E1',
    ]

    return <div className="color-picker">
        {colors.map(color => 
            <div
                key={color} 
                style={{ backgroundColor: color }}
                onClick={() => onSetStyle({ backgroundColor: color })}
                className="color-block"></div>)}
    </div>
}