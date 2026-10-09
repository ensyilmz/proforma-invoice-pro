# Proforma Studio v3

Masaüstü teklif çalışma alanı. Önceki giriş tasarımı korunur; e-posta/şifre girişi, kayıt ve şifre sıfırlama Firebase ile çalışır.

## Hesap ve kayıtlar

Mevcut Firebase projesi kullanılır. Aynı e-posta/şifreyle başka bilgisayarda giriş yapıldığında kaydedilmiş teklifler, firma ayarları ve standart maddeler yüklenir.
Kaydet düğmesi açık teklifi hesabınıza kaydeder; düzenlemeler aynı kaydı günceller. Kaydedilmemiş taslak yalnız bu tarayıcıda hesabınıza özel saklanır.
Eski Firebase arşivi korunur. Eski serbest metinler açıldığında ayrı alanlara aktarılır; tanınmayan satırlar Ek bilgi alanında korunur. Eski genel bilgilendirme kaybolmaz, ek bir madde olarak korunur.
Hesapsız sürümdeki tarayıcı kayıtları girişte onayınızla hesabınıza aktarılabilir. Geçmiş Teklifler > Tarayıcı Kayıtlarını Aktar ile sonradan da aktarabilirsiniz.
Geçmiş Teklifler > Yedek İndir/Yükle JSON yedekleme sağlar. İçe aktarmada aynı kayıt kimliği varsa birleştirme yapılır; sayaç geriye alınmaz.

## Teklif numarası

Yeni Oluştur ve arşivde Kopyala hesap bazlı PF-100001 biçiminde yeni numara ayırır. Sayaç Firebase işleminde güvenli şekilde artırılır; mevcut PF numaralarının üstünden devam eder.
Kaydet, yenileme ve arşiv açma yeni numara üretmez. Numara araç çubuğunda ve A4 sağ üstünde görünür. Eski teklifler yeniden numaralandırılmaz.

## Firma ve taraf bilgileri

Firma Ayarları satıcı, logo, banka ve iletişim bilgilerini saklar. Yeni teklifler bunları otomatik kullanır. Açık teklife uygulama seçeneği yeni taslaklarda başlangıçta açıktır; arşivden açılmış teklifler için kullanıcı seçer.
Logo yükleme sırasında kaydet devre dışıdır; hazır olduğunda önizleme görünür. Aktif teklifin logosu ayrıca değiştirilebilir.
Alıcı/satıcı alanları: ünvan, adres, ülke, numara türü ve numarası, vergi dairesi, ilgili kişi, telefon, e-posta, teslimat adresi ve ek bilgi. Boş alanlar basılmaz. Başlıklar belge diline göre çevrilir; girilen içerik kullanıcı tarafından yazılır.

## Dil ve genel bilgilendirme

Türkçe, İngilizce, Almanca ve Hollandaca desteklenir. Dil değişiminde para birimi varsayılanı TRY/USD/EUR/EUR seçilir; kullanıcı değiştirebilir. Tutarlar kurla çevrilmez.
Yedi standart madde dört dilde hazırdır. İlk maddede {days} alanı ayrı Üretim ve teslimat süresi (iş günü) girdisiyle doldurulur.
+ Madde Ekle ile madde eklenir. Maddelerin dil sekmeleri teklifin dilini değiştirmez. Özel maddelerin çevirisini kullanıcı girer; seçili belge dilinde eksik metin varsa kayıt/PDF uyarır.
Maddeleri Varsayılan Kaydet, düzenlenmiş maddeleri ve varsayılan süreyi hesabınıza saklar. Yeni teklifler bunları kullanır. Standartları Getir yalnız aktif teklifin maddelerini sıfırlar.
5. standart madde KDV ve nakliye hariçtir. Teklif seçimleri bununla çelişirse kullanıcıya metni düzenlemesi için uyarı gösterilir. Yeni tekliflerde KDV başlangıçta kapalıdır.

## Fiyat ve çıktı

İskonto, kaparo ve ek giderin etkinleştirme seçeneği tutarın yanındadır. Pozitif tutar yazmak alanı otomatik etkinleştirir. Yüzde iskonto 0–100 arasındadır.
KDV ürünlerin iskonto sonrası bedeline uygulanır. Ek gider/nakliye ayrıca eklenir. Kaparo teklif toplamından ayrı, kalan ödemeyi azaltan satır olarak görünür.
Nakliye: alıcıya ait, dahil, ayrıca bildirilecek veya ayrı ücret. Boş tutar sıfır fiyat gibi basılmaz.
Banka başlıkları çevrilir ve kalındır. Tüm IBAN'lar üç sütunda, tek para birimi bir sütunda gösterilir.
A4 ekran genişliğine göre ölçeklenir; PDF gerçek A4 ölçüsünde kalır. Uzun ürün açıklamaları ve maddeler devam sayfalarına bölünür.
Görseller küçültülerek saklanır. Firestore belge boyutunu aşan teklif kaydedilmez; küçültme önerisi gösterilir.

## Teknik not

Kaydedilen teklifler mevcut users/{uid}/proformas yolunu kullanır. Firma/sayaç meta verileri aynı kullanıcı koleksiyonunda _studio_company ve _studio_counter belgeleridir; arşiv listesi bunları göstermez. Mevcut sahiplik tabanlı Firestore izinleri korunur.
Bulut işlemleri internet bağlantısı gerektirir. Firebase veya erişim hatası işlem mesajında gösterilir. Bu sürüm anonim Firebase verisi erişimi açmaz.
Firebase ve PDF kitaplıkları CDN'den yüklenir. GitHub Pages kökünden yayınlanır; CNAME korunur. Favicon artık assets/favicon.svg dosyasıdır.
