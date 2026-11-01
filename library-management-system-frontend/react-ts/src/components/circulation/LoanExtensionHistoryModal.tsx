import React from 'react';
import { useExtensionHistory } from '../../hooks/useBorrowRecords';
import { formatDate, formatDateTime } from '../../utils/formatUtils';
import type { BorrowResponse } from '../../types';
import { Modal, Button, Card, StatusBadge, Alert } from '../common';

interface LoanExtensionHistoryModalProps {
  isOpen: boolean;
  loan: BorrowResponse | null;
  onClose: () => void;
}

export const LoanExtensionHistoryModal: React.FC<LoanExtensionHistoryModalProps> = ({
  isOpen,
  loan,
  onClose,
}) => {
  const loanId = loan?.id ?? 0;
  const {
    data: extensions = [],
    isLoading,
    isError,
    error,
  } = useExtensionHistory(loanId);

  if (!isOpen || !loan) return null;

  const footer = (
    <div className="flex justify-end w-full">
      <Button variant="secondary" size="sm" onClick={onClose}>
        Close Audit Log
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Loan Extension History"
      description="Official audit trail of due-date extensions granted for this borrow record."
      size="md"
      footer={footer}
    >
      <div className="space-y-4">
        {/* Loan Context Card */}
        <Card className="p-3.5 bg-surface-subtle border border-border space-y-2 text-xs">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted">
              Book Details
            </div>
            <div className="font-semibold text-text text-sm mt-0.5 leading-snug">
              {loan.bookTitle}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-text-secondary pt-2 border-t border-border">
            <div>
              <span className="text-text-muted">Loan ID: </span>
              <span className="font-mono font-semibold text-text tabular-nums">#{loan.id}</span>
            </div>
            <div>
              <span className="text-text-muted">Member: </span>
              <span className="font-semibold text-text">{loan.userName}</span>
            </div>
            <div>
              <span className="text-text-muted">Issue Date: </span>
              <span className="text-text tabular-nums">{formatDate(loan.issueDate)}</span>
            </div>
            <div>
              <span className="text-text-muted">Current Due Date: </span>
              <span className="font-semibold text-text tabular-nums">{formatDate(loan.dueDate)}</span>
            </div>
            <div>
              <span className="text-text-muted">Loan Status: </span>
              <span className="inline-block align-middle ml-1">
                <StatusBadge
                  variant={
                    loan.status === 'OVERDUE'
                      ? 'danger'
                      : loan.status === 'RETURNED'
                      ? 'neutral'
                      : 'success'
                  }
                  size="sm"
                  label={loan.status}
                />
              </span>
            </div>
            <div>
              <span className="text-text-muted">Total Extensions: </span>
              <span className="font-bold text-primary tabular-nums">{extensions.length} / 2</span>
            </div>
          </div>
        </Card>

        {/* Extension Audit Trail Content */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-text flex items-center justify-between">
            <span>Audit Trail Records</span>
            <span className="text-[11px] font-normal text-text-secondary tabular-nums">
              {extensions.length} record{extensions.length === 1 ? '' : 's'} found
            </span>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="space-y-2 py-4">
              <div className="h-16 w-full rounded-control bg-surface-subtle animate-pulse" />
              <div className="h-16 w-full rounded-control bg-surface-subtle animate-pulse" />
            </div>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <Alert
              variant="danger"
              title="Failed to load extension history"
              description={error?.message || 'Please try again.'}
            />
          )}

          {/* Empty State */}
          {!isLoading && !isError && extensions.length === 0 && (
            <div className="rounded-control border border-dashed border-border bg-surface-subtle/50 p-6 text-center text-xs">
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-surface-subtle text-text-muted mb-2">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold text-text">No extensions granted</p>
              <p className="text-text-secondary mt-0.5 text-[11px]">
                This book loan has retained its original due date with zero extensions recorded.
              </p>
            </div>
          )}

          {/* Extensions List */}
          {!isLoading && !isError && extensions.length > 0 && (
            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {extensions.map((ext, idx) => (
                <Card
                  key={ext.id}
                  className="p-3.5 space-y-2 text-xs border border-border shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <StatusBadge
                      variant="info"
                      size="sm"
                      label={`Extension #${idx + 1}`}
                    />
                    <span className="text-[11px] text-text-muted font-mono tabular-nums">
                      Log #{ext.id}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs bg-surface-subtle rounded-control p-2 border border-border">
                    <div>
                      <span className="text-text-muted text-[10px] block uppercase font-medium">Previous Due</span>
                      <span className="font-medium text-text tabular-nums">{formatDate(ext.oldDueDate)}</span>
                    </div>
                    <svg className="h-4 w-4 text-primary shrink-0 mx-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                    <div className="text-right">
                      <span className="text-text-muted text-[10px] block uppercase font-medium">New Due Date</span>
                      <span className="font-bold text-primary tabular-nums">{formatDate(ext.newDueDate)}</span>
                    </div>
                  </div>

                  <div className="space-y-1 text-[11px] text-text-secondary">
                    <div>
                      <span className="text-text-muted">Reason: </span>
                      <span className="italic text-text">"{ext.reason}"</span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-border text-text-muted">
                      <span>
                        Extended by: <strong className="text-text font-medium">{ext.extendedByUserName}</strong>
                      </span>
                      <span className="tabular-nums">{formatDateTime(ext.createdAt)}</span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default LoanExtensionHistoryModal;
