// Data produk mapping – seperti katalog apotek yang siap di-scan, hardcoded biar sederhana
const dataProduk = {
    masker: { nama: 'Masker Medis (Box 50)', harga: 25000 },
    termometer: { nama: 'Termometer Digital', harga: 75000 },
    paracetamol: { nama: 'Obat Paracetamol (10 Strip)', harga: 15000 },
    perban: { nama: 'Perban Steril (Pack 5)', harga: 10000 }
};

// Inisialisasi keranjang belanja – seperti daftar obat pasien yang siap di-scan
let keranjang = [];  // Array untuk simpan item, nggak pake localStorage biar sederhana
let totalHarga = 0;  // Total belanja, update real-time kayak kasir apotek

// Fungsi bikin suara beep subtle saat tambah item (opsional, buat feel nyata)
function playBeep() {
    if (typeof AudioContext !== 'undefined') {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 800;  // Nada tinggi tapi lembut
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.1);
    }
}

// Event listener utama: Saat DOM siap
document.addEventListener('DOMContentLoaded', function() {
    const formKasir = document.getElementById('formKasir');
    const itemSelect = document.getElementById('itemSelect');
    const namaInput = document.getElementById('namaItem');
    const hargaInput = document.getElementById('harga');

    // Auto-fill nama & harga saat select berubah (untuk kasir di index.html)
    if (itemSelect && namaInput && hargaInput) {
        itemSelect.addEventListener('change', function() {
            const selectedValue = this.value;
            if (selectedValue && dataProduk[selectedValue]) {
                const produk = dataProduk[selectedValue];
                namaInput.value = produk.nama;
                hargaInput.value = produk.harga.toLocaleString('id-ID');
                
                // Efek transisi smooth: Glow & fade-in
                [namaInput, hargaInput].forEach(input => {
                    input.style.transition = 'all 0.3s ease';
                    input.style.boxShadow = '0 0 0 3px rgba(168, 213, 186, 0.3)';  // Glow mint
                    setTimeout(() => {
                        input.style.boxShadow = 'none';
                    }, 500);
                });
            } else {
                namaInput.value = '';
                hargaInput.value = '';
            }
        });
    }

    // Submit form kasir: Ambil dari auto-fill
    if (formKasir) {
        formKasir.addEventListener('submit', function(e) {
            e.preventDefault();  // Cegah refresh halaman, biar smooth

            const selectedValue = itemSelect.value;
            const jumlahItem = parseInt(document.getElementById('qty').value);

            // Validasi ala dokter: Pastiin item dipilih & qty bener
            if (!selectedValue || !dataProduk[selectedValue] || isNaN(jumlahItem) || jumlahItem < 1) {
                alert('Pilih item dari daftar dan pastikan jumlah minimal 1, seperti dosis yang tepat ya!');
                return;  // Stop kalau invalid
            }

            const produk = dataProduk[selectedValue];
            const hargaSatuan = produk.harga;
            const subtotalItem = hargaSatuan * jumlahItem;

            // Ambil nama dari auto-fill atau data
            const namaItem = namaInput.value || produk.nama;

            // Tambah ke keranjang array
            const itemBaru = {
                nama: namaItem,
                harga: hargaSatuan,
                jumlah: jumlahItem,
                subtotal: subtotalItem
            };
            keranjang.push(itemBaru);
            totalHarga += subtotalItem;

            // Efek suara tambahan (kalau support)
            playBeep();

            // Update tampilan keranjang dengan animasi
            tampilkanKeranjangDenganAnimasi();

            // Reset form: Select balik ke default, qty ke 1
            itemSelect.value = '';
            namaInput.value = '';
            hargaInput.value = '';
            document.getElementById('qty').value = 1;
        });
    }

    // Event untuk tombol reset daftar (kasir)
    const btnClear = document.getElementById('clearBtn');
    if (btnClear) {
        btnClear.addEventListener('click', function() {
            // Animasi fade-out semua item sebelum clear
            const daftarItems = document.querySelectorAll('#daftarItem li');
            daftarItems.forEach((li, index) => {
                setTimeout(() => {
                    li.style.transition = 'opacity 0.3s ease';
                    li.style.opacity = '0';
                }, index * 100);  // Staggered fade-out
            });
            setTimeout(() => {
                keranjang = [];  // Kosongin array
                totalHarga = 0;
                tampilkanKeranjangDenganAnimasi();  // Update kosong
            }, 400);  // Tunggu animasi selesai
        });
    }

    // Event listener untuk form saran di about.html (Tambahan baru)
    const formSaran = document.getElementById('formSaran');
    if (formSaran) {  // Hanya jalan kalau di about.html
        formSaran.addEventListener('submit', function(e) {
            e.preventDefault();  // Cegah refresh halaman

            const nama = document.getElementById('namaSaran').value.trim();
            const email = document.getElementById('emailSaran').value.trim();
            const pesan = document.getElementById('pesanSaran').value.trim();

            // Validasi ala dokter: Pastiin semua field lengkap
            if (!nama || !email || !pesan) {
                alert('Mohon isi semua field dengan lengkap, seperti resep dokter ya! Nama, email, dan pesan wajib.');
                return;  // Stop kalau invalid
            }

            // Cek format email sederhana (opsional, pakai regex basic)
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Format email tidak valid. Pastikan seperti example@email.com.');
                return;
            }

            // Simulasi kirim sukses (alert + reset form)
            alert('Pesan saran Anda telah terkirim! Terima kasih telah menghubungi Toko Sehatku. Kami akan balas segera via email.');
            formSaran.reset();  // Kosongkan semua field
        });
    }
});

