
import React, { useState } from 'react';
import { 
  UserCircle, 
  GraduationCap, 
  Calendar, 
  Tag, 
  Check, 
  Plus,
  Edit3, 
  Save, 
  X,
  Sparkles,
  Heart,
  ShieldCheck,
  Target
} from 'lucide-react';
import { ChildProfile } from '../types';
import { api } from '../services/apiService';

interface ProfileProps {
  child: ChildProfile;
  onUpdate: (updated: ChildProfile) => void;
}

const Profile: React.FC<ProfileProps> = ({ child, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<ChildProfile>({ ...child });
  const [isSaving, setIsSaving] = useState(false);

  const DISABILITY_OPTIONS = [
    'Autism Spectrum Disorder',
    'ADHD',
    'Dyslexia',
    'Speech/Language Impairment',
    'Dysgraphia',
    'Emotional Disturbance',
    'Visual Impairment',
    'Hearing Impairment',
    'Intellectual Disability'
  ];

  const validate = () => {
    if (!formData.name.trim()) {
        alert("Name cannot be empty.");
        return false;
    }
    if (formData.age < 0 || formData.age > 22) {
        alert("Please enter a valid age.");
        return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      const saved = await api.saveProfile(formData);
      onUpdate(saved);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const toggleDisability = (d: string) => {
    const current = formData.disabilities || [];
    const updated = current.includes(d) 
      ? current.filter(item => item !== d)
      : [...current, d];
    setFormData({ ...formData, disabilities: updated });
  };

  const generateBio = () => {
    return `${formData.name} is a ${formData.age}-year-old ${formData.grade} student who is currently supported under an IEP for ${formData.disabilities.join(', ') || 'specialized needs'}. Our primary focus is ensuring ${formData.name} receives a Free and Appropriate Public Education (FAPE) in the Least Restrictive Environment (LRE).`;
  };

  // Helper to format ISO date to YYYY-MM-DD for input[type="date"]
  const formatDateForInput = (dateStr: string) => {
    if (!dateStr) return "";
    return new Date(dateStr).toISOString().split('T')[0];
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-xl shadow-indigo-200">
            <UserCircle className="w-12 h-12 text-white" />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{child.name}'s Profile</h2>
            <p className="text-slate-500 font-medium flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Secure IEP Records • Grade {child.grade}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all shadow-lg active:scale-95 ${
            isEditing 
              ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100' 
              : 'bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 shadow-slate-100'
          }`}
        >
          {isSaving ? (
            <span className="flex items-center gap-2">Saving...</span>
          ) : isEditing ? (
            <><Save className="w-5 h-5" /> Save Changes</>
          ) : (
            <><Edit3 className="w-5 h-5" /> Edit Profile</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-500" />
              General Information
            </h3>
            
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-black uppercase tracking-widest text-slate-400">Child's Name</label>
                {isEditing ? (
                  <input 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                ) : (
                  <p className="text-slate-900 font-bold text-lg">{child.name}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Age</label>
                  {isEditing ? (
                    <input 
                      type="number"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.age}
                      onChange={e => setFormData({...formData, age: parseInt(e.target.value) || 0})}
                    />
                  ) : (
                    <p className="text-slate-900 font-bold text-lg">{child.age} Years</p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Grade</label>
                  {isEditing ? (
                    <input 
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formData.grade}
                      onChange={e => setFormData({...formData, grade: e.target.value})}
                    />
                  ) : (
                    <p className="text-slate-900 font-bold text-lg">{child.grade}</p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-widest text-slate-400">Last IEP Update</label>
                  {isEditing ? (
                    <input 
                      type="date"
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                      value={formatDateForInput(formData.lastIepDate)}
                      onChange={e => setFormData({...formData, lastIepDate: e.target.value})}
                    />
                  ) : (
                    <p className="text-slate-900 font-bold">
                      {new Date(child.lastIepDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900 to-indigo-900 p-8 rounded-[32px] text-white space-y-4">
            <h3 className="font-bold flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" />
              Advocacy Bio
            </h3>
            <p className="text-sm text-indigo-100/80 leading-relaxed italic">
              " {generateBio()} "
            </p>
            <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold uppercase tracking-widest transition-colors">
              Copy to Clipboard
            </button>
          </div>
        </div>

        {/* Right Column: Needs & Support */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-lg">
                <Target className="w-6 h-6 text-rose-500" />
                Disability Categories & Needs
              </h3>
              {isEditing && <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Selection Mode</span>}
            </div>

            <div className="flex flex-wrap gap-3">
              {isEditing ? (
                DISABILITY_OPTIONS.map(d => {
                  const active = formData.disabilities.includes(d);
                  return (
                    <button
                      key={d}
                      onClick={() => toggleDisability(d)}
                      className={`px-4 py-3 rounded-2xl border-2 font-bold transition-all flex items-center gap-2 ${
                        active 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100' 
                          : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                      }`}
                    >
                      {active ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4 opacity-30" />}
                      {d}
                    </button>
                  );
                })
              ) : (
                child.disabilities.length > 0 ? (
                  child.disabilities.map(d => (
                    <div key={d} className="px-5 py-3 bg-indigo-50 text-indigo-700 rounded-2xl font-bold flex items-center gap-2 border border-indigo-100">
                      <Heart className="w-4 h-4 text-rose-400 fill-rose-400" />
                      {d}
                    </div>
                  ))
                ) : (
                  <div className="w-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                    <Tag className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-500 font-medium">No disability categories selected yet.</p>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="mt-2 text-indigo-600 font-bold hover:underline"
                    >
                      Add Categories
                    </button>
                  </div>
                )
              )}
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6">
              <GraduationCap className="w-6 h-6 text-indigo-500" />
              Focus Tags & Milestones
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { label: 'Reading Comprehension', color: 'bg-blue-500' },
                { label: 'Social Pragmatics', color: 'bg-purple-500' },
                { label: 'Fine Motor Skills', color: 'bg-emerald-500' },
                { label: 'Executive Function', color: 'bg-amber-500' }
              ].map(tag => (
                <div key={tag.label} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center gap-4 hover:bg-white hover:border-indigo-100 transition-all group">
                  <div className={`w-3 h-3 rounded-full ${tag.color}`}></div>
                  <span className="font-bold text-slate-700">{tag.label}</span>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    <X className="w-4 h-4 text-slate-300 cursor-pointer hover:text-rose-500" />
                  </div>
                </div>
              ))}
              <button className="p-4 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center gap-2 text-slate-400 font-bold hover:border-indigo-300 hover:text-indigo-500 transition-all">
                <Plus className="w-5 h-5" /> Add Focus Tag
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
