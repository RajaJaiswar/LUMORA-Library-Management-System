import React, { useState, useRef, useCallback } from 'react';
import type { BookImportResponse } from '../../types';
import { useImportBooks } from '../../hooks/useBookMutations';
import { getErrorMessage } from '../../utils/errorUtils';
import { Modal, Button, Alert, Card } from '../common';

interface BookImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitImport?: (file: File) => Promise<BookImportResponse>;
  isPending?: boolean;
  onImportSuccess?: (result: BookImportResponse) => void;
}

export const BookImportModal: React.FC<BookImportModalProps> = ({
  isOpen,
  onClose,
  onSubmitImport,
  isPending: externalIsPending,
  onImportSuccess,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const defaultMutation = useImportBooks();

  const isPending = externalIsPending ?? defaultMutation.isPending;

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<BookImportResponse | null>(null);

  const handleClose = useCallback(() => {
    if (isPending) return;
    setSelectedFile(null);
    setIsDragOver(false);
    setValidationError(null);
    setServerError(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  }, [isPending, onClose]);

  const processFile = (file: File) => {
    setServerError(null);
    setValidationError(null);

    if (!file.name.toLowerCase().endsWith('.csv')) {
      setValidationError('Please select a valid CSV file (.csv format).');
      setSelectedFile(null);
      return;
    }

    if (file.size === 0) {
      setValidationError('The selected CSV file is empty (0 bytes).');
      setSelectedFile(null);
      return;
    }

    setSelectedFile(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isPending) {
      setIsDragOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (isPending) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    const csvContent =
      'title,author,isbn,category,quantity\r\n' +
      'Clean Architecture,Robert C. Martin,978-0134494166,Programming,5\r\n' +
      'Designing Data-Intensive Applications,Martin Kleppmann,978-1449373320,Database,3\r\n' +
      'Site Reliability Engineering,Betsy Beyer,978-1491929124,DevOps,2\r\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'book_import_template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile) {
      setValidationError('Please choose a CSV file to upload.');
      return;
    }

    setServerError(null);

    try {
      let result: BookImportResponse;
      if (onSubmitImport) {
        result = await onSubmitImport(selectedFile);
      } else {
        result = await defaultMutation.mutateAsync(selectedFile);
      }
      setImportResult(result);
      if (onImportSuccess) {
        onImportSuccess(result);
      }
    } catch (err: unknown) {
      const fallback =
        'Failed to import CSV file. Please verify CSV formatting, header names, and network connectivity.';
      setServerError(getErrorMessage(err, fallback));
    }
  };

  const handleResetForAnotherImport = () => {
    setSelectedFile(null);
    setImportResult(null);
    setValidationError(null);
    setServerError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={importResult ? 'CSV Import Summary' : 'Import Books from CSV'}
      description={
        importResult
          ? 'Review the execution results and error report below.'
          : 'Bulk upload book titles, authors, categories, and inventory copies.'
      }
      size="lg"
      preventClose={isPending}
      footer={
        !importResult ? (
          <div className="flex items-center justify-end space-x-2.5">
            <Button
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleSubmit}
              disabled={!selectedFile}
              isLoading={isPending}
            >
              Upload & Import
            </Button>
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <Button
              type="button"
              variant="secondary"
              onClick={handleResetForAnotherImport}
              leftIcon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              }
            >
              Import Another File
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleClose}
            >
              Done
            </Button>
          </div>
        )
      }
    >
      <div className="space-y-4">
        {/* Server Error Alert Banner */}
        {serverError && (
          <Alert
            variant="danger"
            title="Import Request Failed"
            onClose={() => setServerError(null)}
          >
            {serverError}
          </Alert>
        )}

        {/* Modal Body: Two Modes (Upload Form vs Results View) */}
        {!importResult ? (
          <div className="space-y-4">
            {/* Guidance & Template Download Card */}
            <Card variant="subtle" className="p-3.5 space-y-2 text-xs text-slate-600">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">CSV Header Requirements</span>
                <button
                  type="button"
                  onClick={handleDownloadTemplate}
                  disabled={isPending}
                  className="inline-flex items-center space-x-1 font-semibold text-primary hover:text-primary-hover disabled:opacity-50 transition-colors"
                >
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                    />
                  </svg>
                  <span>Download Sample Template</span>
                </button>
              </div>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                The CSV file must contain the following header row in lowercase:
              </p>
              <code className="block rounded bg-white px-2.5 py-1.5 font-mono text-[11px] text-slate-800 border border-slate-200">
                title,author,isbn,category,quantity
              </code>
              <ul className="list-disc pl-4 text-[11px] text-slate-500 space-y-0.5">
                <li><strong className="text-slate-700">title, isbn, category:</strong> Required, non-blank strings.</li>
                <li><strong className="text-slate-700">author:</strong> Optional (may be blank).</li>
                <li><strong className="text-slate-700">quantity:</strong> Required positive integer (≥ 1).</li>
                <li>
                  <strong className="text-slate-700">Existing ISBNs:</strong> Update title, author, and category. Existing inventory copy counts are protected and preserved.
                </li>
              </ul>
            </Card>

            {/* Drag and Drop Upload Area */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                disabled={isPending}
                className="hidden"
                id="csv-file-upload-input"
              />

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !isPending && fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition ${
                  isDragOver
                    ? 'border-primary bg-primary-soft/50'
                    : 'border-slate-300 bg-slate-50/40 hover:border-primary-light hover:bg-slate-50'
                } ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-soft text-primary mb-2.5">
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                    />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-slate-800">
                  Click to browse or drag and drop your CSV file here
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  Accepts .csv files up to 10 MB
                </p>
              </div>

              {validationError && (
                <p className="mt-1.5 text-xs text-rose-600 font-medium">{validationError}</p>
              )}
            </div>

            {/* Selected File Details Card */}
            {selectedFile && (
              <div className="flex items-center justify-between rounded-lg border border-primary-light bg-primary-soft/40 p-3 text-xs">
                <div className="flex items-center space-x-2.5 overflow-hidden">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-white font-bold text-[10px]">
                    CSV
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-900 truncate">{selectedFile.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  disabled={isPending}
                  className="ml-2 shrink-0 rounded p-1 text-slate-400 hover:text-rose-600 transition disabled:opacity-50"
                  title="Remove file"
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Results View */
          <div className="space-y-4">
            {/* Outcome Status Banner */}
            {importResult.failed === 0 ? (
              <Alert
                variant="success"
                title="Import Completed Successfully"
              >
                All {importResult.totalRows} row(s) were parsed and saved to the book catalog.
              </Alert>
            ) : importResult.created > 0 || importResult.updated > 0 ? (
              <Alert
                variant="warning"
                title="Partial Import Completed"
              >
                {importResult.created + importResult.updated} book(s) were successfully processed, but {importResult.failed} row(s) encountered validation errors and were skipped.
              </Alert>
            ) : (
              <Alert
                variant="danger"
                title="All Rows Failed Validation"
              >
                None of the {importResult.totalRows} row(s) could be imported. Please review the errors below and correct your CSV file.
              </Alert>
            )}

            {/* Statistics Metric Tiles */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Rows</p>
                <p className="mt-1 text-lg font-bold text-slate-800">{importResult.totalRows}</p>
              </div>
              <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-2.5 text-center">
                <p className="text-[10px] font-semibold text-emerald-700 uppercase tracking-wider">Created</p>
                <p className="mt-1 text-lg font-bold text-emerald-800">{importResult.created}</p>
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50/60 p-2.5 text-center">
                <p className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider">Updated</p>
                <p className="mt-1 text-lg font-bold text-blue-800">{importResult.updated}</p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-center">
                <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Unchanged</p>
                <p className="mt-1 text-lg font-bold text-slate-700">{importResult.unchanged}</p>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-lg border border-rose-200 bg-rose-50/60 p-2.5 text-center">
                <p className="text-[10px] font-semibold text-rose-700 uppercase tracking-wider">Failed</p>
                <p className="mt-1 text-lg font-bold text-rose-800">{importResult.failed}</p>
              </div>
            </div>

            {/* Row-Level Errors Table */}
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-800">
                    Row Errors ({importResult.errors.length})
                  </span>
                  <span className="text-[11px] text-slate-400">
                    Numbers correspond to line in CSV file
                  </span>
                </div>
                <div className="max-h-48 overflow-y-auto rounded-lg border border-slate-200">
                  <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                    <thead className="bg-slate-50 sticky top-0">
                      <tr>
                        <th scope="col" className="px-3 py-2 font-semibold text-slate-700 w-20">
                          Row #
                        </th>
                        <th scope="col" className="px-3 py-2 font-semibold text-slate-700">
                          Reason
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {importResult.errors.map((err, idx) => {
                        const rowNum = err.row ?? err.rowNumber ?? idx + 1;
                        const message = err.message ?? err.errorMessage ?? 'Unknown error';
                        return (
                          <tr key={`${rowNum}-${idx}`} className="hover:bg-rose-50/30">
                            <td className="whitespace-nowrap px-3 py-1.5 font-mono text-[11px] font-semibold text-rose-600">
                              Row {rowNum}
                            </td>
                            <td className="px-3 py-1.5 text-slate-600 text-xs">
                              {message}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Stock Preservation Notice */}
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700">Stock Preservation: </span>
              For existing ISBNs, catalogue metadata was synchronized, while shelf inventory and borrowed copy counts were left untouched.
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BookImportModal;
