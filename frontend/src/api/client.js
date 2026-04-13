import axios from 'axios'

const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE_URL || '', timeout: 120_000 })

export async function personalizePage({ landingPageUrl, adImageUrl, adImageFile }) {
  const form = new FormData()
  form.append('landing_page_url', landingPageUrl)
  if (adImageUrl)  form.append('ad_image_url',  adImageUrl)
  if (adImageFile) form.append('ad_image_file', adImageFile)
  const res = await api.post('/api/personalize', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}

export async function analyzeAd({ adImageUrl, adImageFile }) {
  const form = new FormData()
  if (adImageUrl)  form.append('ad_image_url',  adImageUrl)
  if (adImageFile) form.append('ad_image_file', adImageFile)
  const res = await api.post('/api/analyze-ad', form, { headers: { 'Content-Type': 'multipart/form-data' } })
  return res.data
}