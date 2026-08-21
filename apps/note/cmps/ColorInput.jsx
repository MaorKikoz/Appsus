import { noteService } from "../services/note.service.js"

export function ColorInput({ note, onSetStyle }) {
    const colors = [
        '#41431B',
        '#AEB784',
        '#E3DBBB',
        '#F8F3E1',
        '#FFDFD3',
        '#F39F76',
        '#FFF8B8',
        '#E2F6D3',
        '#AECCDC',
        '#e8dff5',
        '#FCF4DD',
        '#eaece5',
        '#E9E3D4',
        '#EFEFF1'
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