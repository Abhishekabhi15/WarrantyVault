import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { PageIntro } from '@/components/ui/PageIntro';
import { categories } from '@/data/mockData';
import { api, type Document, type Product } from '@/lib/api';
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDaysRemaining,
  formatFileSize,
  formatWarrantyStatus,
  getWarrantyStatusClass,
  toReadableError,
} from '@/lib/format';

export function ProductDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const productId = Number(id);
  const [product, setProduct] = useState<Product | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageMessage, setPageMessage] = useState<string | null>(
    (location.state as { successMessage?: string } | null)?.successMessage ?? null,
  );
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);
  const [confirmDeleteProduct, setConfirmDeleteProduct] = useState(false);
  const [deletingDocumentId, setDeletingDocumentId] = useState<number | null>(null);
  const [documentType, setDocumentType] = useState<'bill' | 'invoice' | 'receipt' | 'warranty'>('receipt');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    category: '',
    purchase_date: '',
    purchase_price: '',
    retailer: '',
    serial_number: '',
    warranty_duration_months: '',
    notes: '',
  });

  const productFields = useMemo(
    () => [
      ['Brand', product?.brand || 'Not provided'],
      ['Category', product?.category || 'Uncategorized'],
      ['Purchase Date', product ? formatDate(product.purchase_date) : '—'],
      ['Purchase Price', product ? formatCurrency(product.purchase_price) : '—'],
      ['Retailer', product?.retailer || 'Not provided'],
      ['Serial Number', product?.serial_number || 'Not provided'],
      ['Warranty Duration', product ? `${product.warranty_duration_months} months` : '—'],
      ['Warranty Expiry', product ? formatDate(product.warranty_expiry_date) : '—'],
      ['Days Remaining', product ? formatDaysRemaining(product.days_remaining) : '—'],
      ['Created', product ? formatDateTime(product.created_at) : '—'],
      ['Updated', product ? formatDateTime(product.updated_at) : '—'],
    ],
    [product],
  );

  function syncFormState(nextProduct: Product) {
    setFormData({
      name: nextProduct.name,
      brand: nextProduct.brand || '',
      category: nextProduct.category || '',
      purchase_date: nextProduct.purchase_date,
      purchase_price: nextProduct.purchase_price || '',
      retailer: nextProduct.retailer || '',
      serial_number: nextProduct.serial_number || '',
      warranty_duration_months: String(nextProduct.warranty_duration_months),
      notes: nextProduct.notes || '',
    });
  }

  async function loadProductDetails() {
    if (!Number.isFinite(productId)) {
      setError('Invalid product identifier.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [productResponse, documentResponse] = await Promise.all([
        api.getProduct(productId),
        api.listDocuments({ product_id: productId }),
      ]);
      setProduct(productResponse);
      setDocuments(documentResponse);
      syncFormState(productResponse);
    } catch (loadError) {
      setError(toReadableError(loadError, 'Unable to load this product.'));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadProductDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  async function handleEditSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) {
      return;
    }

    if (!formData.name.trim() || !formData.purchase_date || !formData.warranty_duration_months) {
      setError('Please complete the required fields before saving.');
      return;
    }

    const warrantyDuration = Number(formData.warranty_duration_months);
    if (!Number.isInteger(warrantyDuration) || warrantyDuration <= 0) {
      setError('Warranty duration must be a whole number greater than zero.');
      return;
    }

    let purchasePrice: string | null = null;
    if (formData.purchase_price && formData.purchase_price.trim() !== '') {
      const parsedPrice = Number(formData.purchase_price);
      if (isNaN(parsedPrice) || parsedPrice < 0) {
        setError('Purchase price must be a valid positive number.');
        return;
      }
      purchasePrice = parsedPrice.toFixed(2);
    }

    setIsSaving(true);
    setError(null);
    setPageMessage(null);

    try {
      const updatedProduct = await api.updateProduct(product.id, {
        name: formData.name.trim(),
        brand: formData.brand.trim() || null,
        category: formData.category || null,
        purchase_date: formData.purchase_date,
        purchase_price: purchasePrice,
        retailer: formData.retailer.trim() || null,
        serial_number: formData.serial_number.trim() || null,
        warranty_duration_months: warrantyDuration,
        notes: formData.notes.trim() || null,
      });
      setProduct(updatedProduct);
      syncFormState(updatedProduct);
      setIsEditing(false);
      setPageMessage('Product updated successfully.');
    } catch (saveError) {
      setError(toReadableError(saveError, 'Unable to update this product.'));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteProduct() {
    if (!product) {
      return;
    }

    setIsDeletingProduct(true);
    setError(null);
    try {
      await api.deleteProduct(product.id);
      navigate('/products', {
        replace: true,
        state: { successMessage: 'Product deleted successfully.' },
      });
    } catch (deleteError) {
      setError(toReadableError(deleteError, 'Unable to delete this product.'));
    } finally {
      setIsDeletingProduct(false);
      setConfirmDeleteProduct(false);
    }
  }

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedFile || !product) {
      setError('Please choose a file before uploading.');
      return;
    }

    const formElement = event.currentTarget;
    setIsUploading(true);
    setError(null);
    setPageMessage(null);
    try {
      const uploadedDocument = await api.uploadDocument({
        file: selectedFile,
        documentType,
        productId: product.id,
      });
      setDocuments((current) => [uploadedDocument, ...current]);
      formElement.reset();
      setSelectedFile(null);
      setPageMessage('Document uploaded successfully.');
    } catch (uploadError) {
      setError(toReadableError(uploadError, 'Unable to upload this document.'));
    } finally {
      setIsUploading(false);
    }
  }

  async function handleDownload(documentItem: Document) {
    setError(null);
    try {
      const { blob, filename } = await api.downloadDocument(
        documentItem.id,
        documentItem.original_filename,
      );
      const blobUrl = window.URL.createObjectURL(blob);
      const anchor = window.document.createElement('a');
      anchor.href = blobUrl;
      anchor.download = filename;
      window.document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (downloadError) {
      setError(toReadableError(downloadError, 'Unable to download this document.'));
    }
  }

  async function handleDeleteDocument(documentId: number) {
    setDeletingDocumentId(documentId);
    setError(null);
    try {
      await api.deleteDocument(documentId);
      setDocuments((current) => current.filter((documentItem) => documentItem.id !== documentId));
      setPageMessage('Document deleted successfully.');
    } catch (deleteError) {
      setError(toReadableError(deleteError, 'Unable to delete this document.'));
    } finally {
      setDeletingDocumentId(null);
    }
  }

  return (
    <section className="stack-page space-y-8">
      <PageIntro
        eyebrow="Details"
        title={product?.name || 'Product Details'}
        description="Review live warranty details, linked documents, and product metadata from the backend."
      />

      {pageMessage ? (
        <div className="rounded-3xl border border-success-200 bg-success-50 p-5 text-success-700">
          {pageMessage}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-3xl border border-danger-200 bg-danger-50 p-5 text-danger-700">
          <p className="font-semibold">We could not complete that request.</p>
          <p className="mt-2 text-sm">{error}</p>
        </div>
      ) : null}

      {isLoading ? (
        <div className="detail-card">
          <span>Loading</span>
          <strong>Fetching product details...</strong>
          <p>Please wait while WarrantyVault loads the selected product and its documents.</p>
        </div>
      ) : product ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <article className="detail-card">
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <span>Warranty Overview</span>
                  <strong>{product.name}</strong>
                  <p className="mt-2">
                    Product ID #{product.id} · {formatDate(product.purchase_date)} purchase date
                  </p>
                </div>
                <div className="flex flex-col items-start gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-sm font-medium ${getWarrantyStatusClass(product.warranty_status)}`}
                  >
                    {formatWarrantyStatus(product.warranty_status)}
                  </span>
                  <p className="text-sm text-surface-500">{formatDaysRemaining(product.days_remaining)}</p>
                </div>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {productFields.map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
                    <p className="text-sm font-medium text-surface-500">{label}</p>
                    <p className="mt-2 font-semibold text-surface-900">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6 rounded-2xl border border-surface-200 bg-surface-50 p-4">
                <p className="text-sm font-medium text-surface-500">Notes</p>
                <p className="mt-2 text-surface-700">{product.notes || 'No notes added yet.'}</p>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  className="button"
                  onClick={() => {
                    setIsEditing((current) => !current);
                    setPageMessage(null);
                  }}
                >
                  {isEditing ? 'Cancel Edit' : 'Edit Product'}
                </button>
                {!confirmDeleteProduct ? (
                  <button
                    type="button"
                    className="button button-secondary"
                    onClick={() => setConfirmDeleteProduct(true)}
                  >
                    Delete Product
                  </button>
                ) : (
                  <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-danger-50 px-4 py-3 text-sm text-danger-700">
                    <span>Delete this product permanently?</span>
                    <button
                      type="button"
                      className="btn-danger"
                      disabled={isDeletingProduct}
                      onClick={handleDeleteProduct}
                    >
                      {isDeletingProduct ? 'Deleting...' : 'Confirm Delete'}
                    </button>
                    <button
                      type="button"
                      className="button button-secondary"
                      disabled={isDeletingProduct}
                      onClick={() => setConfirmDeleteProduct(false)}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </article>

            <div className="space-y-6">
              <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card">
                <p className="text-kicker">Documents</p>
                <h2 className="mt-2 text-2xl font-semibold text-surface-900">Upload bills and warranties</h2>
                <form className="mt-5 space-y-4" onSubmit={handleUpload}>
                  <label className="grid gap-2 text-sm font-medium text-surface-700">
                    Document Type
                    <select
                      className="input"
                      value={documentType}
                      onChange={(event) =>
                        setDocumentType(
                          event.target.value as 'bill' | 'invoice' | 'receipt' | 'warranty',
                        )
                      }
                    >
                      <option value="receipt">Receipt</option>
                      <option value="invoice">Invoice</option>
                      <option value="bill">Bill</option>
                      <option value="warranty">Warranty</option>
                    </select>
                  </label>
                  <label className="grid gap-2 text-sm font-medium text-surface-700">
                    Choose File
                    <input
                      className="input"
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
                    />
                  </label>
                  <button type="submit" className="button" disabled={isUploading}>
                    {isUploading ? 'Uploading...' : 'Upload Document'}
                  </button>
                </form>
              </section>

              {isEditing ? (
                <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card">
                  <p className="text-kicker">Edit</p>
                  <h2 className="mt-2 text-2xl font-semibold text-surface-900">Update product details</h2>
                  <form className="mt-5 grid gap-4" onSubmit={handleEditSubmit}>
                    <label className="grid gap-2 text-sm font-medium text-surface-700">
                      Product Name
                      <input
                        className="input"
                        value={formData.name}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, name: event.target.value }))
                        }
                        required
                      />
                    </label>
                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="grid gap-2 text-sm font-medium text-surface-700">
                        Brand
                        <input
                          className="input"
                          value={formData.brand}
                          onChange={(event) =>
                            setFormData((current) => ({ ...current, brand: event.target.value }))
                          }
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-surface-700">
                        Category
                        <select
                          className="input"
                          value={formData.category}
                          onChange={(event) =>
                            setFormData((current) => ({ ...current, category: event.target.value }))
                          }
                        >
                          <option value="">Select a category</option>
                          {categories
                            .filter((category) => category !== 'All Categories')
                            .map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                        </select>
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-surface-700">
                        Purchase Date
                        <input
                          className="input"
                          type="date"
                          value={formData.purchase_date}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              purchase_date: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-surface-700">
                        Purchase Price
                        <input
                          className="input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={formData.purchase_price}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              purchase_price: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-surface-700">
                        Retailer
                        <input
                          className="input"
                          value={formData.retailer}
                          onChange={(event) =>
                            setFormData((current) => ({ ...current, retailer: event.target.value }))
                          }
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-surface-700">
                        Serial Number
                        <input
                          className="input"
                          value={formData.serial_number}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              serial_number: event.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="grid gap-2 text-sm font-medium text-surface-700">
                        Warranty Duration
                        <input
                          className="input"
                          type="number"
                          min="1"
                          step="1"
                          value={formData.warranty_duration_months}
                          onChange={(event) =>
                            setFormData((current) => ({
                              ...current,
                              warranty_duration_months: event.target.value,
                            }))
                          }
                          required
                        />
                      </label>
                    </div>
                    <label className="grid gap-2 text-sm font-medium text-surface-700">
                      Notes
                      <textarea
                        className="input min-h-28"
                        value={formData.notes}
                        onChange={(event) =>
                          setFormData((current) => ({ ...current, notes: event.target.value }))
                        }
                      />
                    </label>
                    <button type="submit" className="button" disabled={isSaving}>
                      {isSaving ? 'Saving changes...' : 'Save Changes'}
                    </button>
                  </form>
                </section>
              ) : null}
            </div>
          </div>

          <section className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-kicker">Linked Documents</p>
                <h2 className="mt-2 text-2xl font-semibold text-surface-900">Stored files for this product</h2>
              </div>
              <span className="rounded-full bg-surface-100 px-3 py-1 text-sm text-surface-600">
                {documents.length} file{documents.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {documents.length > 0 ? (
                documents.map((documentItem) => (
                  <article key={documentItem.id} className="flex flex-col gap-4 rounded-2xl border border-surface-200 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-surface-900">
                        {documentItem.original_filename}
                      </h3>
                      <p className="text-sm text-surface-500">
                        {documentItem.document_type} · {documentItem.file_type} ·{' '}
                        {formatFileSize(documentItem.file_size)} · Uploaded {formatDateTime(documentItem.uploaded_at)}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="button button-secondary"
                        onClick={() => handleDownload(documentItem)}
                      >
                        Download
                      </button>
                      <button
                        type="button"
                        className="button button-secondary"
                        disabled={deletingDocumentId === documentItem.id}
                        onClick={() => {
                          const confirmed = window.confirm(
                            `Delete ${documentItem.original_filename}?`,
                          );
                          if (confirmed) {
                            void handleDeleteDocument(documentItem.id);
                          }
                        }}
                      >
                        {deletingDocumentId === documentItem.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4 text-sm text-surface-500">
                  No documents have been uploaded for this product yet.
                </div>
              )}
            </div>
          </section>
        </>
      ) : (
        <article className="detail-card">
          <span>Unavailable</span>
          <strong>Product not found</strong>
          <p>The selected product could not be loaded or you no longer have access to it.</p>
        </article>
      )}
    </section>
  );
}
