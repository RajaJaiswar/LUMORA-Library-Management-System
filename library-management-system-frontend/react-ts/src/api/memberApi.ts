/**
 * Legacy member API client module.
 * Re-exports member circulation queries from the canonical circulation API modules
 * to preserve backward compatibility with existing dashboard hooks.
 */

export { getMyBorrowRecords } from './borrowApi';
export { getMyBorrowRequests } from './borrowRequestApi';
export { getMyReturnRequests } from './returnRequestApi';
