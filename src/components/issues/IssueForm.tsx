'use client';

import { useState, useRef } from 'react';
import { IssueCategory } from '@/types';
import { categorizeIssue } from '@/lib/categorizer';
import { categoryLabels, categoryIcons, fileToBase64, compressBase64, cn } from '@/lib/utils';
import LocationPicker from '@/components/map/LocationPicker';
import Button from '@/components/ui/Button';

interface IssueFormProps {
  onSuccess: (issue: any) => void;
  onDuplicateFound: (issueId: string, similarity: number) => void;
}

const categories: IssueCategory[] = [
  'road', 'water', 'electricity', 'garbage', 'safety', 'parks', 'noise', 'other',
];

export default function IssueForm({ onSuccess, onDuplicateFound }: IssueFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState<IssueCategory | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '' as IssueCategory | '',
    reporterName: '',
    reporterEmail: '',
    location: { lat: 0, lng: 0, address: '' },
    images: [] as string[],
  });

  const handleTextChange = (field: 'title' | 'description', value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (value.length > 5) {
      const suggested = categorizeIssue(
        field === 'title' ? value : formData.title,
        field === 'description' ? value : formData.description
      );
      setSuggestedCategory(suggested);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (formData.images.length + files.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }
    const compressed = await Promise.all(
      files.map(async (file) => {
        const b64 = await fileToBase64(file);
        return compressBase64(b64, 0.7);
      })
    );
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...compressed].slice(0, 3),
    }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (skipDuplicateCheck = false) => {
    setError('');

    if (!formData.location.lat || !formData.location.lng) {
      setError('Please set your location on the map first');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        ...formData,
        category: formData.category || suggestedCategory || 'other',
        skipDuplicateCheck,
      };

      const res = await fetch('/api/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409 && data.isDuplicate) {
          onDuplicateFound(data.matchedIssueId, data.similarity);
          return;
        }
        setError(data.error || 'Failed to submit issue');
        return;
      }

      onSuccess(data);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isStep1Valid =
    formData.title.trim().length >= 10 && formData.description.trim().length >= 20;
  const isStep2Valid = formData.location.lat !== 0 && formData.location.lng !== 0;
  const isStep3Valid = formData.reporterName.trim().length >= 2;

  return (
    <div className="p-6">
      {/* step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all',
                step === s
                  ? 'bg-blue-600 text-white'
                  : step > s
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'
              )}
            >
              {step > s ? '✓' : s}
            </div>
            <span className={cn(
              'text-sm hidden sm:block',
              step >= s ? 'text-slate-700' : 'text-slate-400'
            )}>
              {s === 1 ? 'Issue Details' : s === 2 ? 'Location' : 'Your Info'}
            </span>
            {s < 3 && (
              <div className={cn('w-8 h-px', step > s ? 'bg-emerald-300' : 'bg-slate-200')} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Issue Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => handleTextChange('title', e.target.value)}
              placeholder="e.g., Large pothole on Main Street causing accidents"
              maxLength={200}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            />
            <p className="mt-1 text-xs text-slate-400">{formData.title.length}/200 (min 10)</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleTextChange('description', e.target.value)}
              placeholder="Describe the issue — size, severity, how long it's been there, safety concerns..."
              maxLength={2000}
              rows={4}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm resize-none"
            />
            <p className="mt-1 text-xs text-slate-400">{formData.description.length}/2000 (min 20)</p>
          </div>

          {/* auto category suggestion */}
          {suggestedCategory && (
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
              <span>{categoryIcons[suggestedCategory]}</span>
              <p className="text-sm text-blue-700">
                Auto-detected: <strong>{categoryLabels[suggestedCategory]}</strong>
              </p>
              <button
                onClick={() => setFormData(prev => ({ ...prev, category: suggestedCategory! }))}
                className="ml-auto text-xs text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Use this
              </button>
            </div>
          )}

          {/* category grid */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, category: cat }))}
                  className={cn(
                    'flex flex-col items-center gap-1 p-3 rounded-xl border text-xs font-medium transition-all',
                    formData.category === cat
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                  )}
                >
                  <span className="text-lg">{categoryIcons[cat]}</span>
                  <span>{categoryLabels[cat]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* image upload */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Photos (optional, max 3)
            </label>
            <div className="flex gap-3 flex-wrap">
              {formData.images.map((img, i) => (
                <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
              {formData.images.length < 3 && (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 flex flex-col items-center justify-center text-slate-400 hover:text-blue-500 transition-all"
                >
                  <span className="text-2xl">+</span>
                  <span className="text-xs">Add</span>
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end pt-2">
            <Button disabled={!isStep1Valid} onClick={() => { setError(''); setStep(2); }}>
              Next: Set Location →
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-1">
              Pin the exact location
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Use your current location or click on the map to place the pin.
            </p>
            <LocationPicker
              onLocationChange={(lat, lng, address) =>
                setFormData(prev => ({ ...prev, location: { lat, lng, address } }))
              }
            />
          </div>

          {formData.location.lat !== 0 && (
            <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
              <span className="text-emerald-600 font-bold">✓</span>
              <p className="text-sm text-emerald-700">
                Location pinned:{' '}
                {formData.location.address ||
                  `${formData.location.lat.toFixed(5)}, ${formData.location.lng.toFixed(5)}`}
              </p>
            </div>
          )}

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(1)}>← Back</Button>
            <Button disabled={!isStep2Valid} onClick={() => { setError(''); setStep(3); }}>
              Next: Your Info →
            </Button>
          </div>
        </div>
      )}

      {/* Step 3 */}
      {step === 3 && (
        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Your Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.reporterName}
              onChange={(e) => setFormData(prev => ({ ...prev, reporterName: e.target.value }))}
              placeholder="John Smith"
              maxLength={100}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Email (optional)
            </label>
            <input
              type="email"
              value={formData.reporterEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, reporterEmail: e.target.value }))}
              placeholder="john@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm"
            />
          </div>

          {/* review summary */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
            <h4 className="text-sm font-semibold text-slate-700 mb-2">Review</h4>
            <div className="text-sm text-slate-600 space-y-1">
              <p><span className="font-medium">Issue:</span> {formData.title}</p>
              <p><span className="font-medium">Category:</span> {categoryLabels[formData.category || suggestedCategory || 'other']}</p>
              <p><span className="font-medium">Location:</span> {formData.location.address || `${formData.location.lat.toFixed(5)}, ${formData.location.lng.toFixed(5)}`}</p>
              {formData.images.length > 0 && (
                <p><span className="font-medium">Photos:</span> {formData.images.length} attached</p>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-between pt-2">
            <Button variant="ghost" onClick={() => setStep(2)}>← Back</Button>
            <Button loading={loading} disabled={!isStep3Valid} onClick={() => handleSubmit(false)}>
              Submit Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}