// Fungsi tampilkan keranjang dengan animasi slide-in (bikin terasa dinamis)
function tampilkanKeranjangDenganAnimasi() {
    const daftarUl = document.getElementById('daftarItem');
    if (!daftarUl) return;

    daftarUl.innerHTML = '';  // Kosongin dulu

    keranjang.forEach((itemObj, index) => {
        // Buat elemen li baru
        const liBaru = document.createElement('li');
        liBaru.classList.add('keranjang-item');  // Class untuk CSS animasi
        liBaru.innerHTML = `
            <span>${itemObj.nama} (x${itemObj.jumlah})</span>
            <span>Rp ${itemObj.subtotal.toLocaleString('id-ID')}</span>
            <button onclick="hapusItemDenganAnim(${index})" class="hapus-btn">×</button>
        `;

        // Tambah ke UL, lalu trigger animasi
        daftarUl.appendChild(liBaru);
        requestAnimationFrame(() => {  // Pakai RAF biar smooth
            liBaru.style.opacity = '0';
            liBaru.style.transform = 'translateX(100%)';  // Mulai dari kanan
            setTimeout(() => {
                liBaru.style.transition = 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
                liBaru.style.opacity = '1';
                liBaru.style.transform = 'translateX(0)';
            }, 10);  // Delay kecil biar trigger transition
        });
    });

    // Update total dengan format Rupiah
    const spanTotal = document.getElementById('total');
    if (spanTotal) {
        spanTotal.textContent = totalHarga.toLocaleString('id-ID');
        // Animasi pulse pada total kalau berubah
        spanTotal.style.transition = 'all 0.3s ease';
        spanTotal.style.transform = 'scale(1.1)';
        setTimeout(() => {
            spanTotal.style.transform = 'scale(1)';
        }, 150);
    }
}

// Fungsi hapus item dengan animasi fade-out (biar nggak abrupt)
function hapusItemDenganAnim(index) {
    // Fade-out item yang dihapus
    const liTarget = document.querySelectorAll('#daftarItem li')[index];
    if (liTarget) {
        liTarget.style.transition = 'opacity 0.3s ease';
        liTarget.style.opacity = '0';
        setTimeout(() => {
            // Update total dulu
            totalHarga -= keranjang[index].subtotal;
            keranjang.splice(index, 1);  // Hapus dari array
            tampilkanKeranjangDenganAnimasi();  // Refresh tampilan
        }, 300);  // Tunggu fade selesai
    }
}

// Inisialisasi tampilan awal (kalau ada data dari sebelumnya, tapi di sini kosong)
tampilkanKeranjangDenganAnimasi();