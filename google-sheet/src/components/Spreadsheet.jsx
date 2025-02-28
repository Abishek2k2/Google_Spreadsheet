import { useState, useEffect } from "react";
import { Bold, Italic } from "lucide-react";

const ROWS = 10;
const COLS = 10;

const Spreadsheet = () => {
  const [data, setData] = useState(() => {
    const savedData = localStorage.getItem("spreadsheetData");
    return savedData
      ? JSON.parse(savedData)
      : Array(ROWS).fill(null).map(() => Array(COLS).fill({ value: "", style: {} }));
  });  

  useEffect(() => {
    localStorage.setItem("spreadsheetData", JSON.stringify(data));
  }, [data]);
  

  const [selectedCell, setSelectedCell] = useState(null);

  const handleChange = (row, col, value) => {
    setData(prevData => {
      let newData = [...prevData];
      if (col >= newData[0].length) {
        newData = newData.map(rowData => [...rowData, { value: "", style: {} }]);
      }
      newData[row][col] = { ...newData[row][col], value };
      return newData;
    });
  };
    
  
  const applyStyle = (styleKey, value) => {
    if (!selectedCell) return;
    const [row, col] = selectedCell;
    setData(prevData =>
      prevData.map((r, rIdx) =>
        rIdx === row
          ? r.map((c, cIdx) => (cIdx === col ? { ...c, style: { ...c.style, [styleKey]: value } } : c))
          : r
      )
    );
  };
  

  const evaluateFormula = (formula) => {
    try {
      if (formula.startsWith("=")) {
        const parsedFormula = formula.slice(1).toUpperCase();
        const match = parsedFormula.match(/(SUM|AVERAGE|MAX|MIN|COUNT)\((\w+\d+):(\w+\d+)\)/);
        if (match) {
          const [, func, startCell, endCell] = match;
          const [startRow, startCol] = parseCell(startCell);
          const [endRow, endCol] = parseCell(endCell);

          let values = [];
          for (let r = startRow; r <= endRow; r++) {
            for (let c = startCol; c <= endCol; c++) {
              let cellValue = parseFloat(data[r][c]?.value);
              if (!isNaN(cellValue)) values.push(cellValue);
            }
          }

          switch (func) {
            case "SUM": return values.reduce((a, b) => a + b, 0);
            case "AVERAGE": return values.length ? (values.reduce((a, b) => a + b, 0) / values.length) : 0;
            case "MAX": return Math.max(...values);
            case "MIN": return Math.min(...values);
            case "COUNT": return values.length;
            default: return "ERROR";
          }
        }
      }
      return formula;
    } catch (error) {
      if (!formula) return "";
    }    
  };

  const uploadCSV = (event) => {
    const file = event.target.files[0];
    if (!file) return;
  
    const reader = new FileReader();
    reader.onload = (e) => {
      const csv = e.target.result;
      const rows = csv.split("\n").map(row => row.split(",").map(cell => ({ value: cell.replace(/"/g, ""), style: {} })));
  
      setData(rows);
    };
  
    reader.readAsText(file);
  };
  

  const downloadCSV = () => {
    const csvContent = data
      .map(row => row.map(cell => `"${cell.value}"`).join(","))
      .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
  
    const a = document.createElement("a");
    a.href = url;
    a.download = "spreadsheet.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const parseCell = (cell) => {
    const match = cell.match(/^([A-Z]+)(\d+)$/);
    if (!match) return [null, null];
    const [, colStr, rowStr] = match;
    let col = colStr.split("").reduce((acc, char) => acc * 26 + (char.charCodeAt(0) - 65 + 1), 0) - 1;
    const row = parseInt(rowStr, 10) - 1;
    return [row, col];
  };

  const getColumnLabel = (index) => {
    let label = "";
    while (index >= 0) {
      label = String.fromCharCode((index % 26) + 65) + label;
      index = Math.floor(index / 26) - 1;
    }
    return label;
  };  

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex gap-2 mb-4 bg-emerald-800 p-2 rounded-lg">
        <button onClick={() => applyStyle("fontWeight", "bold")} className="p-2 bg-gray-700 rounded">
          <Bold className="text-white w-5 h-5" />
        </button>
        <button onClick={() => applyStyle("fontStyle", "italic")} className="p-2 bg-gray-700 rounded">
          <Italic className="text-white w-5 h-5" />
        </button>
        <select onChange={(e) => applyStyle("fontSize", e.target.value)} className="p-1 bg-gray-700 text-white rounded">
          <option value="12px">12px</option>
          <option value="16px">16px</option>
          <option value="20px">20px</option>
        </select>
        <input type="color" onChange={(e) => applyStyle("color", e.target.value)} className="p-1 bg-gray-700 rounded" />
        <button 
          onClick={() => {
          setData(Array(ROWS).fill(null).map(() => Array(COLS).fill({ value: "", style: {} })));
          localStorage.removeItem("spreadsheetData");
          }}
          className="p-2 bg-red-600 rounded text-white"
        >
        Clear Data
        </button>
        <input
          type="file"
          accept=".csv"
          onChange={uploadCSV}
          className="p-1 bg-gray-700 rounded text-white"
        />

        <button onClick={downloadCSV} className="p-2 bg-gray-700 rounded text-white">
          Download CSV
        </button>

      </div>

      {/* Spreadsheet Table */}
      <table className="border-collapse border border-emerald-500 w-full text-white">
      <thead>
        <tr>
        <th className="border border-emerald-500 p-2"></th>
          {data[0].map((_, col) => (
        <th key={col} className="border border-emerald-500 p-2">{getColumnLabel(col)}</th>
          ))}
        </tr>
        </thead>

        <tbody>
          {data.map((rowData, row) => (
            <tr key={row}>
              <td className="border border-emerald-500 p-2 text-center">{row + 1}</td>
              {rowData.map((cell, col) => (
                <td key={col} className="border border-emerald-500 p-2">
                  <input
                    type="text"
                    value={cell.raw?.startsWith("=") ? evaluateFormula(cell.raw) : cell.value}
                    onFocus={() => setSelectedCell([row, col])}
                    onChange={(e) => handleChange(row, col, e.target.value)}
                    className="w-full bg-transparent text-white text-center focus:outline-none"
                    style={cell.style}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Spreadsheet;
