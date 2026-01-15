import React, { useState } from 'react';
import { Image as ImageIcon, Upload, Wand2, AlertCircle, Check, X } from 'lucide-react';

interface ImageItem {
  id: string;
  filename: string;
  path: string;
  size: number;
  format: string;
  width: number;
  height: number;
  alt: string;
  usedIn: string[];
  status: 'optimized' | 'needs-optimization' | 'missing-alt';
}

const ImagesDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'inventory' | 'upload' | 'ai-generate' | 'missing'>('inventory');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Sample data
  const images: ImageItem[] = [
    {
      id: '1',
      filename: 'hero-airport.png',
      path: '/images/airport/hero-airport.png',
      size: 5242880, // 5MB
      format: 'PNG',
      width: 1920,
      height: 1080,
      alt: 'Luxury black car at O\'Hare Airport',
      usedIn: ['Home', 'O\'Hare Airport'],
      status: 'needs-optimization'
    },
    {
      id: '2',
      filename: 'fleet-sedan-01.webp',
      path: '/images/fleet/sedan-01.webp',
      size: 186420, // 182KB
      format: 'WebP',
      width: 1200,
      height: 800,
      alt: 'Mercedes-Benz S-Class sedan',
      usedIn: ['Fleet'],
      status: 'optimized'
    },
    {
      id: '3',
      filename: 'midway-terminal.png',
      path: '/images/airport/midway-terminal.png',
      size: 3145728, // 3MB
      format: 'PNG',
      width: 1600,
      height: 900,
      alt: '',
      usedIn: ['Midway Airport'],
      status: 'missing-alt'
    }
  ];

  const missingImagesCount = 8;
  const needsOptimizationCount = images.filter(img => img.status === 'needs-optimization').length;

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'optimized':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
          <Check className="w-3 h-3" /> Optimized
        </span>;
      case 'needs-optimization':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
          <AlertCircle className="w-3 h-3" /> Needs Optimization
        </span>;
      case 'missing-alt':
        return <span className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
          <X className="w-3 h-3" /> Missing Alt Text
        </span>;
      default:
        return null;
    }
  };

  const handleFileUpload = () => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 500);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Image Management</h2>
          <p className="text-gray-600">Manage, optimize, and generate images</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="text-orange-600 font-medium">
            {needsOptimizationCount} need optimization
          </div>
          <div className="text-red-600 font-medium">
            {missingImagesCount} missing
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {['inventory', 'upload', 'ai-generate', 'missing'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={`px-4 py-2 border-b-2 transition-colors capitalize ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600 font-medium'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      {activeTab === 'inventory' && (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Image
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dimensions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Size
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Used In
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {images.map((image) => (
                <tr key={image.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{image.filename}</div>
                        <div className="text-sm text-gray-500">{image.format}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {image.width} × {image.height}
                  </td>
                  <td className="px-6 py-4">
                    <span className={image.size > 1048576 ? 'text-orange-600 font-medium' : 'text-gray-900'}>
                      {formatFileSize(image.size)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {image.usedIn.map((page, idx) => (
                        <span key={idx} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                          {page}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(image.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {image.status === 'needs-optimization' && (
                        <button className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded hover:bg-orange-200">
                          Optimize
                        </button>
                      )}
                      {image.status === 'missing-alt' && (
                        <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                          Add Alt
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'upload' && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="max-w-2xl mx-auto">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Upload Images</h3>
              <p className="text-gray-600 mb-4">
                Drag and drop images here, or click to browse
              </p>
              <button
                onClick={handleFileUpload}
                disabled={isUploading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Select Files'}
              </button>
            </div>

            {isUploading && (
              <div className="mt-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-700">Uploading images...</span>
                  <span className="text-gray-600">{uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Image Requirements:</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Supported formats: PNG, JPG, WebP</li>
                <li>• Maximum file size: 10 MB</li>
                <li>• Recommended dimensions: 1200×800 or larger</li>
                <li>• Always include descriptive alt text</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'ai-generate' && (
        <div className="bg-white border border-gray-200 rounded-lg p-8">
          <div className="max-w-2xl mx-auto text-center">
            <Wand2 className="w-12 h-12 text-purple-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">AI Image Generation</h3>
            <p className="text-gray-600 mb-6">
              Generate professional images using AI based on your prompts.
            </p>
            <div className="text-left space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Description
                </label>
                <textarea
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={4}
                  placeholder="Describe the image you want to generate (e.g., 'Luxury black sedan parked in front of Chicago O'Hare Airport terminal at sunset')"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Style
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>Photorealistic</option>
                    <option>Professional</option>
                    <option>Editorial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aspect Ratio
                  </label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
                    <option>16:9 (Landscape)</option>
                    <option>4:3 (Standard)</option>
                    <option>1:1 (Square)</option>
                  </select>
                </div>
              </div>
              <button className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium">
                Generate Image
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'missing' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-4 p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-red-900 mb-1">
                {missingImagesCount} Missing Images Detected
              </h3>
              <p className="text-sm text-red-800">
                These pages reference images that don't exist. Generate or upload them to fix broken image links.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {[
              { page: 'Party Bus Page', missing: 3, paths: ['party-bus-exterior.jpg', 'party-bus-interior.jpg', 'party-bus-lights.jpg'] },
              { page: 'Wedding Transportation', missing: 2, paths: ['wedding-couple-car.jpg', 'wedding-limousine.jpg'] },
              { page: 'Corporate Service', missing: 3, paths: ['executive-sedan.jpg', 'corporate-fleet.jpg', 'business-meeting.jpg'] }
            ].map((item, idx) => (
              <div key={idx} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{item.page}</h4>
                  <span className="text-sm text-red-600 font-medium">{item.missing} missing</span>
                </div>
                <div className="space-y-1 mb-3">
                  {item.paths.map((path, pidx) => (
                    <div key={pidx} className="text-sm text-gray-600 font-mono">
                      {path}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200">
                    Generate with AI
                  </button>
                  <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                    Upload Files
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImagesDashboard;
