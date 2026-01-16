import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../state/AuthProvider';

interface ContentJob {
  id: string;
  website: string;
  locationIds: string[];
  serviceIds: string[];
  totalItems: number;
  completedItems: number;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
}

interface Location {
  id: string;
  name: string;
  region: string;
}

interface Service {
  id: string;
  name: string;
  website: string;
}

const WEBSITES = [
  { id: 'airport', label: 'Airport Black Car', color: 'blue' },
  { id: 'corporate', label: 'Corporate Executive', color: 'purple' },
  { id: 'wedding', label: 'Wedding Transportation', color: 'pink' },
  { id: 'partyBus', label: 'Party Bus', color: 'orange' },
] as const;

const WORKFLOW_STEPS = [
  { id: 1, title: 'Select Websites', description: 'Choose which websites to generate content for' },
  { id: 2, title: 'Select Locations', description: 'Pick specific locations or select all' },
  { id: 3, title: 'Select Services', description: 'Choose services or generate for all applicable' },
  { id: 4, title: 'Preview & Confirm', description: 'Review your selections before generation' },
  { id: 5, title: 'Generate Content', description: 'AI content generation in progress' },
];

export default function ContentPipelinePage() {
  const { user, role } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedWebsites, setSelectedWebsites] = useState<Set<string>>(new Set());
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [selectedServices, setSelectedServices] = useState<Set<string>>(new Set());
  const [selectAllLocations, setSelectAllLocations] = useState(false);
  const [selectAllServices, setSelectAllServices] = useState(false);

  const [locations, setLocations] = useState<Location[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [jobs, setJobs] = useState<ContentJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState({ current: 0, total: 0 });

  useEffect(() => {
    if (role !== 'admin' && role !== 'superadmin') return;
    loadData();
  }, [role]);

  async function loadData() {
    try {
      setLoading(true);

      const [locationsSnap, servicesSnap, jobsSnap] = await Promise.all([
        getDocs(query(collection(db, 'locations'))),
        getDocs(query(collection(db, 'services'))),
        getDocs(query(collection(db, 'contentJobs'))),
      ]);

      const locsData = locationsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Location[];

      const servicesData = servicesSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Service[];

      const jobsData = jobsSnap.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as ContentJob[];

      setLocations(locsData);
      setServices(servicesData);
      setJobs(jobsData.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredServices = selectedWebsites.size > 0
    ? services.filter((s) => selectedWebsites.has(s.website))
    : services;

  async function handleGenerate() {
    if (selectedWebsites.size === 0) {
      alert('Please select at least one website');
      return;
    }

    setGenerating(true);
    const websitesArray = Array.from(selectedWebsites);
    const locationsArray = selectAllLocations ? locations.map((l) => l.id) : Array.from(selectedLocations);
    const servicesArray = selectAllServices ? filteredServices.map((s) => s.id) : Array.from(selectedServices);

    const totalItems = websitesArray.length * locationsArray.length * servicesArray.length;
    setGenerationProgress({ current: 0, total: totalItems });

    try {
      const response = await fetch('/.netlify/functions/generate-pipeline-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          websites: websitesArray,
          locationIds: locationsArray,
          serviceIds: servicesArray,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const result = await response.json();

      await addDoc(collection(db, 'contentJobs'), {
        website: websitesArray.join(','),
        locationIds: locationsArray,
        serviceIds: servicesArray,
        totalItems: result.totalItems || totalItems,
        completedItems: 0,
        status: 'pending',
        createdAt: serverTimestamp(),
      });

      alert(`Successfully queued ${result.totalItems || totalItems} content items for generation`);
      setGenerating(false);
      setCurrentStep(1);
      setSelectedWebsites(new Set());
      setSelectedLocations(new Set());
      setSelectedServices(new Set());
      setSelectAllLocations(false);
      setSelectAllServices(false);
      loadData();
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Failed to start content generation. Check console for details.');
      setGenerating(false);
    }
  }

  function toggleWebsite(websiteId: string) {
    const newSet = new Set(selectedWebsites);
    if (newSet.has(websiteId)) {
      newSet.delete(websiteId);
    } else {
      newSet.add(websiteId);
    }
    setSelectedWebsites(newSet);
  }

  function toggleLocation(locationId: string) {
    const newSet = new Set(selectedLocations);
    if (newSet.has(locationId)) {
      newSet.delete(locationId);
    } else {
      newSet.add(locationId);
    }
    setSelectedLocations(newSet);
  }

  function toggleService(serviceId: string) {
    const newSet = new Set(selectedServices);
    if (newSet.has(serviceId)) {
      newSet.delete(serviceId);
    } else {
      newSet.add(serviceId);
    }
    setSelectedServices(newSet);
  }

  function canProceed(step: number) {
    switch (step) {
      case 1:
        return selectedWebsites.size > 0;
      case 2:
        return selectAllLocations || selectedLocations.size > 0;
      case 3:
        return selectAllServices || selectedServices.size > 0;
      case 4:
        return true;
      default:
        return false;
    }
  }

  if (role !== 'admin' && role !== 'superadmin') {
    return <div className="p-8">Access Denied. Admins only.</div>;
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Content Generation Pipeline</h1>
          <p className="text-gray-600">
            AI-powered workflow to generate SEO content at scale across all websites
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            {WORKFLOW_STEPS.map((step, idx) => (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg mb-2 transition ${
                      currentStep === step.id
                        ? 'bg-blue-600 text-white'
                        : currentStep > step.id
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {currentStep > step.id ? '✓' : step.id}
                  </div>
                  <div className="text-sm font-semibold text-gray-900">{step.title}</div>
                  <div className="text-xs text-gray-500 text-center">{step.description}</div>
                </div>
                {idx < WORKFLOW_STEPS.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 transition ${
                      currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          {currentStep === 1 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 1: Select Websites</h2>
              <p className="text-gray-600 mb-6">
                Choose which websites you want to generate content for
              </p>
              <div className="grid grid-cols-2 gap-4">
                {WEBSITES.map((website) => (
                  <button
                    key={website.id}
                    onClick={() => toggleWebsite(website.id)}
                    className={`p-6 border-2 rounded-lg transition ${
                      selectedWebsites.has(website.id)
                        ? `border-${website.color}-600 bg-${website.color}-50`
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="font-bold text-lg">{website.label}</div>
                        <div className="text-sm text-gray-600">
                          {services.filter((s) => s.website === website.id).length} services
                        </div>
                      </div>
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                          selectedWebsites.has(website.id)
                            ? `border-${website.color}-600 bg-${website.color}-600`
                            : 'border-gray-300'
                        }`}
                      >
                        {selectedWebsites.has(website.id) && (
                          <span className="text-white text-sm">✓</span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 2: Select Locations</h2>
              <p className="text-gray-600 mb-6">
                Choose specific locations or generate for all {locations.length} locations
              </p>

              <div className="mb-6">
                <label className="flex items-center gap-3 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAllLocations}
                    onChange={(e) => setSelectAllLocations(e.target.checked)}
                    className="w-6 h-6"
                  />
                  <div>
                    <div className="font-bold text-blue-900">Select All Locations</div>
                    <div className="text-sm text-blue-700">
                      Generate content for all {locations.length} Chicago locations
                    </div>
                  </div>
                </label>
              </div>

              {!selectAllLocations && (
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {locations.map((location) => (
                    <label
                      key={location.id}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedLocations.has(location.id)}
                        onChange={() => toggleLocation(location.id)}
                        className="w-5 h-5"
                      />
                      <div>
                        <div className="font-semibold text-gray-900">{location.name}</div>
                        <div className="text-sm text-gray-500 capitalize">
                          {location.region.replace('-', ' ')}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600">
                {selectAllLocations ? (
                  <span className="font-semibold text-green-600">
                    All {locations.length} locations selected
                  </span>
                ) : (
                  <span>
                    {selectedLocations.size} of {locations.length} locations selected
                  </span>
                )}
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 3: Select Services</h2>
              <p className="text-gray-600 mb-6">
                Choose specific services or generate for all applicable services
              </p>

              <div className="mb-6">
                <label className="flex items-center gap-3 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectAllServices}
                    onChange={(e) => setSelectAllServices(e.target.checked)}
                    className="w-6 h-6"
                  />
                  <div>
                    <div className="font-bold text-purple-900">Select All Services</div>
                    <div className="text-sm text-purple-700">
                      Generate content for all {filteredServices.length} services in selected websites
                    </div>
                  </div>
                </label>
              </div>

              {!selectAllServices && (
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
                  {filteredServices.map((service) => (
                    <label
                      key={service.id}
                      className="flex items-center gap-3 p-4 hover:bg-gray-50 border-b border-gray-100 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedServices.has(service.id)}
                        onChange={() => toggleService(service.id)}
                        className="w-5 h-5"
                      />
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-500 capitalize">{service.website}</div>
                      </div>
                    </label>
                  ))}
                </div>
              )}

              <div className="mt-4 text-sm text-gray-600">
                {selectAllServices ? (
                  <span className="font-semibold text-green-600">
                    All {filteredServices.length} services selected
                  </span>
                ) : (
                  <span>
                    {selectedServices.size} of {filteredServices.length} services selected
                  </span>
                )}
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 4: Preview & Confirm</h2>
              <p className="text-gray-600 mb-6">
                Review your selections before starting content generation
              </p>

              <div className="space-y-6">
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">Selected Websites</h3>
                  <div className="flex flex-wrap gap-2">
                    {Array.from(selectedWebsites).map((websiteId) => {
                      const website = WEBSITES.find((w) => w.id === websiteId);
                      return (
                        <span
                          key={websiteId}
                          className={`px-4 py-2 bg-${website?.color}-100 text-${website?.color}-800 rounded-full font-semibold`}
                        >
                          {website?.label}
                        </span>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">Locations</h3>
                  <p className="text-green-800">
                    {selectAllLocations
                      ? `All ${locations.length} locations`
                      : `${selectedLocations.size} selected locations`}
                  </p>
                </div>

                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="font-bold text-lg mb-3">Services</h3>
                  <p className="text-purple-800">
                    {selectAllServices
                      ? `All ${filteredServices.length} services`
                      : `${selectedServices.size} selected services`}
                  </p>
                </div>

                <div className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-300">
                  <h3 className="font-bold text-lg mb-2">Total Content Items</h3>
                  <div className="text-4xl font-bold text-yellow-900">
                    {selectedWebsites.size *
                      (selectAllLocations ? locations.length : selectedLocations.size) *
                      (selectAllServices ? filteredServices.length : selectedServices.size)}
                  </div>
                  <p className="text-sm text-yellow-700 mt-2">
                    AI-generated pages to be created
                  </p>
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Step 5: Generating Content</h2>
              <div className="text-center py-12">
                {generating ? (
                  <>
                    <div className="mb-6">
                      <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
                    </div>
                    <p className="text-xl font-semibold mb-2">Generating Content...</p>
                    <p className="text-gray-600">
                      {generationProgress.current} of {generationProgress.total} items completed
                    </p>
                    <div className="mt-4 max-w-md mx-auto">
                      <div className="bg-gray-200 rounded-full h-4">
                        <div
                          className="bg-blue-600 h-4 rounded-full transition-all"
                          style={{
                            width: `${
                              (generationProgress.current / generationProgress.total) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-green-600">
                    <div className="text-6xl mb-4">✓</div>
                    <p className="text-xl font-semibold">Generation Complete!</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-bold transition ${
              currentStep === 1
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-gray-600 text-white hover:bg-gray-700'
            }`}
          >
            Previous
          </button>

          <div className="text-sm text-gray-600">
            Step {currentStep} of {WORKFLOW_STEPS.length}
          </div>

          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceed(currentStep)}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                canProceed(currentStep)
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              Next
            </button>
          ) : currentStep === 4 ? (
            <button
              onClick={() => {
                setCurrentStep(5);
                handleGenerate();
              }}
              className="px-8 py-3 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 transition"
            >
              Start Generation
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentStep(1);
                setSelectedWebsites(new Set());
                setSelectedLocations(new Set());
                setSelectedServices(new Set());
                setSelectAllLocations(false);
                setSelectAllServices(false);
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition"
            >
              Start New Pipeline
            </button>
          )}
        </div>

        {/* Recent Jobs Queue */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Recent Generation Jobs</h2>
          <div className="space-y-3">
            {jobs.slice(0, 10).map((job) => (
              <div
                key={job.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-gray-900">
                      {job.website} - {job.totalItems} items
                    </div>
                    <div className="text-sm text-gray-500">
                      Created: {new Date(job.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                      {job.completedItems} / {job.totalItems}
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        job.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : job.status === 'in-progress'
                          ? 'bg-blue-100 text-blue-800'
                          : job.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {job.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {jobs.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                No generation jobs yet. Start your first pipeline above!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
