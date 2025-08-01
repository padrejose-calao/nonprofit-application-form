import React, { useState } from 'react';
import {

  Plus,
  Edit,
  Trash2,
  Calendar,
  DollarSign,
  Users,
  Target,
  CheckCircle,
  Clock,
  AlertCircle,
} from 'lucide-react';

interface Program {
  id: number;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  budget: number;
  status: 'planning' | 'active' | 'completed' | 'on-hold';
  team: string[];
  objectives: string[];
  outcomes: string[];
  createdDate: string;
  lastModified: string;
}

interface ProgramManagerProps {
  programs: Program[];
  onProgramsChange: (programs: Program[]) => void;
  onClose: () => void;
  editingProgramId?: number | null;
  onEditingProgramChange?: (id: number | null) => void;
}

const ProgramManager: React.FC<ProgramManagerProps> = ({
  programs,
  onProgramsChange,
  onClose,
  editingProgramId = null,
  onEditingProgramChange,
}) => {
  const [newProgram, setNewProgram] = useState<Partial<Program>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    budget: 0,
    status: 'planning',
    team: [],
    objectives: [],
    outcomes: [],
  });

  const [showForm, setShowForm] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | null>(null);

  const addProgram = () => {
    if (newProgram.name && newProgram.description) {
      const program: Program = {
        id: Date.now(),
        name: newProgram.name,
        description: newProgram.description,
        startDate: newProgram.startDate || '',
        endDate: newProgram.endDate || '',
        budget: newProgram.budget || 0,
        status: newProgram.status || 'planning',
        team: newProgram.team || [],
        objectives: newProgram.objectives || [],
        outcomes: newProgram.outcomes || [],
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString(),
      };

      onProgramsChange([...programs, program]);
      setNewProgram({
        name: '',
        description: '',
        startDate: '',
        endDate: '',
        budget: 0,
        status: 'planning',
        team: [],
        objectives: [],
        outcomes: [],
      });
      setShowForm(false);
    }
  };

  const updateProgram = (id: number, updates: Partial<Program>) => {
    const updatedPrograms = programs.map((program) =>
      program.id === id
        ? { ...program, ...updates, lastModified: new Date().toISOString() }
        : program
    );
    onProgramsChange(updatedPrograms);
  };

  const deleteProgram = (id: number) => {
    const updatedPrograms = programs.filter((program) => program.id !== id);
    onProgramsChange(updatedPrograms);
  };

  const getStatusIcon = (status: Program['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'planning':
        return <Target className="h-4 w-4 text-yellow-500" />;
      case 'on-hold':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: Program['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'planning':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Program Manager</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Program
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {showForm && (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Add New Program</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Program Name *
                  </label>
                  <input
                    type="text"
                    value={newProgram.name}
                    onChange={(e) => setNewProgram({ ...newProgram, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter program name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={newProgram.status}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, status: e.target.value as Program['status'] })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="on-hold">On Hold</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    value={newProgram.startDate}
                    onChange={(e) => setNewProgram({ ...newProgram, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    value={newProgram.endDate}
                    onChange={(e) => setNewProgram({ ...newProgram, endDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget</label>
                  <input
                    type="number"
                    value={newProgram.budget}
                    onChange={(e) =>
                      setNewProgram({ ...newProgram, budget: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={newProgram.description}
                  onChange={(e) => setNewProgram({ ...newProgram, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Enter program description"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={addProgram}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add Program
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {programs.map((program) => (
              <div key={program.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(program.status)}
                      <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(program.status)}`}
                      >
                        {program.status}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-3">{program.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>
                          {program.startDate} - {program.endDate}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>${program.budget.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{program.team.length} team members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-gray-500" />
                        <span>{program.objectives.length} objectives</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingProgram(program)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit program"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => deleteProgram(program.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete program"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {programs.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>No programs yet. Click &quot;Add Program&quot; to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgramManager;
