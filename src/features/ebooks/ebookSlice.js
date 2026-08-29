import { createAction, createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { upload } from '@vercel/blob/client'
import api from '../../api/axios'

const initialState = {
  items: [],
  status: 'idle',
  error: null,
  uploadProgress: null,
}

const uploadProgressChanged = createAction('ebooks/uploadProgressChanged')
const uploadProgressCleared = createAction('ebooks/uploadProgressCleared')
const MULTIPART_UPLOAD_THRESHOLD = 100 * 1024 * 1024

const getAbsoluteApiUrl = (path) => {
  const baseUrl = String(api.defaults.baseURL || '/api').replace(/\/+$/, '')
  const url = `${baseUrl}/${path.replace(/^\/+/, '')}`
  return new URL(url, window.location.origin).toString()
}

const getAuthToken = (getState) => {
  const stateToken = getState()?.auth?.token
  if (stateToken) return stateToken
  return localStorage.getItem('authToken')
}

const createBlobPathname = (filename) => {
  const safeBaseName = filename
    .normalize('NFKD')
    .replace(/\.pdf$/i, '')
    .replace(/[^a-zA-Z0-9._-]+/g, '-')
    .replace(/\.{2,}/g, '.')
    .replace(/^[.-]+|[.-]+$/g, '') || 'ebook'
  const uploadId = crypto.randomUUID()
  const maxBaseNameLength = 180 - uploadId.length - '-.pdf'.length
  return `savemedha/ebooks/pdfs/${uploadId}-${safeBaseName.slice(0, maxBaseNameLength)}.pdf`
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
  if (error?.name === 'AbortError' || error?.code === 'ERR_CANCELED') {
    return 'Upload cancelled.'
  }
  if (typeof error?.message === 'string' && error.message.trim()) {
    if (error.message.includes('retrieve the client token')) {
      return 'The PDF upload could not be authorized. Please retry or sign in again.'
    }
    return error.message
  }
  return fallback
}

const uploadAssetToCloudinary = async (file, kind, signal) => {
  const { data: uploadConfig } = await api.post('/ebooks/upload-signature', { kind }, { signal })
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
    signal,
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

const uploadPdfToBlob = async (file, token, signal, onUploadProgress) => {
  if (!token) throw new Error('Your admin session has expired. Please sign in again.')

  const blob = await upload(createBlobPathname(file.name), file, {
    access: 'public',
    contentType: 'application/pdf',
    multipart: file.size > MULTIPART_UPLOAD_THRESHOLD,
    handleUploadUrl: getAbsoluteApiUrl('/ebooks/blob-upload'),
    headers: { Authorization: `Bearer ${token}` },
    abortSignal: signal,
    onUploadProgress,
  })

  if (!blob?.url || !blob?.downloadUrl || !blob?.pathname || !blob?.etag) {
    throw new Error('Vercel Blob returned an incomplete PDF upload response.')
  }

  return {
    ...blob,
    provider: 'vercel-blob',
    size: file.size,
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

const uploadEbookAssets = async (files, { token, signal, onPdfProgress }) => {
  const requests = files
    .filter(({ file }) => Boolean(file))
    .map(async ({ file, kind }) => ({
      asset: kind === 'pdf'
        ? await uploadPdfToBlob(file, token, signal, onPdfProgress)
        : await uploadAssetToCloudinary(file, kind, signal),
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

const canSafelyCleanupAfterMetadataError = (error) => {
  const status = error?.response?.status
  return Number.isInteger(status) && status >= 400 && status < 500
}

export const fetchEbooks = createAsyncThunk('ebooks/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await api.get('/ebooks')
    return response.data
  } catch (error) {
    return rejectWithValue(error?.response?.data?.message || 'Failed to load ebooks')
  }
})

export const createEbook = createAsyncThunk('ebooks/create', async (payload, thunkApi) => {
  const { dispatch, getState, rejectWithValue, signal } = thunkApi
  let uploaded = []
  let metadataRequestStarted = false
  try {
    const { pdfFile, imageFile, ...ebook } = payload
    dispatch(uploadProgressChanged({ loaded: 0, total: pdfFile.size, percentage: 0, stage: 'preparing' }))
    uploaded = await uploadEbookAssets([
      { file: pdfFile, kind: 'pdf' },
      { file: imageFile, kind: 'image' },
    ], {
      token: getAuthToken(getState),
      signal,
      onPdfProgress: (progress) => dispatch(uploadProgressChanged({ ...progress, stage: 'uploading' })),
    })
    const pdfAsset = uploaded.find(({ kind }) => kind === 'pdf')?.asset
    const imageAsset = uploaded.find(({ kind }) => kind === 'image')?.asset
    dispatch(uploadProgressChanged({
      loaded: pdfFile.size,
      total: pdfFile.size,
      percentage: 100,
      stage: 'saving',
    }))
    metadataRequestStarted = true
    const response = await api.post('/ebooks', { ...ebook, pdfAsset, imageAsset }, { signal })
    return response.data
  } catch (error) {
    if (uploaded.length && (!metadataRequestStarted || canSafelyCleanupAfterMetadataError(error))) {
      await cleanupUploadedAssets(uploaded)
    }
    return rejectWithValue(getErrorMessage(error, 'Failed to create ebook'))
  } finally {
    dispatch(uploadProgressCleared())
  }
})

export const updateEbook = createAsyncThunk(
  'ebooks/update',
  async ({ id, payload }, thunkApi) => {
    const { dispatch, getState, rejectWithValue, signal } = thunkApi
    let uploaded = []
    let metadataRequestStarted = false
    try {
      const { pdfFile, imageFile, ...ebook } = payload
      if (pdfFile) {
        dispatch(uploadProgressChanged({ loaded: 0, total: pdfFile.size, percentage: 0, stage: 'preparing' }))
      }
      uploaded = await uploadEbookAssets([
        { file: pdfFile, kind: 'pdf' },
        { file: imageFile, kind: 'image' },
      ], {
        token: getAuthToken(getState),
        signal,
        onPdfProgress: (progress) => dispatch(uploadProgressChanged({ ...progress, stage: 'uploading' })),
      })
      const pdfAsset = uploaded.find(({ kind }) => kind === 'pdf')?.asset
      const imageAsset = uploaded.find(({ kind }) => kind === 'image')?.asset
      if (pdfFile) {
        dispatch(uploadProgressChanged({
          loaded: pdfFile.size,
          total: pdfFile.size,
          percentage: 100,
          stage: 'saving',
        }))
      }
      metadataRequestStarted = true
      const response = await api.put(`/ebooks/${id}`, {
        ...ebook,
        ...(pdfAsset ? { pdfAsset } : {}),
        ...(imageAsset ? { imageAsset } : {}),
      }, { signal })
      return response.data
    } catch (error) {
      if (uploaded.length && (!metadataRequestStarted || canSafelyCleanupAfterMetadataError(error))) {
        await cleanupUploadedAssets(uploaded)
      }
      return rejectWithValue(getErrorMessage(error, 'Failed to update ebook'))
    } finally {
      dispatch(uploadProgressCleared())
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
      .addCase(uploadProgressChanged, (state, action) => {
        state.uploadProgress = action.payload
      })
      .addCase(uploadProgressCleared, (state) => {
        state.uploadProgress = null
      })
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
