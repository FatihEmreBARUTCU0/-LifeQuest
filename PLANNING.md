# LifeQuest - Gamified Todo App

## Konsept
Sıradan todo değil, RPG oyun hissi veren görev yönetimi.
Görevler "quest", kullanıcılar "kahraman".

## Teknoloji
- React Native (Expo SDK 54)
- TypeScript
- AsyncStorage (local veri saklama)
- React Navigation

## Ekranlar
1. Mood Screen → Günlük mood seçimi (açılışta)
2. Home Screen → Questler listesi + XP bar + streak
3. Add Quest Screen → Yeni quest ekleme
4. Profile Screen → Level, rozetler, istatistikler

## Özellikler

### Mood Sistemi
- 5 mood: 😴 Yorgun / 😊 Normal / 😤 Enerjik / 😰 Stresli / 🎯 Odaklı
- Mood'a göre quest önerisi değişir
- Her gün açılışta sorar

### Gamification
- Her quest tamamlayınca XP kazanılır (kolay:10, orta:25, zor:50)
- Level sistemi: Beginner(0-100) → Explorer(100-300) → Warrior(300-600) → Legend(600+)
- Streak: üst üste kaç gün aktif
- 🔥 ateş animasyonu streak'te

### Quest Özellikleri
- Zorluk: Kolay / Orta / Zor
- Kategori: 💼 İş / 📚 Eğitim / 🏃 Sağlık / 🏠 Ev / ⭐ Kişisel
- Öncelik: AI keyword sistemi ile otomatik (fatura/öde→acil, kitap→normal)
- Pomodoro timer: quest başlatınca 25dk timer

### Tasarım
- Koyu tema (siyah/mor/altın)
- Gradient kartlar
- Animasyonlar (tamamlayınca konfeti efekti)
- RPG font hissi — kalın başlıklar

## Veri
- AsyncStorage ile local kayıt
- Veritabanı yok, internet yok
- Uygulama kapansa bile veriler kalır

## Hedef
Upwork'te React Native portföyü için
görsel olarak etkileyici, gerçekten çalışan uygulama.