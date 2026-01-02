import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate, useParams } from 'react-router-dom'
import { fetchBlogs } from '../../features/blogs/blogSlice'
import api from '../../api/axios'
import { toast } from 'react-toastify'
import ReactQuill, { Quill } from 'react-quill'
import 'react-quill/dist/quill.snow.css'

const Size = Quill.import('formats/size')
Size.whitelist = ['small', 'large', 'huge']
Quill.register(Size, true)

const BlogForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { items, status } = useSelector((state) => state.blogs)
  const blog = items.find((item) => item._id === id)
  const [submitError, setSubmitError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const [selectedAdminPhoto, setSelectedAdminPhoto] = useState(null)
  const [selectedBlogImages, setSelectedBlogImages] = useState([])
  const [faqs, setFaqs] = useState([{ question: '', answer: '' }])
  const [categories, setCategories] = useState([])
  const [subCategories, setSubCategories] = useState([])
  const [newCategory, setNewCategory] = useState('')
  const [newSubCategory, setNewSubCategory] = useState('')
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false)
  const cancerStageOptions = ['ANY', 'IN TREATMENT', 'NEWLY TREATMENT', 'POST TREATMENT']
  const quillModules = {
    toolbar: '#blog-description-toolbar',
  }

  const quillFormats = [
    'size',
    'bold',
    'italic',
    'underline',
    'color',
    'background',
    'list',
    'bullet',
    'indent',
  ]

  const { register, handleSubmit, reset, setValue, watch, control } = useForm({
    defaultValues: {
      title: '',
      description: '',
      category: '',
      subCategory: '',
      cancerStage: 'ANY',
      adminQuotation: '',
      adminName: '',
      adminDesignation: '',
      writtenBy: '',
      metadata: '',
    },
  })

  const selectedCategory = watch('category')
  const selectedSubCategory = watch('subCategory')

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchBlogs())
    }
    if (blog) {
      reset({
        ...blog,
        subCategory: blog.subCategory || '',
        cancerStage: blog.cancerStage || 'ANY',
        adminQuotation: blog.adminStatement?.quotation || '',
        adminName: blog.adminStatement?.name || '',
        adminDesignation: blog.adminStatement?.designation || '',
        metadata: Array.isArray(blog.metadata) ? blog.metadata.join(', ') : blog.metadata || '',
      })
      setFaqs(
        Array.isArray(blog.faqs) && blog.faqs.length
          ? blog.faqs.map((faq) => ({ question: faq.question || '', answer: faq.answer || '' }))
          : [{ question: '', answer: '' }]
      )
    }
  }, [blog, reset, status, dispatch])

  const loadCategories = async (preferredCategory) => {
    setIsLoadingCategories(true)
    try {
      const response = await api.get('/blog-categories')
      const nextCategories = response.data || []
      setCategories(nextCategories)

      const nextCategory =
        preferredCategory || selectedCategory || nextCategories[0]?.name || ''
      if (nextCategory) {
        setValue('category', nextCategory)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load blog categories')
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const loadSubCategories = async (categoryId, preferredSubCategory) => {
    if (!categoryId) {
      setSubCategories([])
      return
    }
    setIsLoadingSubCategories(true)
    try {
      const response = await api.get('/blog-subcategories', {
        params: { categoryId },
      })
      const nextSubCategories = response.data || []
      setSubCategories(nextSubCategories)

      const nextSubCategory =
        preferredSubCategory ||
        selectedSubCategory ||
        nextSubCategories[0]?.name ||
        ''
      if (nextSubCategory) {
        setValue('subCategory', nextSubCategory)
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to load sub-categories')
      setSubCategories([])
    } finally {
      setIsLoadingSubCategories(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const category = categories.find((item) => item.name === selectedCategory)
    if (!category) {
      setSubCategories([])
      setValue('subCategory', '')
      return
    }
    loadSubCategories(category._id)
  }, [categories, selectedCategory, setValue])

  const handleAddCategory = async () => {
    const name = newCategory.trim()
    if (!name) {
      return
    }
    try {
      const response = await api.post('/blog-categories', { name })
      toast.success('Category added')
      setNewCategory('')
      await loadCategories(response.data?.name || name)
      setValue('subCategory', '')
      setSubCategories([])
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add category')
    }
  }

  const handleAddSubCategory = async () => {
    const name = newSubCategory.trim()
    if (!name) {
      return
    }
    const category = categories.find((item) => item.name === selectedCategory)
    if (!category) {
      toast.error('Select a category first')
      return
    }
    try {
      const response = await api.post('/blog-subcategories', {
        name,
        categoryId: category._id,
      })
      toast.success('Sub-category added')
      setNewSubCategory('')
      await loadSubCategories(category._id, response.data?.name || name)
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to add sub-category')
    }
  }

  const onSubmit = async (values) => {
    setSubmitError('')
    if (!id && !selectedFile) {
      setSubmitError('Image is required to create a blog.')
      return
    }
    if (!id && selectedBlogImages.length !== 2) {
      setSubmitError('Exactly two blog images are required to create a blog.')
      return
    }
    if (id && selectedBlogImages.length === 0 && blog?.blogImage?.length !== 2) {
      setSubmitError('Exactly two blog images are required to save this blog.')
      return
    }
    if (id && selectedBlogImages.length > 0 && selectedBlogImages.length !== 2) {
      setSubmitError('Select exactly two blog images.')
      return
    }
    setIsSubmitting(true)

    const formData = new FormData()
    formData.append('title', values.title)
    formData.append('description', values.description)
    formData.append('category', values.category)
    formData.append('subCategory', values.subCategory)
    formData.append('cancerStage', values.cancerStage)
    formData.append('adminQuotation', values.adminQuotation)
    formData.append('adminName', values.adminName)
    formData.append('adminDesignation', values.adminDesignation)
    formData.append('writtenBy', values.writtenBy)
    formData.append('metadata', values.metadata || '')
    formData.append('faqs', JSON.stringify(faqs.filter((faq) => faq.question || faq.answer)))

    if (selectedFile) {
      formData.append('image', selectedFile)
    }
    if (selectedAdminPhoto) {
      formData.append('adminPhoto', selectedAdminPhoto)
    }
    selectedBlogImages.forEach((file) => {
      formData.append('blogImage', file)
    })

    try {
      if (id) {
        await api.put(`/blogs/${id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Blog updated')
      } else {
        await api.post('/blogs', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
        toast.success('Blog created')
      }
      dispatch(fetchBlogs())
      navigate('/blogs')
    } catch (error) {
      setSubmitError(error?.response?.data?.message || 'Failed to save blog')
      toast.error(error?.response?.data?.message || 'Failed to save blog')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="page narrow">
      <div className="page-header">
        <div>
          <p className="eyebrow">Content</p>
          <h2>{id ? 'Edit Blog' : 'Create Blog'}</h2>
          <p className="muted">Use a clear headline and concise summary.</p>
        </div>
      </div>

      <form className="stacked-form" onSubmit={handleSubmit(onSubmit)}>
        <label className="form-field">
          <span>Title</span>
          <input type="text" placeholder="Blog title" {...register('title', { required: true })} />
        </label>

        <label className="form-field">
          <span>Description</span>
          <div id="blog-description-toolbar">
            <select className="ql-size">
              <option value="small">Small</option>
              <option value="" />
              <option value="large">Large</option>
              <option value="huge">Huge</option>
            </select>
            <button className="ql-bold" />
            <button className="ql-italic" />
            <button className="ql-underline" />
            <select className="ql-color" />
            <select className="ql-background" />
            <button className="ql-list" value="ordered" />
            <button className="ql-list" value="bullet" />
            <button className="ql-indent" value="-1" />
            <button className="ql-indent" value="+1" />
            <button className="ql-clean" />
          </div>
          <Controller
            name="description"
            control={control}
            rules={{ required: true }}
            render={({ field }) => (
              <ReactQuill
                theme="snow"
                modules={quillModules}
                formats={quillFormats}
                value={field.value || ''}
                onChange={field.onChange}
              />
            )}
          />
        </label>

        <label className="form-field">
          <span>Category</span>
          <select {...register('category', { required: true })} disabled={isLoadingCategories}>
            {categories.length ? (
              categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))
            ) : (
              <option value="">No categories yet</option>
            )}
          </select>
        </label>

        <div className="form-field">
          <span>Add Category</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="New category name"
              value={newCategory}
              onChange={(event) => setNewCategory(event.target.value)}
            />
            <button className="ghost-button" type="button" onClick={handleAddCategory}>
              Add
            </button>
          </div>
        </div>

        <label className="form-field">
          <span>Sub-category</span>
          <select {...register('subCategory', { required: true })} disabled={isLoadingSubCategories}>
            {subCategories.length ? (
              subCategories.map((sub) => (
                <option key={sub._id} value={sub.name}>
                  {sub.name}
                </option>
              ))
            ) : (
              <option value="">No sub-categories yet</option>
            )}
          </select>
        </label>

        <label className="form-field">
          <span>Cancer Stage</span>
          <select {...register('cancerStage', { required: true })}>
            {cancerStageOptions.map((stage) => (
              <option key={stage} value={stage}>
                {stage}
              </option>
            ))}
          </select>
        </label>

        <div className="form-field">
          <span>Add Sub-category</span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="New sub-category name"
              value={newSubCategory}
              onChange={(event) => setNewSubCategory(event.target.value)}
            />
            <button className="ghost-button" type="button" onClick={handleAddSubCategory}>
              Add
            </button>
          </div>
        </div>

        <label className="form-field">
          <span>Written By</span>
          <input type="text" placeholder="Author name" {...register('writtenBy')} />
        </label>

        <label className="form-field">
          <span>Metadata</span>
          <input type="text" placeholder="comma separated tags" {...register('metadata')} />
        </label>

        <label className="form-field">
          <span>Cover Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
          />
          {blog?.imageUrl ? <p className="form-hint"><span className='text-bold'>Current Image:</span> {blog.imageUrl}</p> : null}
          {selectedFile ? <p className="form-hint"><span className='text-bold'>New Image:</span> {selectedFile.name}</p> : null}
        </label>

        <div className="form-field">
          <span>Blog Images (Select 2)</span>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              const files = Array.from(e.target.files || [])
              if (!files.length) return
              if (files.length !== 2) {
                setSubmitError('Please select exactly two images at a time.')
                e.target.value = ''
                return
              }
              setSubmitError('')
              setSelectedBlogImages(files)
            }}
          />
          {blog?.blogImage?.length ? (
            <p className="form-hint"><span className='text-bold'>Current Images:</span> {blog.blogImage.length}</p>
          ) : null}
          {selectedBlogImages.length ? (
            <p className="form-hint">
              <span className='text-bold'>New Images:</span> {selectedBlogImages.length} ({selectedBlogImages.map((file) => file.name).join(', ')})
            </p>
          ) : null}
          {selectedBlogImages.length ? (
            <button className="ghost-button" type="button" onClick={() => setSelectedBlogImages([])}>
              Clear selected
            </button>
          ) : null}
          <p className="form-hint">Select exactly two images in the picker (Ctrl/Shift-click).</p>
        </div>

        <div className="form-field">
          <span>FAQs</span>
          <div style={{ display: 'grid', gap: '12px' }}>
            {faqs.map((faq, index) => (
              <div key={`faq-${index}`} style={{ display: 'grid', gap: '8px' }}>
                <input
                  type="text"
                  placeholder="Question"
                  value={faq.question}
                  onChange={(event) => {
                    const nextFaqs = [...faqs]
                    nextFaqs[index] = { ...nextFaqs[index], question: event.target.value }
                    setFaqs(nextFaqs)
                  }}
                />
                <textarea
                  rows="3"
                  placeholder="Answer"
                  value={faq.answer}
                  onChange={(event) => {
                    const nextFaqs = [...faqs]
                    nextFaqs[index] = { ...nextFaqs[index], answer: event.target.value }
                    setFaqs(nextFaqs)
                  }}
                />
                {faqs.length > 1 ? (
                  <button
                    className="ghost-button"
                    type="button"
                    onClick={() => setFaqs(faqs.filter((_, faqIndex) => faqIndex !== index))}
                  >
                    Remove FAQ
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <button
            className="ghost-button"
            type="button"
            onClick={() => setFaqs([...faqs, { question: '', answer: '' }])}
          >
            + Add FAQ
          </button>
        </div>

        <label className="form-field">
          <span>Admin Quotation</span>
          <textarea rows="3" placeholder="Admin quotation" {...register('adminQuotation')} />
        </label>

        <label className="form-field">
          <span>Admin Name</span>
          <input type="text" placeholder="Admin name" {...register('adminName')} />
        </label>

        <label className="form-field">
          <span>Admin Designation</span>
          <input type="text" placeholder="Admin designation" {...register('adminDesignation')} />
        </label>

        <label className="form-field">
          <span>Admin Photo</span>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelectedAdminPhoto(e.target.files?.[0] || null)}
          />
          {blog?.adminStatement?.photoUrl ? (
            <p className="form-hint"><span className='text-bold'>Current Photo:</span> {blog.adminStatement.photoUrl}</p>
          ) : null}
          {selectedAdminPhoto ? (
            <p className="form-hint"><span className='text-bold'>New Photo:</span> {selectedAdminPhoto.name}</p>
          ) : null}
        </label>

        {submitError ? <p className="form-error">{submitError}</p> : null}

        <div className="form-actions">
          <button className="ghost-button" type="button" onClick={() => navigate('/blogs')}>
            Cancel
          </button>
          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? <span className="spinner" /> : null}
            {isSubmitting ? 'Saving...' : id ? 'Save changes' : 'Create blog'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default BlogForm
