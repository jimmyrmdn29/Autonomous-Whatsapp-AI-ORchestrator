// Map untuk menyimpan obrolan: key = nomorWA, value = array obrolan
const riwayatUser = new Map();

function getMemory(nomorWA) {
  if (!riwayatUser.has(nomorWA)) {
    riwayatUser.set(nomorWA, []);
  }
  return riwayatUser.get(nomorWA);
}

function updateMemory(nomorWA, userMsg, aiMsg) {
  const history = getMemory(nomorWA);
  history.push({ role: 'User', text: userMsg });
  history.push({ role: 'CS', text: aiMsg });

  // Batas k=5 interaksi (1 interaksi = 1 user + 1 bot = 2 entri, total 10 entri)
  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }
}

function clearMemory(nomorWA) {
  riwayatUser.delete(nomorWA);
  console.log(`🧹 Memory dibersihkan untuk nomor: ${nomorWA}`);
}

module.exports = {
  getMemory,
  updateMemory,
  clearMemory,
};