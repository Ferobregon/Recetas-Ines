import { createClient } from '@supabase/supabase-js'

const URL  = 'https://bhhrxotdiwdtltyitnyk.supabase.co'
const KEY  = 'sb_publishable_KhZUeXV_bLy24X6vOcKi8A_ilN_OWsW'

export const supabase = createClient(URL, KEY)

export async function uploadPhoto(file) {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const { error } = await supabase.storage.from('recipe-photos').upload(path, file)
  if (error) throw error
  const { data } = supabase.storage.from('recipe-photos').getPublicUrl(path)
  return data.publicUrl
}

export async function fetchRecipes() {
  const { data, error } = await supabase
    .from('recipes').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data
}

function sanitize(r) {
  const int = (v, d = 0) => (v === '' || v == null) ? d : (Number(v) || d)
  return {
    ...r,
    prep_time:  int(r.prep_time,  null),
    cook_time:  int(r.cook_time,  null),
    servings:   int(r.servings,   2),
    times_made: int(r.times_made, 0),
  }
}

export async function insertRecipe(recipe) {
  const { data, error } = await supabase
    .from('recipes').insert([sanitize(recipe)]).select().single()
  if (error) throw error
  return data
}

export async function updateRecipe(id, updates) {
  const { data, error } = await supabase
    .from('recipes').update({ ...sanitize(updates), updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function deleteRecipe(id) {
  const { error } = await supabase.from('recipes').delete().eq('id', id)
  if (error) throw error
}

export async function updateRating(id, rating) {
  const { data, error } = await supabase
    .from('recipes').update({ rating, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  if (error) throw error
  return data
}

// ── PLANNER ──────────────────────────────────────────────────────────────

export async function fetchOrCreateWeeklyMenu(start_date, end_date, servings = 2) {
  const { data: existing, error: findErr } = await supabase
    .from('weekly_menus').select('*').eq('start_date', start_date).eq('end_date', end_date).maybeSingle()
  if (findErr) throw findErr
  if (existing) return existing
  const { data, error } = await supabase
    .from('weekly_menus').insert([{ start_date, end_date, servings }]).select().single()
  if (error) throw error
  return data
}

export async function fetchMenuSlots(menu_id) {
  const { data, error } = await supabase
    .from('menu_slots').select('*').eq('menu_id', menu_id)
    .order('date').order('slot_order')
  if (error) throw error
  return data || []
}

export async function addMenuSlot(slot) {
  const { data, error } = await supabase
    .from('menu_slots').insert([slot]).select().single()
  if (error) throw error
  return data
}

export async function removeMenuSlot(id) {
  const { error } = await supabase.from('menu_slots').delete().eq('id', id)
  if (error) throw error
}

export async function fetchRecentMealHistory(days = 14) {
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data, error } = await supabase
    .from('meal_history').select('*')
    .gte('date', since.toISOString().split('T')[0])
    .order('date', { ascending: false })
  if (error) throw error
  return data || []
}

export async function fetchPantryItems() {
  const { data, error } = await supabase.from('pantry_items').select('*').order('added_at', { ascending: false })
  if (error) throw error
  return data || []
}

export async function addPantryItem(name) {
  const { data, error } = await supabase.from('pantry_items').insert([{ name: name.trim() }]).select().single()
  if (error) throw error
  return data
}

export async function removePantryItem(id) {
  const { error } = await supabase.from('pantry_items').delete().eq('id', id)
  if (error) throw error
}

export async function clearPantryItems() {
  const { error } = await supabase.from('pantry_items').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (error) throw error
}

export async function updateWeekMenuServings(id, day_servings) {
  const { error } = await supabase
    .from('weekly_menus').update({ day_servings }).eq('id', id)
  if (error) throw error
}

export async function fetchCustomTags() {
  const { data, error } = await supabase.from('custom_tags').select('*').order('created_at')
  if (error) throw error
  return data || []
}
export async function insertCustomTag(tag) {
  const { data, error } = await supabase.from('custom_tags').insert([tag]).select().single()
  if (error) throw error
  return data
}
export async function updateCustomTag(id, updates) {
  const { data, error } = await supabase.from('custom_tags').update(updates).eq('id', id).select().single()
  if (error) throw error
  return data
}
export async function deleteCustomTag(id) {
  const { error } = await supabase.from('custom_tags').delete().eq('id', id)
  if (error) throw error
}
