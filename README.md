# Mctieeee

Minecraft sunucusu için özel Tier Listesi, Oyuncu Profil ve Yorum Sistemi!

## Özellikler

- **Tier Listesi:** Oyuncuları tierlara göre listeler ve arama yapabilirsiniz.
- **Oyuncu Profili:** Her oyuncunun detaylı profilini görebilir, avatar ve tier bilgilerini inceleyebilirsiniz.
- **Yorum Sistemi:** Oyunculara yorum ekleyebilir ve başkalarının bıraktığı yorumları görebilirsiniz.
- **Giriş Sistemi:** Kullanıcılar giriş yaparak yorum ekleyebilir.
- **Responsive Tasarım:** Mobil ve masaüstünde kolay kullanım.
- **Animasyonlar:** Modern ve akıcı animasyonlar (Tailwind CSS ile).
- **Bakım Modu:** API bakımda ise ziyaretçilere bilgi verir.

## Kullanılan Teknolojiler

- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [sstashy API](https://api.sstashy.io/) (sunucu verisi için)

## Nasıl Kurulur?

```bash
git clone https://github.com/sstashy1/mctieeee.git
cd mctieeee
npm install
npm run dev
```

Uygulama yerel olarak `http://localhost:5173` adresinde çalışacaktır.

## Dosya Yapısı

```
src/
  assets/                # Görseller ve ikonlar
  components/            # UI bileşenleri
  ├─ cards/              # Oyuncu kartı
  ├─ common/             # Ortak bileşenler (spinner, hata vs.)
  ├─ context/            # Auth & tema context
  ├─ forms/              # Giriş/Kayıt formları
  ├─ hooks/              # Özel React hook'ları
  ├─ lists/              # Tier listesi
  ├─ menus/              # Navbar, kullanıcı menüsü vs.
  ├─ modals/             # Modal bileşenleri
  ├─ services/           # API servisleri
  ├─ sidebar/            # Yan panel ve floating window
  pages/                 # Ana sayfa vs.
  styles/                # CSS dosyaları
```

## Önemli Dosyalar

- `src/pages/Main.jsx`: Ana tier listesi ve oyuncu arama
- `src/components/modals/PlayerProfileModal.jsx`: Oyuncu profil modalı
- `src/components/modals/CommentsModal.jsx`: Yorum modalı
- `src/components/menus/AuthModal.jsx`: Giriş/Kayıt modalı
- `src/components/services/apiClient.js`: API bağlantıları

## Katkı Sağlama

Katkılarınızı ve hata raporlarınızı pull request veya issue olarak gönderebilirsiniz!

## İletişim

- Discord: [trneth](https://discord.gg/trneth)
- Geliştirici: [sstashy1](https://sstashy.io)

---

Bu proje sstashy tarafından geliştirilmiştir.
