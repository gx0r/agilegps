import { createSelector } from 'reselect';

const usersByID = state => state.usersByID;
const orgsByID = state => state.orgsByID;
const isViewingOrgUsers = state => state.subview === 'ORG' && state.view === 'USER' && state.viewID;
const orgID = state => state.viewID;

// all users if admin or org-users if viewing an org
export const getRelevantUsers = createSelector(
  [usersByID, orgsByID, isViewingOrgUsers, orgID],
  (usersByID, orgsByID, isViewingOrgUsers, orgID) => {
    if (isViewingOrgUsers) {
      const filteredUsersByID = {};
      Object.keys(usersByID).forEach(uid => {
        const user = usersByID[uid];
        if (user.orgid === orgID) {
          filteredUsersByID[uid] = usersByID[uid];
        }
      });
      return filteredUsersByID;
    } else {
      return usersByID;
    }
  }
)
