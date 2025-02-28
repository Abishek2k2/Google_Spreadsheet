import Spreadsheet from "./components/Spreadsheet";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-emerald-500">Google Sheets Clone</h1>
      </div>
      <Spreadsheet />
    </div>
  );
}

export default App;
