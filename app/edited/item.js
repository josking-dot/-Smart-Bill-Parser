"use client";
import React, { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";

const FileIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-8 h-8 text-gray-500">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 6h18" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);


export default function Item() {
  const router = useRouter();
  
  const [billData, setBillData] = useState(null);
  const [editableItems, setEditableItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState("0.00");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("billData");
      if (raw) {
        const parsed = JSON.parse(raw);
        setBillData(parsed);
        setEditableItems(Array.isArray(parsed.items) ? parsed.items : []);
        setTotal(parsed.total != null ? String(parsed.total) : "0.00");
      }
    } catch (e) {
      // ignore parse errors
    } finally {
      setLoading(false);
    }
  }, []);

  // Helper to compute total from items (robustly parses price strings)
  const computeTotal = (items) => {
    if (!items || !items.length) return '0.00';
    const sum = items.reduce((s, it) => {
      const n = parseFloat(String(it?.price || '').replace(/[^0-9.-]+/g, '')) || 0;
      return s + n;
    }, 0);
    return sum.toFixed(2);
  };

  // Keep `total` state in sync whenever editableItems change
  useEffect(() => {
    setTotal(computeTotal(editableItems));
  }, [editableItems]);

  const updateItem = (index, field, value) => {
    setEditableItems((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addItem = () => setEditableItems((prev) => [...prev, { name: "", price: "0.00" }]);

  const removeItem = (index) => setEditableItems((prev) => prev.filter((_, i) => i !== index));

  
    const handleSplitBill = () => {
    // Store the bill data in localStorage to pass to the split page
    const billDataToPass = {
      items: editableItems,
      total: total
    };
    localStorage.setItem('billData', JSON.stringify(billDataToPass));
    router.push('/split');
  };
  return (
    <div>
       <div className="min-h-screen flex items-center justify-center p-6">
      <style>{`
        @keyframes pop { from { transform: scale(.98); opacity: .92 } to { transform: scale(1); opacity: 1 } }
        .pop { animation: pop 180ms cubic-bezier(.2,.8,.2,1); }
      `}</style>

      <div className="w-full max-w-sm pop">
        <div className="text-black font-semibold">
          <div className="bg-white rounded-2xl shadow-lg p-4 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-black border-b border-slate-200 pb-2">Extracted Items</h2>

            {loading ? (
              <div className="space-y-4 animate-pulse">
                <div className="h-10 bg-slate-200 rounded-md"></div>
                <div className="h-10 bg-slate-200 rounded-md"></div>
                <div className="h-10 bg-slate-200 rounded-md"></div>
              </div>
            ) : billData ? (
              <>
                <div className="flex-grow space-y-3 overflow-y-auto pr-2 max-h-56">
                  {editableItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center p-2 rounded-lg hover:bg-slate-50 transition-colors">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => updateItem(index, "name", e.target.value)}
                        placeholder="Item name"
                        className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-black">Rs </span>
                        <input
                          type="number"
                          step="0.01"
                          value={item.price}
                          onChange={(e) => updateItem(index, "price", e.target.value)}
                          placeholder="0.00"
                          className="w-28 pl-9 pr-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                      <button
                        onClick={() => removeItem(index)}
                        className="text-black hover:text-black p-2 rounded-full hover:bg-red-100 transition-colors"
                        aria-label="Remove item"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="mt-4">
                  <button
                    onClick={addItem}
                    className="w-full flex items-center justify-center bg-slate-100 text-black px-3 py-1.5 rounded-md hover:bg-slate-200 font-medium text-sm transition-colors"
                  >
                    <PlusIcon />
                    Add Item
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-black">
                <FileIcon />
                <p className="mt-2 font-bold">Your parsed bill will appear here.</p>
                <p className="text-sm">Upload an image to get started.</p>
              </div>
            )}
          </div>

          {billData && !loading && (
            <div className="mt-4 bg-white rounded-2xl shadow-lg p-3 max-w-sm mx-auto">
              <div className="flex justify-between items-center text-xl font-semibold text-black mb-3">
                <span>Total:</span>
                <span className="text-black">{`Rs ${total}`}</span>
              </div>
              <button
                onClick={handleSplitBill}
                className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300 shadow-sm hover:shadow-md"
              >
                Split Bill
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  )
}
