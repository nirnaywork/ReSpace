import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import MapPicker from '../components/ui/MapPicker';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../hooks/useAuth';
import { PROPERTY_TYPES, AMENITIES, DAYS_OF_WEEK } from '../utils/constants';
import { Building2, ChevronRight, ChevronLeft, Check, Info, Plus, Minus } from 'lucide-react';

const STEPS = ['Property Basics', 'Location & Pricing', 'Availability & Amenities', 'Verification & Terms'];

const TERMS_TEXT = `OWNER TERMS & CONDITIONS

1. LISTING ACCURACY: You agree to provide accurate, complete, and non-misleading information about your space, including photos, pricing, and amenities.

2. AVAILABILITY: You are responsible for maintaining accurate availability on your listing. Accepting bookings for unavailable slots is a violation.

3. PAYMENT: ReSpace collects a 5% platform fee on each successful booking. The remaining amount will be settled to your registered bank account within 3-5 business days.

4. CANCELLATIONS: If you accept a booking and then cancel, ReSpace may impose penalties including temporary or permanent delisting of your space.

5. VERIFICATION: You agree to provide valid government-issued ID (Aadhaar, PAN) for verification purposes. This information is encrypted and stored securely.

6. PROHIBITED CONTENT: You may not list spaces that are illegal, unsafe, or violate any applicable laws or regulations.

7. DISPUTE RESOLUTION: In case of disputes with renters, ReSpace will act as a neutral mediator. Our decision regarding disputes is final.

8. INSURANCE: You are responsible for ensuring adequate insurance coverage for your space and any activities conducted therein.

9. COMPLIANCE: You agree to comply with all local laws, regulations, and zoning requirements applicable to your space.

10. TERMINATION: ReSpace reserves the right to remove any listing that violates these terms without prior notice.

By submitting your listing, you agree to these terms and confirm that you have the legal right to rent the listed space.`;

