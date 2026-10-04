// Brings the users/otpcodes indexes in line with the email-login schemas, once per server process.
// Older versions had a non-sparse unique `phone_1` index on both collections; email accounts have no
// phone yet, so that index would reject every account after the first. syncIndexes() drops indexes
// the schema no longer defines (or defines differently) and creates the new ones.
import User from '@/models/User';
import OtpCode from '@/models/OtpCode';

let synced = null;

export function ensureAuthIndexes() {
  synced ??= Promise.all([User.syncIndexes(), OtpCode.syncIndexes()]).catch((error) => {
    synced = null; // try again on the next request
    console.error('Auth index sync failed:', error);
  });
  return synced;
}
