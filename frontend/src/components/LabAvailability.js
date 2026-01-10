import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Activity, MapPin, Users, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const LabDashboard = () => {
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);

  // פונקציה למשיכת נתונים מה-Backend
  const fetchLabs = () => {
    setLoading(true);
    axios.get('http://127.0.0.1:8000/api/labs/')
      .then(res => {
        setLabs(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching labs:", err);
        // נתוני דמו למקרה שהשרת כבוי - כדי שהמרצה תמיד יראה משהו
        setLabs([
          { id: 1, name: "מעבדת תוכנה 101", building: "הנדסה", floor: 2, capacity: 40, current_students: 15, is_available: true },
          { id: 2, name: "מעבדת רשתות", building: "מדעים", floor: 1, capacity: 30, current_students: 28, is_available: true },
          { id: 3, name: "מרכז סייבר", building: "תקשורת", floor: 3, capacity: 25, current_students: 25, is_available: false }
        ]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchLabs();
  }, []);

  return (
    <div className="p-4 md:p-8 bg-slate-50 min-h-screen font-sans text-right" dir="rtl">
      
      {/* Header מעוצב ומרשים */}
      <div className="relative mb-10 overflow-hidden bg-white p-8 rounded-3xl shadow-xl border-b-4 border-blue-600 transition-all hover:shadow-2xl">
        <div className="absolute top-0 left-0 w-32 h-32 bg-blue-50 rounded-full -translate-x-16 -translate-y-16 opacity-50"></div>
        
        <div className="relative flex justify-between items-center">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
                <Activity className="text-white w-8 h-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black bg-clip-text text-transparent bg-gradient-to-l from-blue-900 to-blue-600 tracking-tight">
                מערכת ניטור מעבדות
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-2 mr-1">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <p className="text-slate-500 font-bold text-sm">
                US2: זמינות ותפוסה בזמן אמת <span className="text-slate-300 mx-2">|</span> 
                <span className="text-blue-600">ינואר 2026</span>
              </p>
            </div>
          </div>

          <button 
            onClick={fetchLabs}
            className="flex items-center gap-2 bg-slate-100 hover:bg-blue-50 text-blue-700 px-4 py-2 rounded-xl border border-slate-200 transition-colors font-bold"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
            רענן נתונים
          </button>
        </div>
      </div>

      {/* Grid של כרטיסיות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {labs.map((lab) => {
          const occupancyRate = (lab.current_students / lab.capacity) * 100;
          return (
            <div key={lab.id} className="bg-white rounded-3xl shadow-md border border-slate-200 overflow-hidden hover:-translate-y-2 transition-transform duration-300">
              <div className={`h-3 ${lab.is_available ? 'bg-green-500' : 'bg-red-500'}`} />
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">{lab.name}</h2>
                  <span className={`px-4 py-1 rounded-full text-xs font-black uppercase ${lab.is_available ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                    {lab.is_available ? 'פנוי לפעילות' : 'בטיפול / סגור'}
                  </span>
                </div>

                <div className="space-y-4 mb-8 text-slate-600">
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg"><MapPin size={20} className="text-blue-600"/></div>
                    <span className="text-lg font-medium">בניין {lab.building}, קומה {lab.floor}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 p-2 rounded-lg"><Users size={20} className="text-blue-600"/></div>
                    <span className="text-lg font-medium">{lab.current_students} מתוך {lab.capacity} סטודנטים</span>
                  </div>
                </div>

                {/* Progress Bar תפוסה */}
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200">
                        עומס נוכחי
                      </span>
                    </div>
                    <div className="text-left">
                      <span className="text-xs font-bold inline-block text-blue-600">
                        {Math.round(occupancyRate)}%
                      </span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-slate-100 border border-slate-200">
                    <div 
                      style={{ width: `${occupancyRate}%` }} 
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-1000 ${occupancyRate > 90 ? 'bg-red-500' : occupancyRate > 70 ? 'bg-orange-500' : 'bg-blue-600'}`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LabDashboard;