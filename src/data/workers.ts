import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

// CRUD operations for workers using Supabase
export const getAllWorkers = async (): Promise<Tables<'workers'>[]> => {
  const { data, error } = await supabase.from('workers').select('*');
  if (error) throw error;
  return data || [];
};

export const getFavoriteWorkers = async (): Promise<Tables<'workers'>[]> => {
  const { data, error } = await supabase.from('workers').select('*').eq('favorite', true);
  if (error) throw error;
  return data || [];
};

export const getWorkersByCategory = async (categoryId: string): Promise<Tables<'workers'>[]> => {
  const { data, error } = await supabase.from('workers').select('*').eq('category', categoryId);
  if (error) throw error;
  return data || [];
};

export const getWorkerById = async (workerId: string): Promise<Tables<'workers'> | null> => {
  const { data, error } = await supabase.from('workers').select('*').eq('id', workerId).single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
};

export const addWorker = async (worker: TablesInsert<'workers'>): Promise<Tables<'workers'>> => {
  const { data, error } = await supabase.from('workers').insert(worker).select().single();
  if (error) throw error;
  return data;
};

export const updateWorker = async (workerId: string, updates: Partial<Tables<'workers'>>): Promise<Tables<'workers'>> => {
  const { data, error } = await supabase.from('workers').update(updates).eq('id', workerId).select().single();
  if (error) throw error;
  return data;
};

export const deleteWorker = async (workerId: string): Promise<void> => {
  const { error } = await supabase
    .from('workers')
    .delete()
    .eq('id', workerId);
  
  if (error) throw error;
};

