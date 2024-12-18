'use client';

import React from 'react';
import { Card, Title, Text, Badge } from "@tremor/react";
import { CloudArrowUpIcon, TrashIcon, XCircleIcon, CheckCircleIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "../../utils/fetcher";
import * as z from 'zod';

interface Plugin {
  id: string;
  name: string;
  type: 'plugin' | 'theme';
  status: 'pending' | 'active' | 'error';
  description: string;
  version: string;
  category: string;
  created_at: string;
}

const pluginSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().min(1, 'Description is required'),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in format x.y.z'),
  type: z.enum(['plugin', 'theme']),
  category: z.string().min(1, 'Category is required'),
  main: z.string().min(1, 'Main entry point is required'),
});

export function PluginManager() {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    type: 'plugin' as const,
    category: 'general',
  });
  const [contentFile, setContentFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const { data: plugins, error: fetchError } = useSWR<Plugin[]>('/api/plugins', fetcher);

  const validatePlugin = async (file: File): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> => {
    try {
      const content = await file.text();
      const json = JSON.parse(content);
      const result = pluginSchema.safeParse(json);

      if (!result.success) {
        return {
          isValid: false,
          errors: result.error.errors.map(err => `${err.path.join('.')}: ${err.message}`),
          warnings: [],
        };
      }

      return {
        isValid: true,
        errors: [],
        warnings: [],
      };
    } catch (error) {
      return {
        isValid: false,
        errors: ['Invalid JSON file'],
        warnings: [],
      };
    }
  };

  const handleContentFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setValidationResult(null);
    setUploadProgress(0);

    if (!file.name.endsWith('.json')) {
      setUploadError('Please upload a JSON file');
      return;
    }

    const result = await validatePlugin(file);
    setValidationResult(result);

    if (result.isValid) {
      setContentFile(file);
      try {
        const content = await file.text();
        const json = JSON.parse(content);
        setFormData(prev => ({
          ...prev,
          name: json.name || prev.name,
          description: json.description || prev.description,
          version: json.version || prev.version,
        }));
      } catch (error) {
        console.error('Error parsing plugin file:', error);
      }
    }
  };

  const handlePreviewUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please upload an image file');
      return;
    }

    setPreviewImage(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contentFile || !validationResult?.isValid) return;

    setUploading(true);
    setUploadError(null);

    const submitData = new FormData();
    submitData.append('file', contentFile);
    submitData.append('name', formData.name);
    submitData.append('description', formData.description);
    submitData.append('version', formData.version);
    submitData.append('type', formData.type);
    submitData.append('category', formData.category);
    if (previewImage) {
      submitData.append('preview', previewImage);
    }

    try {
      const response = await fetch('/api/plugins/upload', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        version: '1.0.0',
        type: 'plugin',
        category: 'general',
      });
      setContentFile(null);
      setPreviewImage(null);
      setPreviewUrl(null);
      setValidationResult(null);
      setUploadProgress(0);

      // Refresh the plugins list
      await mutate('/api/plugins');
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Failed to upload plugin');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string, type: 'plugin' | 'theme') => {
    if (!confirm('Are you sure you want to delete this item?')) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch('/api/plugins/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, type }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      await mutate('/api/plugins');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to delete item');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <Title>Upload Plugin or Theme</Title>
        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Plugin/Theme Details */}
          <div className="space-y-4">
            <div>
              <Text>Name</Text>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Text>Description</Text>
              <textarea
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
                rows={3}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Text>Version</Text>
                <input
                  type="text"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  pattern="^\d+\.\d+\.\d+$"
                  required
                />
              </div>

              <div>
                <Text>Type</Text>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as 'plugin' | 'theme' }))}
                >
                  <option value="plugin">Plugin</option>
                  <option value="theme">Theme</option>
                </select>
              </div>

              <div>
                <Text>Category</Text>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                >
                  <option value="general">General</option>
                  <option value="productivity">Productivity</option>
                  <option value="development">Development</option>
                  <option value="design">Design</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload Section */}
          <div className="space-y-4">
            <div>
              <Text>Plugin/Theme File (JSON)</Text>
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <CloudArrowUpIcon className="h-8 w-8 mx-auto text-gray-400" />
                  <Text className="mt-2">
                    {contentFile ? contentFile.name : 'Click to upload plugin/theme file'}
                  </Text>
                  <Text className="text-sm text-gray-500 mt-1">
                    JSON files only
                  </Text>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept=".json"
                  onChange={handleContentFileUpload}
                  disabled={uploading}
                />
              </label>
              {validationResult && (
                <div className="mt-2">
                  {validationResult.isValid ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      <span>Validation successful</span>
                    </div>
                  ) : (
                    <div className="text-red-500">
                      <div className="flex items-center">
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        <span>Validation failed</span>
                      </div>
                      <ul className="list-disc list-inside mt-1">
                        {validationResult.errors.map((error, index) => (
                          <li key={index} className="text-sm">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <Text>Preview Image (Optional)</Text>
              <label className="cursor-pointer block">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="max-h-32 mx-auto" />
                  ) : (
                    <>
                      <CloudArrowUpIcon className="h-8 w-8 mx-auto text-gray-400" />
                      <Text className="mt-2">Click to upload preview image</Text>
                      <Text className="text-sm text-gray-500 mt-1">
                        PNG, JPG, GIF up to 2MB
                      </Text>
                    </>
                  )}
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePreviewUpload}
                  disabled={uploading}
                />
              </label>
            </div>
          </div>

          {uploadError && (
            <div className="text-red-500 text-sm">
              {uploadError}
            </div>
          )}

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
            disabled={uploading || !contentFile || !validationResult?.isValid}
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      </Card>

      {/* Installed Items */}
      <Card>
        <Title>Installed Plugins & Themes</Title>
        <div className="mt-6 space-y-4">
          {fetchError ? (
            <Text>Failed to load items</Text>
          ) : !plugins ? (
            <Text>Loading...</Text>
          ) : plugins.length === 0 ? (
            <Text>No plugins or themes installed</Text>
          ) : (
            plugins.map((item) => (
              <Card key={item.id} className="bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Text className="font-medium">{item.name}</Text>
                      <Badge color="gray" size="sm">
                        {item.type}
                      </Badge>
                      <Badge 
                        color={
                          item.status === 'active' ? 'green' :
                          item.status === 'error' ? 'red' : 'yellow'
                        }
                        size="sm"
                      >
                        {item.status}
                      </Badge>
                    </div>
                    <Text className="text-sm text-gray-500 mt-1">
                      {item.description}
                    </Text>
                    <div className="flex items-center space-x-4 mt-2">
                      <Text className="text-sm text-gray-500">
                        Version {item.version}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        {item.category}
                      </Text>
                      <Text className="text-sm text-gray-500">
                        Uploaded on {new Date(item.created_at).toLocaleDateString()}
                      </Text>
                    </div>
                  </div>
                  <button
                    className="text-red-500 hover:text-red-700"
                    onClick={() => handleDelete(item.id, item.type)}
                    disabled={deleting === item.id}
                  >
                    {deleting === item.id ? (
                      <span className="loading">Deleting...</span>
                    ) : (
                      <TrashIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}
