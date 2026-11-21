// FILE SEMENTARA.  Akan dihapus apabila integrasi TiDB telah selesai.

const KECAMATAN = [
  'MEDAN AMPLAS', 'MEDAN AREA', 'MEDAN BARAT', 'MEDAN BARU', 'MEDAN BELAWAN', 'MEDAN DELI', 'MEDAN DENAI',
  'MEDAN HELVETIA', 'MEDAN JOHOR', 'MEDAN KOTA', 'MEDAN LABUHAN', 'MEDAN MAIMUN', 'MEDAN MARELAN',
  'MEDAN PERJUANGAN', 'MEDAN PETISAH', 'MEDAN POLONIA', 'MEDAN SELAYANG', 'MEDAN SUNGGAL',
  'MEDAN TEMBUNG', 'MEDAN TIMUR', 'MEDAN TUNTUNGAN',
];

const acak = (seed: number) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// 21 kecamatan x 3 kelurahan x 4 lingkungan = 252 kepala lingkungan
export const dataKeplingDummy = KECAMATAN.flatMap((kec, i) =>
  [1, 2, 3].flatMap((k) =>
    [1, 2, 3, 4].map((l) => {
      const seed = i * 100 + k * 10 + l;
      const tkRekap = Math.floor(acak(seed) * 60);
      const tkForm = Math.floor(acak(seed + 0.5) * 6);
      return {
        id: `${kec}-KELURAHAN ${String.fromCharCode(65 + i)}${k}-${l}`,
        kecamatan: kec,
        kelurahan: `KELURAHAN ${String.fromCharCode(65 + i)}${k}`,
        lingkungan: String(l),
        target: 50,
        tk_aktif: tkRekap + tkForm,
        tk_form: tkForm,
        tk_rekap: tkRekap,
      };
    })
  )
);

// Daftar peserta 
export const rekapDummy = dataKeplingDummy.flatMap((row) => {
  const wilayah = `${row.kecamatan}-${row.kelurahan}-${row.lingkungan}`;
  const aktif = Array.from({ length: row.tk_rekap }, (_, n) => ({
    'Wilayah': wilayah,
    'NIK': '1271' + String(Math.floor(acak(row.tk_rekap * 31 + n) * 1e12)).padStart(12, '0'),
    'Nama TK': `PESERTA CONTOH ${n + 1}`,
    'Status TK': 'AKTIF',
  }));
  const tidakAktif = { 'Wilayah': wilayah, 'NIK': '1271000000000000', 'Nama TK': 'PESERTA NON AKTIF', 'Status TK': 'TIDAK AKTIF' };
  return [...aktif, tidakAktif];
});
