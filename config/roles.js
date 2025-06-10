const ROLES = {
  SUPER_ADMIN: 'super_admin',
  ADMIN: 'admin',
  RMS: 'rms',
  POC: 'poc',
  BACK_OFFICE: 'back_office',
  IT_TEAM: 'it_team',
  TL: 'tl',
  MEMBER: 'member'
};

const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 9,
  [ROLES.ADMIN]: 8,
  [ROLES.RMS]: 7,
  [ROLES.POC]: 6,
  [ROLES.BACK_OFFICE]: 5,
  [ROLES.IT_TEAM]: 4,
  [ROLES.TL]: 3,
  [ROLES.MEMBER]: 1
};

const getHigherAuthorities = (userRole) => {
  const userLevel = ROLE_HIERARCHY[userRole];
  return Object.keys(ROLE_HIERARCHY).filter(role => 
    ROLE_HIERARCHY[role] > userLevel
  );
};

module.exports = {
  ROLES,
  ROLE_HIERARCHY,
  getHigherAuthorities
};