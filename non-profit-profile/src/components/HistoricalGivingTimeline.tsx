import React, { useState, useMemo } from 'react';
import {
  Calendar, DollarSign, Gift, Heart, Users, Trophy,
  Building2, FileText, TrendingUp, Clock, ChevronRight, Plus
} from 'lucide-react';
import { Contact } from '../types/NonprofitTypes';

interface GivingHistory {
  id: string;
  date: string;
  amount: number;
  type: 'grant' | 'donation' | 'sponsorship' | 'in-kind';
  source: string;
  purpose: string;
  impact: string;
  story?: string;
  recognition?: string;
}

interface HistoricalGivingTimelineProps {
  contact: Contact;
  onClose: () => void;
  onUpdate: (contact: Contact) => void;
}

const HistoricalGivingTimeline: React.FC<HistoricalGivingTimelineProps> = ({
  contact,
  onClose,
  onUpdate
}) => {
  const [givingHistory, setGivingHistory] = useState<GivingHistory[]>(
    (contact as any).givingHistory || []
  );
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGiving, setNewGiving] = useState<Partial<GivingHistory>>({
    type: 'donation',
    date: '',
    amount: 0,
    source: contact.organization || `${contact.firstName} ${contact.lastName}`,
    purpose: '',
    impact: ''
  });

  // Calculate giving summary for storytelling
  const givingSummary = useMemo(() => {
    const totalGiven = givingHistory.reduce((sum, gift) => sum + gift.amount, 0);
    const firstGift = givingHistory.sort((a, b) => a.date.localeCompare(b.date))[0];
    const lastGift = givingHistory.sort((a, b) => b.date.localeCompare(a.date))[0];
    const yearsCovered = new Set(givingHistory.map(g => new Date(g.date).getFullYear())).size;
    
    return {
      totalGiven,
      giftCount: givingHistory.length,
      firstGiftDate: firstGift?.date,
      lastGiftDate: lastGift?.date,
      relationshipYears: yearsCovered,
      averageGift: givingHistory.length > 0 ? totalGiven / givingHistory.length : 0
    };
  }, [givingHistory]);

  const addGivingRecord = () => {
    const record: GivingHistory = {
      id: Date.now().toString(),
      date: newGiving.date!,
      amount: newGiving.amount!,
      type: newGiving.type as any,
      source: newGiving.source!,
      purpose: newGiving.purpose!,
      impact: newGiving.impact!,
      story: newGiving.story,
      recognition: newGiving.recognition
    };

    const updatedHistory = [...givingHistory, record];
    setGivingHistory(updatedHistory);
    
    // Update contact with new history
    onUpdate({
      ...contact,
      givingHistory: updatedHistory,
      tags: contact.tags?.includes('funder') ? contact.tags : [...(contact.tags || []), 'funder']
    });

    setShowAddForm(false);
    setNewGiving({
      type: 'donation',
      date: '',
      amount: 0,
      source: contact.organization || `${contact.firstName} ${contact.lastName}`,
      purpose: '',
      impact: ''
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Giving History & Impact Story
              </h2>
              <p className="text-gray-600">
                {contact.organization || `${contact.firstName} ${contact.lastName}`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            >
              ×
            </button>
          </div>

          {/* Relationship Summary */}
          {givingHistory.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white/70 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Total Support</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(givingSummary.totalGiven)}
                </div>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Gifts/Grants</div>
                <div className="text-xl font-bold text-purple-600">
                  {givingSummary.giftCount}
                </div>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Years of Support</div>
                <div className="text-xl font-bold text-green-600">
                  {givingSummary.relationshipYears}
                </div>
              </div>
              <div className="bg-white/70 p-3 rounded-lg">
                <div className="text-sm text-gray-600">Average Gift</div>
                <div className="text-xl font-bold text-orange-600">
                  {formatCurrency(givingSummary.averageGift)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Add New Record Button */}
          <div className="mb-6">
            <button
              onClick={() => setShowAddForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Document Gift/Grant
            </button>
          </div>

          {/* Timeline */}
          <div className="space-y-6">
            {givingHistory.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Gift className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No giving history documented yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Click "Document Gift/Grant" to start building this funder's story
                </p>
              </div>
            ) : (
              givingHistory
                .sort((a, b) => b.date.localeCompare(a.date))
                .map((record, index) => (
                  <div key={record.id} className="relative">
                    {/* Timeline line */}
                    {index < givingHistory.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-gray-200" />
                    )}
                    
                    {/* Timeline item */}
                    <div className="flex gap-4">
                      {/* Icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        record.type === 'grant' ? 'bg-purple-100' :
                        record.type === 'sponsorship' ? 'bg-blue-100' :
                        record.type === 'in-kind' ? 'bg-green-100' :
                        'bg-red-100'
                      }`}>
                        {record.type === 'grant' ? <FileText className="w-6 h-6 text-purple-600" /> :
                         record.type === 'sponsorship' ? <Trophy className="w-6 h-6 text-blue-600" /> :
                         record.type === 'in-kind' ? <Gift className="w-6 h-6 text-green-600" /> :
                         <Heart className="w-6 h-6 text-red-600" />}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 bg-white border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {formatCurrency(record.amount)} {record.type === 'grant' ? 'Grant' :
                               record.type === 'sponsorship' ? 'Sponsorship' :
                               record.type === 'in-kind' ? 'In-Kind Gift' : 'Donation'}
                            </h4>
                            <p className="text-sm text-gray-600">
                              <Calendar className="w-4 h-4 inline mr-1" />
                              {new Date(record.date).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="font-medium text-gray-700">Purpose:</span>
                            <p className="text-gray-600">{record.purpose}</p>
                          </div>
                          
                          <div>
                            <span className="font-medium text-gray-700">Impact:</span>
                            <p className="text-gray-600">{record.impact}</p>
                          </div>
                          
                          {record.story && (
                            <div>
                              <span className="font-medium text-gray-700">Story:</span>
                              <p className="text-gray-600 italic">"{record.story}"</p>
                            </div>
                          )}
                          
                          {record.recognition && (
                            <div>
                              <span className="font-medium text-gray-700">Recognition:</span>
                              <p className="text-gray-600">{record.recognition}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto">
              <h3 className="text-lg font-semibold mb-4">Document Historical Gift/Grant</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newGiving.type}
                    onChange={(e) => setNewGiving({ ...newGiving, type: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="donation">Donation</option>
                    <option value="grant">Grant</option>
                    <option value="sponsorship">Sponsorship</option>
                    <option value="in-kind">In-Kind</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newGiving.date}
                    onChange={(e) => setNewGiving({ ...newGiving, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="number"
                    value={newGiving.amount}
                    onChange={(e) => setNewGiving({ ...newGiving, amount: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Purpose/Designation</label>
                  <input
                    type="text"
                    value={newGiving.purpose}
                    onChange={(e) => setNewGiving({ ...newGiving, purpose: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., General Operations, Youth Program, Building Fund"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Impact/Outcome</label>
                  <textarea
                    value={newGiving.impact}
                    onChange={(e) => setNewGiving({ ...newGiving, impact: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="What did this gift enable? How many people were served?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Story (Optional)</label>
                  <textarea
                    value={newGiving.story}
                    onChange={(e) => setNewGiving({ ...newGiving, story: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="Any quotes or stories about this gift?"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Recognition (Optional)</label>
                  <input
                    type="text"
                    value={newGiving.recognition}
                    onChange={(e) => setNewGiving({ ...newGiving, recognition: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Named on donor wall, Annual report listing"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={addGivingRecord}
                  disabled={!newGiving.date || !newGiving.amount || !newGiving.purpose || !newGiving.impact}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  Add to History
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoricalGivingTimeline;