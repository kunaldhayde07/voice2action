'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import {
  Upload,
  X,
  MapPin,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Camera,
  Navigation,
  ArrowRight,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGeolocation } from '@/hooks/useGeolocation';
import { issuesApi } from '@/lib/api';
import { PageHeader } from '@/components/shared/PageHeader';
import { DuplicateWarning } from '@/components/report/DuplicateWarning';
import { ISSUE_CATEGORIES, URGENCY_LEVELS, ROUTES } from '@/lib/constants';
import { DuplicateCheckResult } from '@/types';
import toast from 'react-hot-toast';

// ─── Validation ───────────────────────────────────────────────────────────────

const reportSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  category: z.string().min(1, 'Please select a category'),
  urgency: z.enum(['low', 'medium', 'high', 'critical']),
  address: z.string().min(1, 'Please detect or enter your location'),
  latitude: z.number({ required_error: 'Location is required' }),
  longitude: z.number({ required_error: 'Location is required' }),
  tags: z.string().optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

// ─── Image Uploader Component ─────────────────────────────────────────────────

interface ImageUploaderProps {
  images: File[];
  previews: string[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  isDragging: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

function ImageUploader({
  images,
  previews,
  onAdd,
  onRemove,
  isDragging,
  onDragEnter,
  onDragLeave,
  onDrop,
  inputRef,
}: ImageUploaderProps) {
  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center gap-3',
          'min-h-[200px] rounded-2xl cursor-pointer',
          'border-2 border-dashed transition-all duration-200',
          isDragging
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-[1.01]'
            : images.length > 0
            ? 'border-green-300 dark:border-green-700 bg-green-50/50 dark:bg-green-900/10'
            : 'border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            const files = Array.from(e.target.files || []);
            onAdd(files);
            e.target.value = '';
          }}
        />

        {images.length === 0 ? (
          <>
            <motion.div
              animate={isDragging ? { scale: 1.2 } : { scale: 1 }}
              className={cn(
                'w-14 h-14 rounded-2xl flex items-center justify-center',
                isDragging
                  ? 'bg-blue-100 dark:bg-blue-900/30'
                  : 'bg-gray-100 dark:bg-gray-700'
              )}
            >
              <Camera
                className={cn(
                  'w-7 h-7',
                  isDragging ? 'text-blue-600' : 'text-gray-400'
                )}
              />
            </motion.div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {isDragging
                  ? 'Drop images here!'
                  : 'Click to upload or drag & drop'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                JPG, PNG, WebP up to 10MB each (max 5 images)
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl transition-colors">
              <Upload className="w-4 h-4" />
              Choose File
            </div>
          </>
        ) : (
          <div className="w-full p-3">
            <div className="flex items-center gap-2 mb-3 px-1">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                {images.length} image{images.length > 1 ? 's' : ''} selected
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  inputRef.current?.click();
                }}
                className="ml-auto text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
              >
                Add more
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {previews.map((preview, idx) => (
                <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group">
                  <Image
                    src={preview}
                    alt={`Preview ${idx + 1}`}
                    fill
                    className="object-cover"
                    sizes="150px"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove(idx);
                    }}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1.5 left-1.5 text-[10px] bg-black/60 text-white px-1.5 py-0.5 rounded-md font-medium">
                      Main
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Location Detector ────────────────────────────────────────────────────────

interface LocationDetectorProps {
  latitude: number | null;
  longitude: number | null;
  address: string;
  isDetecting: boolean;
  hasLocation: boolean;
  onDetect: () => void;
  onClear: () => void;
  error: string | null;
}

function LocationDetector({
  latitude,
  longitude,
  address,
  isDetecting,
  hasLocation,
  onDetect,
  onClear,
  error,
}: LocationDetectorProps) {
  return (
    <div className="space-y-2">
      <div
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl border transition-all duration-150',
          hasLocation
            ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-900/10'
            : error
            ? 'border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/10'
            : 'border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-800'
        )}
      >
        <div
          className={cn(
            'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
            hasLocation
              ? 'bg-green-100 dark:bg-green-900/30'
              : 'bg-gray-100 dark:bg-gray-700'
          )}
        >
          <MapPin
            className={cn(
              'w-4 h-4',
              hasLocation
                ? 'text-green-600 dark:text-green-400'
                : 'text-gray-400'
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          {hasLocation ? (
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {address}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {latitude?.toFixed(6)}, {longitude?.toFixed(6)}
              </p>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isDetecting ? 'Detecting your location...' : 'Click Detect to auto-fill location'}
            </p>
          )}
        </div>

        {hasLocation ? (
          <button
            type="button"
            onClick={onClear}
            className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <motion.button
            type="button"
            onClick={onDetect}
            disabled={isDetecting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium',
              'bg-blue-600 hover:bg-blue-700 text-white',
              'transition-colors disabled:opacity-60',
              'flex-shrink-0'
            )}
          >
            {isDetecting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Navigation className="w-3.5 h-3.5" />
            )}
            {isDetecting ? 'Detecting...' : 'Detect'}
          </motion.button>
        )}
      </div>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400"
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── Report Issue Page ────────────────────────────────────────────────────────

export default function ReportIssuePage() {
  const router = useRouter();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [duplicateResult, setDuplicateResult] =
    useState<DuplicateCheckResult | null>(null);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const geo = useGeolocation();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      urgency: 'medium',
      title: '',
      description: '',
      category: '',
      address: '',
      tags: '',
    },
  });

  const categoryValue = watch('category');
  const descriptionValue = watch('description');

  // Sync geo data to form
  const handleDetectLocation = async () => {
    await geo.detectLocation();
  };

  // After geo detects, update form values
  useState(() => {
    if (geo.hasLocation && geo.latitude && geo.longitude) {
      setValue('latitude', geo.latitude, { shouldValidate: true });
      setValue('longitude', geo.longitude, { shouldValidate: true });
      setValue('address', geo.address, { shouldValidate: true });
    }
  });

  // Check for duplicate issues
  const checkDuplicates = useCallback(
    async (lat: number, lng: number, category: string) => {
      if (!category) return;
      setCheckingDuplicates(true);
      try {
        const response = await issuesApi.checkDuplicates({
          latitude: lat,
          longitude: lng,
          category,
        });
        const result = response.data.data as DuplicateCheckResult;
        if (result.hasDuplicates) {
          setDuplicateResult(result);
        }
      } catch {
        // Silently fail
      } finally {
        setCheckingDuplicates(false);
      }
    },
    []
  );

  // Auto-check duplicates when location + category are set
  const handleCategoryChange = (category: string) => {
    setValue('category', category, { shouldValidate: true });
    if (geo.latitude && geo.longitude && category) {
      checkDuplicates(geo.latitude, geo.longitude, category);
    }
  };

  // Image handlers
  const addImages = (files: File[]) => {
    const valid = files.filter((f) => {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      const validSize = f.size <= 10 * 1024 * 1024;
      return validTypes.includes(f.type) && validSize;
    });

    const remaining = 5 - images.length;
    const toAdd = valid.slice(0, remaining);

    if (toAdd.length < valid.length) {
      toast.error('Maximum 5 images allowed');
    }

    setImages((prev) => [...prev, ...toAdd]);

    toAdd.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    addImages(files);
  };

  // Form submission
  const onSubmit = async (data: ReportFormData) => {
    if (!geo.hasLocation) {
      toast.error('Please detect your location first');
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('category', data.category);
      formData.append('urgency', data.urgency);
      formData.append('address', geo.address);
      formData.append('latitude', String(geo.latitude));
      formData.append('longitude', String(geo.longitude));
      if (data.tags) {
        formData.append('tags', JSON.stringify(
          data.tags.split(',').map((t) => t.trim()).filter(Boolean)
        ));
      }
      images.forEach((img) => formData.append('images', img));

      await issuesApi.create(formData);

      setSubmitSuccess(true);
      toast.success('Issue reported successfully! 🎉');

      setTimeout(() => {
        router.push(ROUTES.MY_REPORTS);
      }, 2000);
    } catch (error: unknown) {
      const axiosError = error as {
        response?: { data?: { message?: string } };
      };
      toast.error(
        axiosError.response?.data?.message || 'Failed to submit issue'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success screen
  if (submitSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          className="text-center max-w-sm"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-3xl flex items-center justify-center mx-auto mb-6"
          >
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </motion.div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Issue Reported! 🎉
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-2">
            Your issue has been submitted successfully and is now visible to authorities.
          </p>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
            Redirecting to your reports...
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-5xl mx-auto">
      <PageHeader
        title="Report an Issue"
        description="Help improve your community by reporting civic issues"
        showBack
        icon={MapPin}
      />

      {/* Duplicate Warning */}
      <AnimatePresence>
        {duplicateResult?.hasDuplicates && (
          <DuplicateWarning
            result={duplicateResult}
            onDismiss={() => setDuplicateResult(null)}
          />
        )}
      </AnimatePresence>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ── Left: Photo Evidence ── */}
          <div className="civic-card p-5">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Camera className="w-4 h-4 text-blue-600" />
              Photo Evidence
              <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </h2>

            <ImageUploader
              images={images}
              previews={previews}
              onAdd={addImages}
              onRemove={removeImage}
              isDragging={isDragging}
              onDragEnter={() => setIsDragging(true)}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              inputRef={imageInputRef}
            />

            {/* Tips */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <p className="font-medium">Photo tips for faster resolution:</p>
                  <ul className="list-disc list-inside space-y-0.5 text-blue-600/80 dark:text-blue-300/80">
                    <li>Show the full extent of the problem</li>
                    <li>Include nearby landmarks for context</li>
                    <li>Take photos in good lighting</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Issue Details ── */}
          <div className="civic-card p-5 space-y-4">
            {/* Title */}
            <div>
              <label className="form-label">
                Issue Title <span className="text-red-500">*</span>
              </label>
              <input
                {...register('title')}
                type="text"
                placeholder="e.g. Broken street light on 5th Ave"
                className={cn(
                  'input-field',
                  errors.title ? 'border-red-300 focus:border-red-400' : ''
                )}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {errors.title.message}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="form-label">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  {...register('category')}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className={cn(
                    'input-field appearance-none pr-8',
                    errors.category ? 'border-red-300 focus:border-red-400' : '',
                    !categoryValue ? 'text-gray-400' : ''
                  )}
                >
                  <option value="">Select a category</option>
                  {ISSUE_CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  ▾
                </div>
              </div>
              {errors.category && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {errors.category.message}
                </p>
              )}
            </div>

            {/* Urgency */}
            <div>
              <label className="form-label">
                Urgency Level <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {URGENCY_LEVELS.map((level) => (
                  <label
                    key={level.value}
                    className="cursor-pointer"
                  >
                    <input
                      {...register('urgency')}
                      type="radio"
                      value={level.value}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'flex items-center justify-center py-2 rounded-xl text-xs font-medium border-2 transition-all duration-150 text-center',
                        watch('urgency') === level.value
                          ? level.color.replace('bg-', 'bg-').replace('text-', 'text-') +
                            ' border-current scale-105 shadow-sm'
                          : 'bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-transparent hover:border-gray-300 dark:hover:border-gray-500'
                      )}
                    >
                      {level.label}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="form-label">
                Location <span className="text-red-500">*</span>
              </label>
              <LocationDetector
                latitude={geo.latitude}
                longitude={geo.longitude}
                address={geo.address}
                isDetecting={geo.isDetecting}
                hasLocation={geo.hasLocation}
                onDetect={handleDetectLocation}
                onClear={() => {
                  geo.clearLocation();
                  setValue('address', '');
                  setValue('latitude', 0 as unknown as number);
                  setValue('longitude', 0 as unknown as number);
                }}
                error={geo.error}
              />
              {errors.latitude && !geo.hasLocation && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Please detect your location
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="form-label">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  {...register('description')}
                  rows={5}
                  placeholder="Provide more details about the issue to help authorities respond faster..."
                  className={cn(
                    'input-field resize-none',
                    errors.description ? 'border-red-300 focus:border-red-400' : ''
                  )}
                />
                <div className="absolute bottom-2 right-3 text-[10px] text-gray-400">
                  {descriptionValue?.length || 0}/2000
                </div>
              </div>
              {errors.description && (
                <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Tags */}
            <div>
              <label className="form-label">
                Tags{' '}
                <span className="text-xs text-gray-400 font-normal">
                  (optional, comma-separated)
                </span>
              </label>
              <input
                {...register('tags')}
                type="text"
                placeholder="e.g. road, pothole, danger"
                className="input-field"
              />
            </div>
          </div>
        </div>

        {/* ── Submit Button ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-5"
        >
          <motion.button
            type="submit"
            disabled={isSubmitting || !geo.hasLocation}
            whileHover={{
              scale: isSubmitting || !geo.hasLocation ? 1 : 1.01,
            }}
            whileTap={{ scale: isSubmitting || !geo.hasLocation ? 1 : 0.99 }}
            className={cn(
              'w-full flex items-center justify-center gap-3',
              'py-4 rounded-2xl text-base font-bold',
              'transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
              isSubmitting || !geo.hasLocation
                ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/30'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Report...
              </>
            ) : (
              <>
                Submit Report
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </motion.button>

          {!geo.hasLocation && (
            <p className="text-center text-xs text-gray-400 mt-2">
              ⚠️ Please detect your location before submitting
            </p>
          )}
        </motion.div>
      </form>
    </div>
  );
}