import { useEffect, useRef, useState } from "react";
import "./SearchDropdown.css";

function SearchDropdown({
    valueText,               // Texto que se muestra en el input
    setValueText,            // Setter del texto
    data = [],               // Lista de objetos [{id, label}]
    onSelect,                // Cuando el usuario elige algo
    placeholder = "Search...",
    allowCreate = false,     // Mostrar opción de crear
    onCreate = () => {},     // Cuando el usuario quiera crear
}) {
    const [show, setShow] = useState(false);
    const [filtered, setFiltered] = useState([]);

    const ref = useRef(null);

    // Filtrar items al escribir
    useEffect(() => {
        setFiltered(
            data.filter((item) =>
                item.label.toLowerCase().includes(valueText.toLowerCase())
            )
        );
    }, [valueText, data]);

    // Cerrar al hacer clic fuera
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setShow(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="dropdown-container" ref={ref}>
            <input
                type="text"
                className="dropdown-input"
                placeholder={placeholder}
                value={valueText}
                onChange={(e) => setValueText(e.target.value)}
                onFocus={() => setShow(true)}
                required
            />

            {show && (
                <ul className="dropdown-list">
                    {filtered.length > 0 ? (
                        filtered.map((item) => (
                            <li
                                key={item.id}
                                className="dropdown-item"
                                onClick={() => {
                                    onSelect(item);
                                    setShow(false);
                                }}
                            >
                                {item.label}
                            </li>
                        ))
                    ) : (
                        <li className="dropdown-noresults">No results</li>
                    )}

                    {allowCreate && valueText.trim() !== "" && (
                        <li
                            className="dropdown-create"
                            onClick={() => {
                                onCreate(valueText);
                                setShow(false);
                            }}
                        >
                            Create "{valueText}"
                        </li>
                    )}
                </ul>
            )}
        </div>
    );
}

export default SearchDropdown;
