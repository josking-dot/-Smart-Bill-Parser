'use client';
import { useState} from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-10 h-10 mx-auto text-gray-400">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const Spinner = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-spin h-5 w-5 mr-3">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);

export default function Home() {
    const router = useRouter();
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [billData, setBillData] = useState(null);
    const [error, setError] = useState(null);
    const [editableItems, setEditableItems] = useState([]);
    const [isDragOver, setIsDragOver] = useState(false);
    

  

  // Function to handle file selection from input or drag-and-drop
  const handleFileSelect = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setError('Please select a valid image file');
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };
  // Handler for the file input change event
  const onFileChange = (event) => {
    handleFileSelect(event.target.files[0]);
  };

  // Handler for drag-and-drop events
  const onDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => {
    setIsDragOver(false);
  };

  const onDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    handleFileSelect(event.dataTransfer.files[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);
    setBillData(null); // Clear previous results

    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/parse-bill', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Something went wrong');
      }

      setBillData(result);
      const items = result.items || [];
      setEditableItems(items);
      // compute total if not provided by the API
      const totalValue = result.total != null
        ? String(result.total)
        : (items.reduce((s, it) => {
            const n = parseFloat(String(it?.price || '').replace(/[^0-9.-]+/g, '')) || 0;
            return s + n;
          }, 0)).toFixed(2);
      
      // Store data in localStorage for the edited page
      localStorage.setItem('billData', JSON.stringify({ items, total: totalValue }));
      console.log('Data saved to localStorage:', { items, total: totalValue });
      
      // Force navigation to the edited page
      console.log('Navigating to /edited page');
      router.push('/edited');

    } catch (err) {
      setError(err.message || 'Failed to upload and process the image');
    } finally {
      setLoading(false);    
    }
  };

  return (
       <div className="min-h-screen bg-slate-100 font-sans text-slate-800">
       <style>{`
            @keyframes gradient-animation {
              0% { background-position: 0% 50%; }
              50% { background-position: 100% 50%; }
              100% { background-position: 0% 50%; }
            }
            .animate-gradient {
              background-size: 200% 200%;
              animation: gradient-animation 2s ease infinite;
            }
      `}</style>
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Smart Bill Parser
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            Upload an image of your bill to automatically extract the details.
          </p>
        </header>
        
        <div className="max-w-2xl mx-auto">
            <div className="flex justify-center">
              {/* Centered Upload Section */}
              <div className="w-full bg-white rounded-2xl shadow-lg p-6 flex flex-col">
                <h2 className="text-2xl font-semibold mb-5 text-slate-800 border-b border-slate-200 pb-3">Upload Your Bill</h2>
                
                <div 
                  className={`flex-grow flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-6 transition-colors duration-200 ${isDragOver ? 'border-orange-500 bg-orange-50' : 'border-slate-300'}`}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                >
                  <input
                    type="file"
                    id="file-upload"
                    accept="image/*"
                    onChange={onFileChange}
                    className="hidden"
                  />
                  {!previewUrl ? (
                    <label htmlFor="file-upload" className="text-center cursor-pointer">
                      <UploadIcon />
                      <p className="mt-2 text-sm font-semibold text-orange-600">Click to upload or drag and drop</p>
                      <p className="text-xs text-slate-500">PNG, JPG up to 10MB</p>
                    </label>
                  ) : (
                    <div className="text-center">
                        <Image 
                          src={previewUrl} 
                          alt="Bill preview" 
                          width={160}
                          height={160}
                          className="max-h-40 rounded-lg mx-auto mb-4 shadow-md"
                        />
                        <p className="text-sm text-slate-700 font-medium truncate max-w-xs">{selectedFile?.name}</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || loading}
                  className={`mt-6 w-full flex items-center justify-center text-white px-6 py-3 rounded-lg font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-md disabled:cursor-not-allowed disabled:opacity-75 animate-gradient ${
                    loading
                      ? 'bg-gradient-to-r from-red-500 via-rose-500 to-red-500'
                      : 'bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500'
                  }`}
                >
                  {loading && <Spinner />}
                  {loading ? 'Processing...' : 'Parse Bill'}
                </button>
                
                {selectedFile && !loading && (
                    <button onClick={() => { setSelectedFile(null); setPreviewUrl(null); }} className="text-sm text-red-500 hover:underline mt-4">
                        Remove Bill
                    </button>
                )}

                {error && (
                  <div className="mt-4 p-3 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-r-lg text-sm">
                    <p><span className="font-bold">Error:</span> {error}</p>
                  </div>
                )}
              </div>

              </div>
            </div>
          </div>
        </div>
     
  );
}
