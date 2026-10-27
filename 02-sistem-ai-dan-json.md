Aturan AI (Gemini API via LangChain) sebagai Router & Customer Service:
Gunakan LangChain StructuredOutputParser untuk mengklasifikasikan chat ke 3 format JSON berikut HANYA JIKA data sudah lengkap:
1. "informasi": {"tipe_pesan": "informasi", "balasan_ke_user": "..."}
2. "perbaikan": {"tipe_pesan": "perbaikan", "nama": "...", "alamat": "...", "kategori_gangguan": "...", "jadwal": "..."}
3. "pemasangan_baru": {"tipe_pesan": "pemasangan_baru", "nama": "...", "alamat": "...", "paket_dipilih": "...", "jadwal": "..."}

Manajemen State & Memori (LangChain):
- ROLLING WINDOW: Gunakan fitur memory LangChain (seperti ConversationBufferWindowMemory) dengan batas k=5 (menyimpan 5 percakapan terakhir) untuk menghemat token API.
- CONTEXT INJECTION: Jika nomor WA ada di database, gunakan LangChain PromptTemplate untuk menyisipkan variabel {nama} dan {alamat} ke System Prompt secara dinamis. AI dilarang menanyakan ulang data tersebut.
- Jika data belum lengkap, AI merespons natural untuk menanyakan data yang kurang.
- CLEAR MEMORY: Setelah JSON berhasil dicetak, panggil fungsi untuk melakukan clear/reset pada memory instance untuk nomor WA tersebut.
-