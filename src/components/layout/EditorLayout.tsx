import { useMapStore } from '../../store/useMapStore';

export function EditorLayout() {
  const { selectedTool, setTool, selectedTileHeight, setTileHeight } = useMapStore();
  
  return (
    <div className="absolute top-4 left-4 p-4 bg-black/50 rounded-lg">
      <h2 className="text-xl font-bold mb-4">Hex Map Editor</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Tools</h3>
          <div className="flex space-x-2">
            <button
              className={`px-3 py-1 rounded ${selectedTool === 'tile' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setTool('tile')}
            >
              Tile
            </button>
            <button
              className={`px-3 py-1 rounded ${selectedTool === 'asset' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setTool('asset')}
            >
              Asset
            </button>
            <button
              className={`px-3 py-1 rounded ${selectedTool === 'delete' ? 'bg-blue-600' : 'bg-gray-700'}`}
              onClick={() => setTool('delete')}
            >
              Delete
            </button>
          </div>
        </div>

        {selectedTool === 'tile' && (
          <div>
            <h3 className="font-semibold mb-2">Tile Height</h3>
            <div className="flex space-x-2">
              {[1, 2, 5].map((height) => (
                <button
                  key={height}
                  className={`px-3 py-1 rounded ${
                    selectedTileHeight === height ? 'bg-green-600' : 'bg-gray-700'
                  }`}
                  onClick={() => setTileHeight(height as 1 | 2 | 5)}
                >
                  {height}m
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
