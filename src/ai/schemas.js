const { StructuredOutputParser } = require('@langchain/core/output_parsers');
const { z } = require('zod');

const outputParser = StructuredOutputParser.fromZodSchema(
  z.discriminatedUnion('tipe_pesan', [
    z.object({
      tipe_pesan: z.literal('informasi'),
      balasan_ke_user: z.string().describe('Jawaban ramah untuk pertanyaan seputar harga, paket, atau info RT/RW Net'),
    }),
    z.object({
      tipe_pesan: z.literal('perbaikan'),
      nama: z.string().describe('Nama lengkap pelanggan'),
      alamat: z.string().describe('Alamat atau nomor rumah pelanggan'),
      kategori_gangguan: z.string().describe('Detail masalah (misal: LOS merah, koneksi lemot, kabel putus)'),
      jadwal: z.string().describe('Waktu yang diminta pelanggan untuk kunjungan teknisi'),
    }),
    z.object({
      tipe_pesan: z.literal('pemasangan_baru'),
      nama: z.string().describe('Nama calon pelanggan'),
      alamat: z.string().describe('Alamat lengkap lokasi pemasangan'),
      paket_dipilih: z.string().describe('Paket internet yang dipilih'),
      jadwal: z.string().describe('Rencana jadwal pemasangan yang diminta'),
    }),
  ])
);

module.exports = { outputParser };