const AddSpace = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { userProfile, refreshProfile } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [customSlots, setCustomSlots] = useState([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [refundPolicy, setRefundPolicy] = useState(false);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      propertyName: '',
      propertyType: '',
      description: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      lat: null,
      lng: null,
      priceAmount: '',
      priceType: 'hour',
      securityDeposit: '',
      refundHours: 24,
      openTime: '09:00',
      closeTime: '18:00',
      aadhaar: '',
      pan: '',
    }
  });

  const description = watch('description');
  const priceType = watch('priceType');
  const refundHours = watch('refundHours');

  const toggleAmenity = (a) => setSelectedAmenities((prev) => prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]);
  const toggleDay = (d) => setSelectedDays((prev) => prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]);

  const addCustomSlot = () => setCustomSlots((prev) => [...prev, { start: '09:00', end: '11:00' }]);
  const removeCustomSlot = (i) => setCustomSlots((prev) => prev.filter((_, idx) => idx !== i));
  const updateSlot = (i, key, val) => {
    setCustomSlots((prev) => prev.map((s, idx) => idx === i ? { ...s, [key]: val } : s));
  };

  const onSubmit = async (formData) => {
    if (!agreedToTerms) { toast.error('Please agree to the Terms & Conditions'); return; }

    setSubmitting(true);
    try {
      const payload = {
        propertyName: formData.propertyName,
        propertyType: formData.propertyType,
        description: formData.description,
        location: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          lat: formData.lat || null,
          lng: formData.lng || null,
        },
        price: {
          amount: Number(formData.priceAmount),
          type: formData.priceType,
          currency: 'INR',
        },
        securityDeposit: formData.securityDeposit ? Number(formData.securityDeposit) : 0,
        refundPolicy,
        refundHours: refundPolicy ? Number(formData.refundHours) : 24,
        availability: {
          days: selectedDays,
          openTime: formData.openTime,
          closeTime: formData.closeTime,
          customSlots,
        },
        amenities: selectedAmenities,
        images: [],
        verification: {
          aadhaar: formData.aadhaar ? formData.aadhaar.slice(-4).padStart(12, '*') : '',
          pan: formData.pan,
          isSubmitted: !!(formData.aadhaar || formData.pan),
        },
      };

      const res = await api.post('/api/listings', payload);
      if (res.data.success) {
        await refreshProfile();
        toast.success('Listing published successfully!');
        navigate('/listings');
      }
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to submit listing');
    } finally {
      setSubmitting(false);
    }
  };

  const canGoNext = () => {
    if (step === 1) return watch('propertyName') && watch('propertyType') && watch('description')?.length >= 50;
    if (step === 2) return watch('address') && watch('priceAmount');
    if (step === 3) return selectedDays.length > 0;
    return agreedToTerms;
  };

  return (
    <>
      <Helmet>
        <title>List Your Space – ReSpace</title>
      </Helmet>

      <div className="min-h-screen bg-brand-cream py-8">
        <div className="page-container max-w-3xl">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-brand-dark font-bold">List Your Space</h1>
            <p className="text-brand-muted mt-1 text-sm">Start earning from your idle commercial space</p>
          </div>

          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center gap-2">
              {STEPS.map((s, i) => (
                <React.Fragment key={s}>
                  <div className={`flex items-center gap-2 ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      step > i + 1 ? 'bg-brand-success text-white' :
                      step === i + 1 ? 'bg-brand-red text-white' :
                      'bg-gray-200 text-brand-muted'
                    }`}>
                      {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${step === i + 1 ? 'text-brand-red' : 'text-brand-muted'}`}>
                      {s}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-1 transition-all ${step > i + 1 ? 'bg-brand-success' : 'bg-gray-200'}`} />}
                </React.Fragment>
              ))}
            </div>
            <p className="text-xs text-brand-muted mt-3">Step {step} of {STEPS.length}: <span className="font-semibold text-brand-dark">{STEPS[step - 1]}</span></p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="card p-6 md:p-8 space-y-6">

              {/* ── STEP 1: Property Basics ── */}
              {step === 1 && (
                <>
                  <Input id="propertyName" label="Property Name" required placeholder="e.g. Downtown Commercial Kitchen" error={errors.propertyName?.message} {...register('propertyName', { required: 'Property name is required', maxLength: { value: 100, message: 'Max 100 characters' } })} />

                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Property Type <span className="text-brand-error">*</span></label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {PROPERTY_TYPES.map((type) => (
                        <label key={type} className={`flex items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all text-sm ${watch('propertyType') === type ? 'border-brand-red bg-red-50 text-brand-red font-medium' : 'border-brand-border text-brand-dark hover:border-gray-300'}`}>
                          <input type="radio" value={type} {...register('propertyType', { required: true })} className="sr-only" />
                          {type}
                        </label>
                      ))}
                    </div>
                    {errors.propertyType && <p className="text-xs text-brand-error mt-1">Please select a property type</p>}
                  </div>

                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-brand-dark mb-1.5">
                      Description <span className="text-brand-error">*</span>
                      <span className="float-right text-xs text-brand-muted font-normal">{description?.length || 0}/2000</span>
                    </label>
                    <textarea
                      id="description"
                      {...register('description', { required: 'Description required', minLength: { value: 50, message: 'At least 50 characters' }, maxLength: { value: 2000, message: 'Max 2000 characters' } })}
                      className={`textarea-field w-full h-32 ${errors.description ? 'input-error' : ''}`}
                      placeholder="Describe your space: features, use cases, rules..."
                    />
                    {errors.description && <p className="text-xs text-brand-error mt-1">{errors.description.message}</p>}
                  </div>


                </>
              )}

              {/* ── STEP 2: Location & Pricing ── */}
              {step === 2 && (
                <>
                  <Input id="address" label="Full Address" required placeholder="Building, Street, Area" error={errors.address?.message} {...register('address', { required: 'Address is required' })} />

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Input id="city" label="City" placeholder="Hyderabad" {...register('city')} />
                    <Input id="state" label="State" placeholder="Telangana" {...register('state')} />
                    <Input id="pincode" label="Pincode" placeholder="500001" {...register('pincode')} />
                  </div>

                  <MapPicker address={watch('address')} lat={watch('lat')} lng={watch('lng')} />

                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Pricing <span className="text-brand-error">*</span></label>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="flex gap-2">
                        {['hour', 'day', 'week'].map((t) => (
                          <label key={t} className={`flex items-center gap-1.5 px-4 py-2 border-2 rounded-xl cursor-pointer text-sm font-medium transition-all capitalize ${priceType === t ? 'border-brand-red bg-red-50 text-brand-red' : 'border-brand-border text-brand-dark hover:border-gray-300'}`}>
                            <input type="radio" value={t} {...register('priceType')} className="sr-only" />
                            Per {t}
                          </label>
                        ))}
                      </div>
                      <Input id="priceAmount" type="number" required prefix="₹" placeholder="500" className="flex-1" error={errors.priceAmount?.message} {...register('priceAmount', { required: 'Price required', min: { value: 1, message: 'Must be > 0' } })} />
                    </div>
                  </div>

                  <Input id="securityDeposit" type="number" label="Security Deposit (optional)" prefix="₹" placeholder="0" helperText="Amount collected as security, refunded after space return" {...register('securityDeposit')} />

                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Refund Policy</label>
                    <div className={`p-4 rounded-xl border-2 transition-all ${refundPolicy ? 'border-brand-success bg-green-50' : 'border-brand-error/30 bg-red-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-brand-dark">{refundPolicy ? 'Refund Available' : 'Non-Refundable'}</p>
                          <p className="text-xs text-brand-muted mt-0.5">
                            {refundPolicy ? 'Renters can cancel for a full refund within your specified window' : 'This listing will be marked Non-Refundable — no cancellations'}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setRefundPolicy(!refundPolicy)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${refundPolicy ? 'bg-brand-success' : 'bg-gray-300'}`}
                          aria-checked={refundPolicy}
                          role="switch"
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${refundPolicy ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                      {refundPolicy && (
                        <div className="mt-3 flex items-center gap-2">
                          <span className="text-sm text-brand-muted">Allow cancellation up to</span>
                          <input type="number" min={1} max={168} className="input-field h-9 w-20 text-center" defaultValue={24} {...register('refundHours')} />
                          <span className="text-sm text-brand-muted">hours before</span>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 3: Availability & Amenities ── */}
              {step === 3 && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Available Days <span className="text-brand-error">*</span></label>
                    <div className="flex flex-wrap gap-2">
                      {DAYS_OF_WEEK.map((day) => (
                        <button key={day} type="button" onClick={() => toggleDay(day)}
                          className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all ${selectedDays.includes(day) ? 'bg-brand-red text-white border-brand-red' : 'border-brand-border text-brand-dark hover:border-brand-red'}`}
                          aria-pressed={selectedDays.includes(day)}>
                          {day}
                        </button>
                      ))}
                    </div>
                    {selectedDays.length === 0 && <p className="text-xs text-brand-error mt-1">Select at least one day</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Input id="openTime" type="time" label="Opening Time" {...register('openTime')} />
                    <Input id="closeTime" type="time" label="Closing Time" {...register('closeTime')} />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-sm font-medium text-brand-dark">Custom Time Slots (optional)</label>
                      <button type="button" onClick={addCustomSlot} className="flex items-center gap-1 text-xs text-brand-red hover:underline font-medium">
                        <Plus className="w-3 h-3" /> Add Slot
                      </button>
                    </div>
                    <div className="space-y-2">
                      {customSlots.map((slot, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <input type="time" value={slot.start} onChange={(e) => updateSlot(i, 'start', e.target.value)} className="input-field h-9 flex-1" />
                          <span className="text-brand-muted text-sm">to</span>
                          <input type="time" value={slot.end} onChange={(e) => updateSlot(i, 'end', e.target.value)} className="input-field h-9 flex-1" />
                          <button type="button" onClick={() => removeCustomSlot(i)} className="text-brand-error hover:bg-red-50 p-1 rounded" aria-label="Remove slot">
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      {customSlots.length === 0 && <p className="text-xs text-brand-muted">Slots will be auto-generated from open/close time if none added.</p>}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Amenities</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {AMENITIES.map((a) => (
                        <label key={a} className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all text-sm ${selectedAmenities.includes(a) ? 'bg-red-50 border-brand-red text-brand-red font-medium' : 'border-brand-border text-brand-dark hover:border-gray-300'}`}>
                          <input type="checkbox" checked={selectedAmenities.includes(a)} onChange={() => toggleAmenity(a)} className="accent-brand-red w-4 h-4" />
                          {a}
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* ── STEP 4: Verification & Terms ── */}
              {step === 4 && (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex gap-2">
                    <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-700">
                      Your documents are encrypted and stored securely. Only the last 4 digits of Aadhaar are visible to ReSpace.
                    </p>
                  </div>

                  <Input id="aadhaar" label="Aadhaar Number" placeholder="XXXX XXXX XXXX" maxLength={12}
                    helperText="12-digit Aadhaar number"
                    {...register('aadhaar', {
                      pattern: { value: /^\d{12}$/, message: 'Aadhaar must be 12 digits' }
                    })}
                    error={errors.aadhaar?.message}
                  />

                  <Input id="pan" label="PAN Number" placeholder="ABCDE1234F" maxLength={10}
                    helperText="10-character PAN (e.g. ABCDE1234F)"
                    {...register('pan', {
                      pattern: { value: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, message: 'Invalid PAN format (e.g. ABCDE1234F)' }
                    })}
                    error={errors.pan?.message}
                  />

                  <div>
                    <label className="block text-sm font-medium text-brand-dark mb-2">Terms & Conditions</label>
                    <div className="border border-brand-border rounded-xl h-40 overflow-y-auto p-4 bg-gray-50 text-xs text-brand-muted leading-relaxed whitespace-pre-line scrollbar-thin">
                      {TERMS_TEXT}
                    </div>
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-brand-red rounded"
                      id="terms-checkbox"
                    />
                    <span className="text-sm text-brand-dark">
                      I have read and agree to the <span className="text-brand-red font-medium">Owner Terms & Conditions</span>
                    </span>
                  </label>
                </>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2 border-t border-brand-border">
                {step > 1 && (
                  <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} className="flex-1">
                    <ChevronLeft className="w-4 h-4" /> Back
                  </Button>
                )}
                {step < 4 ? (
                  <Button
                    type="button"
                    variant="primary"
                    className="flex-1"
                    disabled={!canGoNext()}
                    onClick={() => setStep(step + 1)}
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    variant="primary"
                    className="flex-1"
                    loading={submitting}
                    disabled={!agreedToTerms || submitting}
                  >
                    Submit Listing
                  </Button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default AddSpace;
