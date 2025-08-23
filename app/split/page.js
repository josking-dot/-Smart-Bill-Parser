'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// SVG Icons
const PersonIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
    <circle cx="12" cy="7" r="4"/>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <path d="M3 6h18"/>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
    <path d="M19 12H5"/>
    <path d="M12 19l-7-7 7-7"/>
  </svg>
);

const CalculateIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
    <rect x="4" y="3" width="16" height="18" rx="2"/>
    <path d="M8 7h8"/>
    <path d="M8 11h8"/>
    <path d="M8 15h5"/>
  </svg>
);

export default function SplitBill() {
  const router = useRouter();
  const [billData, setBillData] = useState(null);
  const [people, setPeople] = useState(['']);
  const [itemAssignments, setItemAssignments] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [splitResults, setSplitResults] = useState({});

  useEffect(() => {
    // Get bill data from localStorage
    const storedBillData = localStorage.getItem('billData');
    if (storedBillData) {
      const data = JSON.parse(storedBillData);
      setBillData(data);
      // Initialize item assignments
      const assignments = {};
      data.items.forEach((item, index) => {
        assignments[index] = [];
      });
      setItemAssignments(assignments);
    } else {
      // Redirect back if no bill data
      router.push('/');
    }
  }, [router]);

  const addPerson = () => {
    setPeople([...people, '']);
  };

  const updatePerson = (index, name) => {
    const updatedPeople = [...people];
    updatedPeople[index] = name;
    setPeople(updatedPeople);
  };

  const removePerson = (index) => {
    const updatedPeople = people.filter((_, i) => i !== index);
    setPeople(updatedPeople);
    
    // Remove this person from all item assignments
    const updatedAssignments = { ...itemAssignments };
    Object.keys(updatedAssignments).forEach(itemIndex => {
      updatedAssignments[itemIndex] = updatedAssignments[itemIndex].filter(personIndex => personIndex !== index);
      // Adjust indices for people after the removed person
      updatedAssignments[itemIndex] = updatedAssignments[itemIndex].map(personIndex => 
        personIndex > index ? personIndex - 1 : personIndex
      );
    });
    setItemAssignments(updatedAssignments);
  };

  const toggleItemAssignment = (itemIndex, personIndex) => {
    const updatedAssignments = { ...itemAssignments };
    const currentAssignments = updatedAssignments[itemIndex] || [];
    
    if (currentAssignments.includes(personIndex)) {
      // Remove person from this item
      updatedAssignments[itemIndex] = currentAssignments.filter(p => p !== personIndex);
    } else {
      // Add person to this item
      updatedAssignments[itemIndex] = [...currentAssignments, personIndex];
    }
    
    setItemAssignments(updatedAssignments);
  };

  const calculateSplit = () => {
    const results = {};
    
    // Initialize results for each person
    people.forEach((person, index) => {
      if (person.trim()) {
        results[person] = 0;
      }
    });

    // Calculate each person's share
    billData.items.forEach((item, itemIndex) => {
      const assignedPeople = itemAssignments[itemIndex] || [];
      const itemPrice = parseFloat(item.price) || 0;
      
      if (assignedPeople.length > 0) {
        const pricePerPerson = itemPrice / assignedPeople.length;
        
        assignedPeople.forEach(personIndex => {
          const personName = people[personIndex];
          if (personName && personName.trim()) {
            results[personName] = (results[personName] || 0) + pricePerPerson;
          }
        });
      }
    });

    // Round to 2 decimal places
    Object.keys(results).forEach(person => {
      results[person] = parseFloat(results[person].toFixed(2));
    });

    setSplitResults(results);
    setShowResults(true);
  };

  const getPersonColor = (index) => {
    const colors = [
      'bg-blue-100 text-blue-800 border-blue-200',
      'bg-green-100 text-green-800 border-green-200',
      'bg-purple-100 text-purple-800 border-purple-200',
      'bg-pink-100 text-pink-800 border-pink-200',
      'bg-yellow-100 text-yellow-800 border-yellow-200',
      'bg-indigo-100 text-indigo-800 border-indigo-200',
      'bg-red-100 text-red-800 border-red-200',
      'bg-teal-100 text-teal-800 border-teal-200'
    ];
    return colors[index % colors.length];
  };

  if (!billData) {
    return <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-slate-600">Loading bill data...</p>
      </div>
    </div>;
  }

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
        <header className="text-center mb-8">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center text-slate-600 hover:text-slate-900 mb-4"
          >
            <BackIcon />
            Back to Bill Parser
          </button>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 tracking-tight">
            Split the Bill
          </h1>
          <p className="text-lg text-slate-600 mt-2">
            Add people and assign items to calculate everyone&apos;s share.
          </p>
        </header>

        <div className="max-w-6xl mx-auto">
          {!showResults ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column: People Management */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-5 text-slate-800 border-b border-slate-200 pb-3">
                  Add People
                </h2>
                
                <div className="space-y-3 mb-6">
                  {people.map((person, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="flex items-center gap-2 flex-1">
                        <PersonIcon />
                        <input
                          type="text"
                          value={person}
                          onChange={(e) => updatePerson(index, e.target.value)}
                          placeholder={`Person ${index + 1} name`}
                          className="flex-1 px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      {people.length > 1 && (
                        <button
                          onClick={() => removePerson(index)}
                          className="text-slate-500 hover:text-red-500 p-2 rounded-full hover:bg-red-100 transition-colors"
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  ))}
                </div>

                <button
                  onClick={addPerson}
                  className="w-full flex items-center justify-center bg-slate-100 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-200 font-semibold transition-colors"
                >
                  <PlusIcon />
                  Add Person
                </button>
              </div>

              {/* Right Column: Item Assignment */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-5 text-slate-800 border-b border-slate-200 pb-3">
                  Assign Items
                </h2>
                
                <div className="space-y-4">
                  {billData.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="border border-slate-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-slate-900">{item.name}</span>
                      <span className="text-lg font-semibold text-orange-600">Rs {item.price}</span>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {people.map((person, personIndex) => {
                          if (!person.trim()) return null;
                          
                          const isAssigned = (itemAssignments[itemIndex] || []).includes(personIndex);
                          
                          return (
                            <button
                              key={personIndex}
                              onClick={() => toggleItemAssignment(itemIndex, personIndex)}
                              className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                                isAssigned
                                  ? getPersonColor(personIndex)
                                  : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                              }`}
                            >
                              {person}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* Results View */
            <div className="bg-white rounded-2xl shadow-lg p-6 max-w-2xl mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-slate-800 border-b border-slate-200 pb-3">
                Split Results
              </h2>
              
              <div className="space-y-4">
                {Object.entries(splitResults).map(([person, amount]) => (
                  <div key={person} className="flex justify-between items-center p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PersonIcon />
                      <span className="font-medium text-slate-900">{person}</span>
                    </div>
                    <span className="text-xl font-bold text-orange-600">Rs {amount}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 pt-4 border-t border-slate-200">
                <div className="flex justify-between items-center text-xl font-bold text-slate-900">
                  <span>Total:</span>
                  <span className="text-orange-600">Rs {billData.total}</span>
                </div>
              </div>
              
              <button
                onClick={() => setShowResults(false)}
                className="w-full mt-6 bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors hover:bg-slate-700"
              >
                Edit Assignment
              </button>
            </div>
          )}

          {/* Calculate Button */}
          {!showResults && (
            <div className="mt-8 text-center">
              <button
                onClick={calculateSplit}
                disabled={people.filter(p => p.trim()).length === 0}
                className="bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all duration-300 shadow-sm hover:shadow-md animate-gradient disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CalculateIcon />
                Calculate Split
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
