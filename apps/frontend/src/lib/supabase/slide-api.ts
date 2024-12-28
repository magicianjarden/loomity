import { supabase } from './client';
import type {
  Presentation,
  Slide,
  SlideElement,
  PresentationAsset,
} from '@/components/editor/slides/slide-types';

// Presentations
export const createPresentation = async (presentation: Partial<Presentation>) => {
  const { data, error } = await supabase
    .from('presentations')
    .insert(presentation)
    .select()
    .single();

  if (error) throw error;
  return data as Presentation;
};

export const getPresentation = async (id: string) => {
  const { data, error } = await supabase
    .from('presentations')
    .select()
    .eq('id', id)
    .single();

  if (error) throw error;
  return data as Presentation;
};

export const updatePresentation = async (id: string, updates: Partial<Presentation>) => {
  const { data, error } = await supabase
    .from('presentations')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Presentation;
};

export const deletePresentation = async (id: string) => {
  const { error } = await supabase
    .from('presentations')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Slides
export const createSlide = async (slide: Partial<Slide>) => {
  const { data, error } = await supabase
    .from('slides')
    .insert(slide)
    .select()
    .single();

  if (error) throw error;
  return data as Slide;
};

export const getSlides = async (presentationId: string) => {
  const { data, error } = await supabase
    .from('slides')
    .select()
    .eq('presentation_id', presentationId)
    .order('order_index');

  if (error) throw error;
  return data as Slide[];
};

export const updateSlide = async (id: string, updates: Partial<Slide>) => {
  const { data, error } = await supabase
    .from('slides')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as Slide;
};

export const deleteSlide = async (id: string) => {
  const { error } = await supabase
    .from('slides')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const reorderSlides = async (presentationId: string, slideIds: string[]) => {
  const updates = slideIds.map((id, index) => ({
    id,
    order_index: index,
  }));

  const { error } = await supabase.from('slides').upsert(updates);

  if (error) throw error;
};

// Slide Elements
export const createElement = async (element: Partial<SlideElement>) => {
  const { data, error } = await supabase
    .from('slide_elements')
    .insert(element)
    .select()
    .single();

  if (error) throw error;
  return data as SlideElement;
};

export const getElements = async (slideId: string) => {
  const { data, error } = await supabase
    .from('slide_elements')
    .select()
    .eq('slide_id', slideId);

  if (error) throw error;
  return data as SlideElement[];
};

export const updateElement = async (id: string, updates: Partial<SlideElement>) => {
  const { data, error } = await supabase
    .from('slide_elements')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as SlideElement;
};

export const deleteElement = async (id: string) => {
  const { error } = await supabase
    .from('slide_elements')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Assets
export const uploadAsset = async (
  presentationId: string,
  file: File,
  type: 'image' | 'video' | 'font'
) => {
  const path = `presentations/${presentationId}/${type}s/${file.name}`;
  
  // Upload file to storage
  const { data: storageData, error: storageError } = await supabase.storage
    .from('assets')
    .upload(path, file);

  if (storageError) throw storageError;

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('assets')
    .getPublicUrl(path);

  // Create asset record
  const asset: Partial<PresentationAsset> = {
    presentationId,
    type,
    name: file.name,
    url: publicUrl,
    metadata: {
      size: file.size,
      type: file.type,
    },
  };

  const { data: assetData, error: assetError } = await supabase
    .from('presentation_assets')
    .insert(asset)
    .select()
    .single();

  if (assetError) throw assetError;
  return assetData as PresentationAsset;
};

export const getAssets = async (presentationId: string) => {
  const { data, error } = await supabase
    .from('presentation_assets')
    .select()
    .eq('presentation_id', presentationId);

  if (error) throw error;
  return data as PresentationAsset[];
};

export const deleteAsset = async (id: string, url: string) => {
  // Delete from storage
  const path = url.split('assets/')[1];
  const { error: storageError } = await supabase.storage
    .from('assets')
    .remove([path]);

  if (storageError) throw storageError;

  // Delete record
  const { error } = await supabase
    .from('presentation_assets')
    .delete()
    .eq('id', id);

  if (error) throw error;
};
