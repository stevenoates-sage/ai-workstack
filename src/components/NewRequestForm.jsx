import React, { useState, useEffect } from 'react';
import { Save, X, AlertCircle, HelpCircle } from 'lucide-react';

const TEAMS = ['Data Development', 'Reporting & Analytics', 'GTM Productivity', 'Planning', 'Operational Program Delivery', 'GTM Performance'];
const T_SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL'];

const NewRequestForm = ({ onSave, onCancel, tickets }) => {
  // State for Tooltip visibility
  const [showTooltip, setShowTooltip] = useState(false);

  const [formData, setFormData] = useState({
    Title: '',
    Team: 'Data Development',
    RaisedBy: 'Steve Oates', // Default as requested
    Description: '',
    BusinessValue: '',
    TShirt: 'M'
  });

  // Helper to generate the next ID based on the selected team
  const generateNextRef = (teamName) => {
    const prefix = teamName === 'Data Development' ? 'DD' : 'RA';
    
    // Find all existing tickets with this prefix
    const existingRefs = tickets
        .filter(t => t.Ref.startsWith(prefix))
        .map(t => {
            // Remove prefix and convert to integer
            const num = parseInt(t.Ref.replace(prefix, ''), 10);
            return isNaN(num) ? 0 : num;
        });

    // Find max and add 1 (Default to 1 if none exist)
    const nextNum = existingRefs.length > 0 ? Math.max(...existingRefs) + 1 : 1;
    
    return `${prefix}${nextNum}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newTicket = {
        Ref: generateNextRef(formData.Team), // Generate Ref on submit
        ...formData,
        Status: 'New',
        Priority: 'Unprioritised',
        Capacity: 0,
        StartDate: '',
        EndDate: '',
        AssignedTo: 'Unassigned',
        DateAdded: new Date().toISOString().split('T')[0] // YYYY-MM-DD
    };

    onSave(newTicket);
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create New Request</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Submit a new item to the workstack for triage.</p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-8 space-y-6">
        
        {/* Row 1 */}
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
                <input 
                    type="text" required 
                    className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="e.g. Sales Dashboard Update"
                    value={formData.Title}
                    onChange={e => setFormData({...formData, Title: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Team</label>
                <select 
                    className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.Team}
                    onChange={e => setFormData({...formData, Team: e.target.value})}
                >
                    {TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
            </div>
        </div>

        {/* Row 2 */}
        <div className="grid grid-cols-2 gap-6">
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Raised By</label>
                <input 
                    type="text" required 
                    className="w-full p-2.5 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={formData.RaisedBy}
                    onChange={e => setFormData({...formData, RaisedBy: e.target.value})}
                />
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
                placeholder="Describe the requirement in detail..."
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
                placeholder="What is the benefit? e.g. Saves 4 hours per week."
                value={formData.BusinessValue}
                onChange={e => setFormData({...formData, BusinessValue: e.target.value})}
            />
        </div>

        {/* Priority Notice */}
        <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 rounded-md text-sm border border-yellow-200 dark:border-yellow-800">
            <AlertCircle size={16} />
            <span>New requests are set to <strong>'New'</strong> status and <strong>'Unprioritised'</strong> by default.</span>
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