const DB_ID = "1NZn5IheT7dz5OK8ifO2XOxWRnVH6bPlLdDT3WM5h5ew";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('Chipmunk Chat 2.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

// SECURE HASHING: One-way SHA-256
function getHash(input) {
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input);
  return digest.map(byte => ('0' + (byte & 0xFF).toString(16)).slice(-2)).join('');
}

function pushMessages(username, password, message) {
  const doc = DocumentApp.openById(DB_ID);
  const email = Session.getActiveUser().getEmail(); // Automatic Identity Trace
  
  // SANITIZATION: Removes any HTML/Script tags to prevent hacking
  const cleanMsg = message.replace(/<[^>]*>?/gm, '').substring(0, 500);
  const cleanUser = username.replace(/<[^>]*>?/gm, '').substring(0, 20);
  
  const dbText = doc.getBody().getText().trim();
  const messages = dbText ? JSON.parse(dbText) : [];
  
  messages.push({
    "u": cleanUser,
    "e": email,          
    "h": getHash(password), 
    "m": cleanMsg,
    "t": new Date().toLocaleTimeString()
  });
  
  doc.getBody().setText(JSON.stringify(messages));
  return messages.length;
}

function importMessages(lastViewedIndex) {
  const doc = DocumentApp.openById(DB_ID);
  const dbText = doc.getBody().getText().trim();
  const messages = dbText ? JSON.parse(dbText) : [];
  
  return messages.slice(lastViewedIndex + 1);
}

function WIPE_DATABASE_COMPLETELY() {
  DocumentApp.openById(DB_ID).getBody().setText("[]");
}
