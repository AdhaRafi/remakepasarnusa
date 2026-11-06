const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'pasarnusa.db');
const db = new Database(dbPath);

const updates = [
  { id: 1, foto: '1779686515_Blouse_Batik_Kancing_Kerah_Sanghay_Wanita.jpg' },
  { id: 2, foto: 'tenun_ikat_sumba.jpg' },
  { id: 3, foto: 'dupa_atsiri.jpg' },
  { id: 4, foto: 'gerabah_kasongan_asli.jpg' },
  { id: 5, foto: 'kopi_ijen.jpg' },
  { id: 6, foto: 'tas_rotan_lombok.jpg' },
  { id: 7, foto: 'batik_pekalongan.jpg' },
];

const stmt = db.prepare('UPDATE produk SET foto_produk = ? WHERE id = ?');
for (const u of updates) {
  stmt.run(u.foto, u.id);
}

console.log('Database updated successfully:', db.prepare('SELECT id, nama_produk, foto_produk FROM produk').all());
