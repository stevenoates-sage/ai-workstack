import React, { useState } from 'react';
import { Save, AlertCircle, HelpCircle } from 'lucide-react';
import { USERS } from '../App';

const T_SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const NewRequestForm = ({ onSave, onCancel, tickets }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [formData, setFormData] = useState({
        Title: '',
        RaisedBy: USERS[0],
        Description: '',
        BusinessValue: '',
        TShirt: 'M'
    });

    const generateNextRef = () => {
        const existingRefs = tickets
            .map(t => t.Ref || '')
            .filter(ref => /^AI-\d+$/i.test(ref))
            .map(ref => parseInt(ref.replace(/AI-/i, ''), 10))
            .filter(num => !isNaN(num));

        const nextNum = existingRefs.length > 0 ? Math.max(...existingRefs) + 1 : 1;
        return `AI-${String(nextNum).padStart(3, '0')}`;
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const newTicket = {
            Ref: generateNextRef(),
            ...formData,
            Status: 'New Request',
            Priority: 'Unprioritised',
            Capacity: 0,
            StartDate: '',
            EndDate: '',
            AssignedTo: 'Unassigned',
            DateAdded: new Date().toISOString().split('T')[0]
        };

        onSave(newTicket);
    };

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Submit AI POC Request</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Capture a new AI use case for triage and POC planning.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">POC Title</label>
                <input 
                    type="text" required 
                    className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. AI-powered call analyser for BANT detection"
                    value={formData.Title}
                    onChange={e => setFormData({...formData, Title: e.target.value})}
                />
            </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raised By</label>
                <select
                    className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.RaisedBy}
                    onChange={e => setFormData({...formData, RaisedBy: e.target.value})}
                >
                    {USERS.map(user => <option key={user} value={user}>{user}</option>)}
                </select>
            </div>
            
            {/* T-SHIRT SIZE WITH TOOLTIP */}
            <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Estimated Size (T-Shirt)</label>
                    <button 
                        type="button"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                        className="text-gray-400 hover:text-blue-500 transition-colors"
                    >
                        <HelpCircle size={16} />
                    </button>
                </div>

                {/* The Tooltip Popup */}
                {showTooltip && (
                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded shadow-lg z-50 border border-gray-700">
                        <ul className="space-y-1">
                            <li><strong>XS:</strong> &lt;1 day</li>
                            <li><strong>S:</strong> 1-4 days</li>
                            <li><strong>M:</strong> 1-2 Weeks</li>
                            <li><strong>L:</strong> 2-4 Weeks</li>
                            <li><strong>XL:</strong> &gt;4 Weeks</li>
                        </ul>
                        {/* Little arrow at bottom */}
                        <div className="absolute top-full left-4 -mt-1 border-4 border-transparent border-t-gray-800"></div>
                    </div>
                )}

                <select 
                    className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.TShirt}
                    onChange={e => setFormData({...formData, TShirt: e.target.value})}
                >
                    {T_SHIRT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>
        </div>

        {/* Description */}
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea 
                rows="4" required
                className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="Describe the problem, target users, and the AI-assisted approach..."
                value={formData.Description}
                onChange={e => setFormData({...formData, Description: e.target.value})}
            />
        </div>

        {/* Business Value */}
        <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business Value / Justification</label>
            <textarea 
                rows="2" required
                className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                placeholder="What value should this deliver? e.g. reduce handling time by 20%"
                value={formData.BusinessValue}
                onChange={e => setFormData({...formData, BusinessValue: e.target.value})}
            />
        </div>

        {/* Priority Notice */}
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md text-sm border border-yellow-200 dark:border-yellow-800">
            <AlertCircle size={16} />
            <span>New requests are set to <strong>'New Request'</strong> status and <strong>'Unprioritised'</strong> by default.</span>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
                type="button" 
                onClick={onCancel}
                className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
                Cancel
            </button>
            <button 
                type="submit" 
                className="px-6 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
            >
                <Save size={16} /> Submit Request
            </button>
        </div>

      </form>
    </div>
  );
};

export default NewRequestForm;