import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
}

const getErrorMessage = (error, fallback) => {
  const responseData = error?.response?.data

  if (typeof responseData?.message === 'string' && responseData.message.trim()) {
    return responseData.message
  }
  if (typeof responseData === 'string' && responseData.trim()) {
    return responseData.trim()
  }
  if (error?.code === 'ECONNABORTED') {
    return 'The request timed out. Please try again.'
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    return error.message
  }
  return fallback
}

const uploadAssetToCloudinary = async (file, kind) => {
  const { data: uploadConfig } = await api.post('/ebooks/upload-signature', { kind })
  const uploadData = new FormData()

  uploadData.append('file', file)
  uploadData.append('api_key', uploadConfig.apiKey)
  uploadData.append('signature', uploadConfig.signature)
  Object.entries(uploadConfig.uploadParams).forEach(([key, value]) => {
    uploadData.append(key, String(value))
  })

  const response = await fetch(uploadConfig.uploadUrl, {
    method: 'POST',
    body: uploadData,
  })
  const result = await response.json().catch(() => null)

  if (!response.ok) {
    throw new Error(result?.error?.message || `Failed to upload ${kind === 'pdf' ? 'PDF' : 'banner image'}`)
  }

  if (!result?.public_id || !result?.version || !result?.signature) {
    throw new Error('Cloud storage returned an incomplete upload response')
  }

  return {
    publicId: result.public_id,
    version: result.version,
    signature: result.signature,
    resourceType: result.resource_type,
    format: result.format,
  }
}

const cleanupUploadedAssets = async (assets) => {
  if (!assets.length) return
  try {
    await api.post('/ebooks/upload-cleanup', { assets })
  } catch {
    // The original upload/save error is more useful to the admin than cleanup failure.
  }
}

const uploadEbookAssets = async (files) => {
  const requests = files
    .filter(({ file }) => Boolean(file))
    .map(async ({ file, kind }) => ({
      asset: await uploadAssetToCloudinary(file, kind),
      kind,
    }))
  const outcomes = await Promise.allSettled(requests)
  const uploaded = outcomes
    .filter((outcome) => outcome.status === 'fulfilled')
    .map((outcome) => outcome.value)
  const failed = outcomes.find((outcome) => outcome.status === 'rejected')

  if (failed) {
    await cleanupUploadedAssets(uploaded)
    throw failed.reason
  }

  return uploaded
}

export const fetchEbooks = createAsyncThunk('ebooks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/ebooks')
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load ebooks')
  }
})

export const createEbook = createAsyncThunk('ebooks/create', async (payload, { rejectWithValue }) => {
  let uploaded = []
  try {
    const { pdfFile, imageFile, ...ebook } = payload
    uploaded = await uploadEbookAssets([
      { file: pdfFile, kind: 'pdf' },
      { file: imageFile, kind: 'image' },
    ])
    const pdfAsset = uploaded.find(({ kind }) => kind === 'pdf')?.asset
    const imageAsset = uploaded.find(({ kind }) => kind === 'image')?.asset
    const response = await api.post('/ebooks', { ...ebook, pdfAsset, imageAsset })
    return response.data
  } catch (error) {
    if (uploaded.length && error?.response) await cleanupUploadedAssets(uploaded)
    return rejectWithValue(getErrorMessage(error, 'Failed to create ebook'))
  }
})

export const updateEbook = createAsyncThunk(
  'ebooks/update',
  async ({ id, payload }, { rejectWithValue }) => {
    let uploaded = []
    try {
      const { pdfFile, imageFile, ...ebook } = payload
      uploaded = await uploadEbookAssets([
        { file: pdfFile, kind: 'pdf' },
        { file: imageFile, kind: 'image' },
      ])
      const pdfAsset = uploaded.find(({ kind }) => kind === 'pdf')?.asset
      const imageAsset = uploaded.find(({ kind }) => kind === 'image')?.asset
      const response = await api.put(`/ebooks/${id}`, {
        ...ebook,
        ...(pdfAsset ? { pdfAsset } : {}),
        ...(imageAsset ? { imageAsset } : {}),
      })
      return response.data
    } catch (error) {
      if (uploaded.length && error?.response) await cleanupUploadedAssets(uploaded)
      return rejectWithValue(getErrorMessage(error, 'Failed to update ebook'))
    }
  }
)

export const deleteEbook = createAsyncThunk('ebooks/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/ebooks/${id}`)
    return id
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to delete ebook')
  }
})

const ebookSlice = createSlice({
  name: 'ebooks',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchEbooks.pending, (state) => {
        state.status = 'loading'
        state.error = null
      })
      .addCase(fetchEbooks.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.items = action.payload
      })
      .addCase(fetchEbooks.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload || 'Failed to load ebooks'
      })
      .addCase(createEbook.fulfilled, (state, action) => {
        state.items.unshift(action.payload)
      })
      .addCase(updateEbook.fulfilled, (state, action) => {
        const idx = state.items.findIndex((b) => b._id === action.payload._id)
        if (idx !== -1) state.items[idx] = action.payload
      })
      .addCase(deleteEbook.fulfilled, (state, action) => {
        state.items = state.items.filter((b) => b._id !== action.payload)
      })
  },
})

export default ebookSlice.reducer
