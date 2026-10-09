# Proforma Studio v2

Masaüstü kullanım için yenilenmiş proforma çalışma alanı.

## Kullanım

Giriş Yap düğmesi doğrudan çalışma alanını açar. E-posta, şifre ve üyelik yoktur.
Yeni Oluştur yeni bir PF-100001 biçiminde numara ayırır. İlk numara 100001'dir.
Kaydet aynı açık teklif kaydını günceller. Geçmiş Teklifler > Kopyala yeni numara oluşturur.
Firma Ayarları yeni tekliflere otomatik uygulanır; eski teklifler değişmez.
Belge dili Türkçe/İngilizce/Almanca/Hollandaca olabilir. Varsayılan para birimleri TRY/USD/EUR/EUR'dur. Para birimi değişikliği kur dönüşümü yapmaz.
Standart başlıklar ve nakliye ifadeleri çevrilir; özel ürün/şart metinlerini kullanıcı girer.
KDV belge dilinden bağımsız seçilir. Hesaplamada ürünlerin iskonto sonrası bedeline uygulanır; ek gider ve nakliye ayrıca eklenir.
Kaparo teklif toplamını değiştirmez, kalan ödeme satırından düşülür.

## Kayıt ve yedekleme

Teklif arşivi ve firma ayarları IndexedDB'de, açık taslak localStorage'da saklanır.
Veriler bu tarayıcı ve site adresine aittir. Gizli pencere, başka bilgisayar veya farklı alan adı ayrı kayıt alanıdır.
Sayaç aynı tarayıcıdaki sekmeler arasında kilitlenir. Hesapsız sürümde farklı bilgisayarların sayaçları birbirine bağlı değildir.
Geçmiş Teklifler > Yedek İndir ile JSON yedeği alın. Yedek Yükle ile başka tarayıcıya taşıyabilirsiniz. Aynı kayıt kimliği varsa yedekteki kayıt uygulanır; sayaç geriye alınmaz.
Tarayıcı verilerini temizlemeden önce yedek alın. Düzenli yedek önerilir.

## Eski sürüm

Eski Firebase teklifleri silinmez. Bu sürüm onlara erişmez ve Firebase ayarı gerektirmez.
Eski tarayıcı taslağı aynı site adresinde varsa ilk açılışta isteğe bağlı içe aktarılır. Satıcı, logo ve banka bilgileri firma ayarlarına aktarılır.
Bulut arşivini aktarmak için eski sürümde oturum açılarak ayrı dışa aktarma gerekir. Git geçmişindeki eski sürüm korunur.

## Yayınlama

Dosyaları GitHub Pages deposunun köküne yerleştirin. CNAME mevcut depodaki haliyle korunmalıdır.
Dosyaları çift tıklamak yerine HTTPS site adresinden açın; ES modülleri ve güvenli numaralandırma için güncel Chrome veya Edge kullanın.
Firebase kuralları değiştirmeniz gerekmez. Eski firebase.js dosyası aktif sürüm tarafından kullanılmaz.
PDF kütüphanesi CDN'den yüklenir; PDF için internet gerekir. Tasarım masaüstüne göre düzenlenmiştir.

## Doğrulama

Sözdizimi, toplam/iskonto/KDV/kaparo, uzun metinlerin sayfalara bölünmesi, çok ürünlü belgeler, dil başlıkları, yerel kayıt, numara sürekliliği, firma profili ve yedek aktarımı için tarayıcı kontrolleri uygulanır.
