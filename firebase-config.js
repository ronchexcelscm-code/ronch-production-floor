// ===== Ronch Production Floor · settings =====
// Firebase project: ronch-production (connected 30/09/2026)
window.FIREBASE_CONFIG = {
  apiKey: "AIzaSyAF3M6t-LOeDMIwYJlW4AeAD9QtXt6AzIA",
  authDomain: "ronch-production.firebaseapp.com",
  projectId: "ronch-production",
  storageBucket: "ronch-production.firebasestorage.app",
  messagingSenderId: "831587496128",
  appId: "1:831587496128:web:dd84286729f285b453bd25"
};

// Department logins are Firebase users named <department>@<loginDomain>:
//   admin@  sales@ (Client Order)  scm@  store@  production@  dispatch@  rnd@ (R&D)
// The domain does not need to be a real mailbox. If you change it here, create the users with the new domain.
window.APP_SETTINGS = {
  loginDomain: "ronch-floor.app"
};
