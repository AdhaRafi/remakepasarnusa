# PasarNusa Design Direction (DESIGN.md)

## 1. Identity & Personality
PasarNusa adalah marketplace terkurasi yang menghubungkan karya artisan, pengrajin, dan UMKM lokal dari Sabang sampai Merauke langsung ke tangan pembeli. Karakter visual memadukan kehangatan warisan budaya Nusantara (hangat, membumi, otentik) dengan kehandalan platform e-commerce modern yang cepat, terpercaya, dan mudah digunakan.

## 2. Antislop Dials
- **ENERGY: 2 (Balanced)** - Hangat, percaya diri, elegan, tidak berisik, tidak steril.
- **RHYTHM: 2 (Consistent with breaks)** - Variasi komposisi yang bernyawa antara grid produk, cerita artisan, dan panel informasi tanpa template berulang yang kaku.
- **MOTION: 1 (Hover and micro-transitions only)** - Transisi halus pada interaksi tombol, kartu, dan modal. Tidak ada animasi loop, pulse, atau bounce tanpa tujuan.

## 3. Color Palette
- **Canvas / Background**: Warm Cream (`#F7F3EC`) dan Surface White (`#FFFFFF`)
- **Card & Elevated Surface**: Light Sand (`#EFE8DC`)
- **Primary Accent**: Deep Terakota (`#C94B1A`) - melambangkan tanah liat, gerabah, dan semangat karya lokal
- **Secondary Accent**: Antique Gold (`#B8872A`) - aksen penghargaan kualitas kriya
- **Functional Status**:
  - Success / Lunas: Forest Green (`#246E4A`)
  - Warning / Menunggu: Warm Amber (`#B8721A`)
  - Danger / Batal: Crimson Terra (`#A82A2A`)
- **Text & Ink**:
  - Heading & Primary Text: Deep Espresso (`#1A1008`) - kontras rasio > 12:1 pada canvas
  - Muted / Supporting: Warm Bark (`#6E6254`) - kontras rasio > 4.8:1 pada canvas
  - Border & Dividers: Sand Border (`#DFD7CA`)

## 4. Typography
- **Display & Headings**: `Playfair Display` (Serif editorial berkelas dengan sentuhan craftsmanship)
- **Body & UI**: `Plus Jakarta Sans` (Sangat terbaca, dirancang khusus untuk kenyamanan membaca di perangkat digital)

## 5. UI & Layout Principles
- Tombol dan kontrol memiliki target sentuh minimal 44px (memenuhi standar WCAG AA dan mobile responsiveness).
- Setiap status data (Empty, Loading, Error) memiliki tampilan informatif dan arahan tindakan yang jelas.
- Tidak menggunakan em dash (`—`) dalam salinan UI.
- Semua elemen interaktif memiliki fungsi nyata (tidak ada ghost link atau tombol mati).
