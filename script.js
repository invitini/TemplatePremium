/* ==========================================================
   0. PENGATURAN UTAMA
   ========================================================== */

const CONFIG = {
  tanggalAcara: "2030-01-09T08:00:00+07:00",
  tanggalAkhirAcara: "2030-01-09T14:00:00+07:00",

  // WAJIB diganti dengan nomor WhatsApp penerima RSVP.
  // Contoh: 6281234567890
  nomorWhatsApp: "6283844049110",

  namaMempelai: "Tezzar & Leni",
  namaAcara: "Pernikahan Tezzar & Leni",

  alamatAcara:
    "RT.04/RW.04, Cengkudu, Cirahab, Kec. Lumbir, Kabupaten Banyumas, Jawa Tengah 53177"
};


/* ==========================================================
   1. AMBIL ELEMEN HTML
   ========================================================== */

const $ = (id) => document.getElementById(id);

const cover = $("cover");
const openBtn = $("openBtn");
const musik = $("musik");
const musicBtn = $("musicBtn");


/* ==========================================================
   2. NAMA TAMU DARI URL
   Contoh: ?to=Budi+Santoso
   ========================================================== */

const params = new URLSearchParams(window.location.search);
const namaTamu = params.get("to");

if (namaTamu) {
  const namaBersih = namaTamu.trim().slice(0, 100);

  if (namaBersih) {
    const guestName = $("guestName");
    const rsvpNama = $("rsvpNama");

    if (guestName) {
      guestName.textContent = namaBersih;
    }

    if (rsvpNama) {
      rsvpNama.value = namaBersih;
    }
  }
}


/* ==========================================================
   3. OPEN INVITATION
   ========================================================== */

if (openBtn && cover) {
  openBtn.addEventListener("click", () => {

    if (document.body.classList.contains("opened")) {
      return;
    }

    cover.classList.add("slide-out");

    document.body.classList.remove("locked");
    document.body.classList.add("opened");

    window.scrollTo({
      top: 0,
      behavior: "instant"
    });

    putarMusik();
  });
}


/* ==========================================================
   4. MUSIK
   ========================================================== */

function putarMusik() {

  if (!musik || !musicBtn) return;

  musik.play()
    .then(() => {
      musicBtn.classList.add("playing");
      musicBtn.setAttribute("aria-label", "Jeda musik");
    })
    .catch((error) => {
      musicBtn.classList.remove("playing");
      console.warn("Musik tidak dapat diputar:", error);
    });
}

if (musicBtn && musik) {

  musicBtn.addEventListener("click", () => {

    if (musik.paused) {
      putarMusik();

    } else {
      musik.pause();

      musicBtn.classList.remove("playing");
      musicBtn.setAttribute("aria-label", "Putar musik");
    }

  });

  musik.addEventListener("error", () => {
    musicBtn.hidden = true;
  });
}


/* ==========================================================
   5. COUNTDOWN
   ========================================================== */

const targetWaktu = new Date(CONFIG.tanggalAcara).getTime();

const countdown = {
  container: $("countdown"),
  selesai: $("countdownSelesai"),
  hari: $("cdHari"),
  jam: $("cdJam"),
  menit: $("cdMenit"),
  detik: $("cdDetik")
};

let timerCountdown = null;

function dua(angka) {
  return String(angka).padStart(2, "0");
}

function updateCountdown() {

  if (!Number.isFinite(targetWaktu)) {
    console.error("Format tanggal acara tidak valid.");
    clearInterval(timerCountdown);
    return;
  }

  if (
    !countdown.container ||
    !countdown.hari ||
    !countdown.jam ||
    !countdown.menit ||
    !countdown.detik
  ) {
    clearInterval(timerCountdown);
    return;
  }

  const selisih = targetWaktu - Date.now();

  if (selisih <= 0) {

    countdown.container.hidden = true;

    if (countdown.selesai) {
      countdown.selesai.hidden = false;
    }

    clearInterval(timerCountdown);
    return;
  }

  const hari = Math.floor(selisih / 86400000);
  const jam = Math.floor((selisih % 86400000) / 3600000);
  const menit = Math.floor((selisih % 3600000) / 60000);
  const detik = Math.floor((selisih % 60000) / 1000);

  countdown.hari.textContent = dua(hari);
  countdown.jam.textContent = dua(jam);
  countdown.menit.textContent = dua(menit);
  countdown.detik.textContent = dua(detik);
}

updateCountdown();

if (Number.isFinite(targetWaktu) && targetWaktu > Date.now()) {
  timerCountdown = setInterval(updateCountdown, 1000);
}


/* ==========================================================
   6. ANIMASI ORNAMEN POHON
   ========================================================== */

// Memastikan semua ornamen memiliki pembungkus animasi.
// Berguna untuk ornamen pada bagian hadiah dan RSVP.

const ornamenPohon = document.querySelectorAll(
  ".ornamen-scroll, .ornamen[class*='-isi']"
);

ornamenPohon.forEach((pohon) => {

  const gambar = pohon.querySelector(".pohon-goyang");

  if (!gambar) return;

  if (!gambar.parentElement.classList.contains("pohon-masuk")) {

    const pembungkus = document.createElement("div");

    pembungkus.className = "pohon-masuk";

    gambar.parentNode.insertBefore(pembungkus, gambar);
    pembungkus.appendChild(gambar);

  }

});

if ("IntersectionObserver" in window) {

  const observerPohon = new IntersectionObserver(
    (entries) => {

      entries.forEach((entry) => {

        const pohon = entry.target;

        if (entry.isIntersecting) {

          pohon.classList.remove("keluar-scroll");
          pohon.classList.add("aktif-scroll");

        } else if (pohon.classList.contains("aktif-scroll")) {

          pohon.classList.add("keluar-scroll");

        }

      });

    },
    {
      threshold: 0.2
    }
  );

  ornamenPohon.forEach((pohon) => {
    observerPohon.observe(pohon);
  });

  // Bersihkan class setelah animasi keluar selesai.

  ornamenPohon.forEach((pohon) => {

    const pembungkus = pohon.querySelector(".pohon-masuk");

    if (!pembungkus) return;

    pembungkus.addEventListener("animationend", (event) => {

      if (
        event.animationName === "pohonKeluarKiri" ||
        event.animationName === "pohonKeluarKanan"
      ) {

        pohon.classList.remove("aktif-scroll");
        pohon.classList.remove("keluar-scroll");

      }

    });

  });

}


/* ==========================================================
   7. TOMBOL SALIN REKENING DAN ALAMAT
   ========================================================== */

async function salinTeks(teks) {

  try {

    if (navigator.clipboard && window.isSecureContext) {

      await navigator.clipboard.writeText(teks);

    } else {

      const input = document.createElement("textarea");

      input.value = teks;
      input.style.position = "fixed";
      input.style.opacity = "0";

      document.body.appendChild(input);

      input.select();

      const berhasil = document.execCommand("copy");

      input.remove();

      if (!berhasil) {
        throw new Error("Salin teks gagal.");
      }

    }

    alert("Berhasil disalin!");

  } catch (error) {

    console.error("Gagal menyalin:", error);
    alert("Tidak dapat menyalin. Silakan salin secara manual.");

  }

}

document.querySelectorAll("[data-copy]").forEach((tombol) => {

  tombol.addEventListener("click", () => {

    const teks = tombol.dataset.copy;

    if (teks) {
      salinTeks(teks);
    }

  });

});


/* ==========================================================
   8. KALENDER GOOGLE DAN DOWNLOAD ICS
   ========================================================== */

const addCalendarBtn = $("addCalendarBtn");
const calendarOptions = $("calendarOptions");
const googleCalendarBtn = $("googleCalendarBtn");
const downloadCalendarBtn = $("downloadCalendarBtn");

const waktuMulai = new Date(CONFIG.tanggalAcara);
const waktuSelesai = new Date(CONFIG.tanggalAkhirAcara);

function formatGoogleCalendar(waktu) {
  return waktu.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

function escapeICS(teks) {

  return String(teks)
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");

}

const deskripsiAcara =
  "Akad Nikah: 08.00 WIB\n" +
  "Resepsi: 11.00–14.00 WIB\n" +
  "Lokasi: " + CONFIG.alamatAcara;

if (
  Number.isFinite(waktuMulai.getTime()) &&
  Number.isFinite(waktuSelesai.getTime()) &&
  waktuSelesai > waktuMulai
) {

  const parameterGoogle = new URLSearchParams({

    action: "TEMPLATE",
    text: CONFIG.namaAcara,
    dates:
      formatGoogleCalendar(waktuMulai) +
      "/" +
      formatGoogleCalendar(waktuSelesai),
    details: deskripsiAcara,
    location: CONFIG.alamatAcara

  });

  if (googleCalendarBtn) {
    googleCalendarBtn.href =
      "https://calendar.google.com/calendar/render?" +
      parameterGoogle.toString();
  }

  if (downloadCalendarBtn) {

    downloadCalendarBtn.addEventListener("click", () => {

      const ics =
        "BEGIN:VCALENDAR\r\n" +
        "VERSION:2.0\r\n" +
        "PRODID:-//Invitini//Wedding Invitation//ID\r\n" +
        "CALSCALE:GREGORIAN\r\n" +
        "BEGIN:VEVENT\r\n" +
        "UID:" + Date.now() + "@invitini\r\n" +
        "DTSTAMP:" + formatGoogleCalendar(new Date()) + "\r\n" +
        "DTSTART:" + formatGoogleCalendar(waktuMulai) + "\r\n" +
        "DTEND:" + formatGoogleCalendar(waktuSelesai) + "\r\n" +
        "SUMMARY:" + escapeICS(CONFIG.namaAcara) + "\r\n" +
        "DESCRIPTION:" + escapeICS(deskripsiAcara) + "\r\n" +
        "LOCATION:" + escapeICS(CONFIG.alamatAcara) + "\r\n" +
        "END:VEVENT\r\n" +
        "END:VCALENDAR";

      const blob = new Blob([ics], {
        type: "text/calendar;charset=utf-8"
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = "undangan-tezzar-leni.ics";

      document.body.appendChild(link);
      link.click();
      link.remove();

      URL.revokeObjectURL(url);

    });

  }

} else {

  console.error("Tanggal kalender tidak valid.");

}


// Buka dan tutup menu kalender.

if (addCalendarBtn && calendarOptions) {

  addCalendarBtn.addEventListener("click", (event) => {

    event.stopPropagation();

    calendarOptions.classList.toggle("show");

  });

  document.addEventListener("click", (event) => {

    if (
      !calendarOptions.contains(event.target) &&
      !addCalendarBtn.contains(event.target)
    ) {

      calendarOptions.classList.remove("show");

    }

  });

}


/* ==========================================================
   9. RSVP WHATSAPP
   ========================================================== */

const rsvpForm = $("rsvpForm");

if (rsvpForm) {

  rsvpForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const nama = $("rsvpNama")?.value.trim();
    const hadir = $("rsvpHadir")?.value;
    const jumlah = $("rsvpJumlah")?.value;
    const ucapan = $("rsvpUcapan")?.value.trim();

    const nomor = CONFIG.nomorWhatsApp.replace(/\D/g, "");

    if (!nama || !hadir) {
      alert("Mohon lengkapi nama dan kehadiran.");
      return;
    }

    if (!/^62\d{8,13}$/.test(nomor)) {
      alert("Nomor WhatsApp penerima belum diatur. Silakan periksa CONFIG.nomorWhatsApp di script.js.");
      return;
    }

    const pesan =
      "Assalamu'alaikum.\n\n" +
      "Saya ingin mengonfirmasi undangan pernikahan.\n\n" +
      "Nama: " + nama + "\n" +
      "Kehadiran: " + hadir + "\n" +
      "Jumlah tamu: " + jumlah + " orang\n" +
      "Ucapan & Doa: " + (ucapan || "-") +
      "\n\nTerima kasih.";

    const url =
      "https://wa.me/" + nomor +
      "?text=" + encodeURIComponent(pesan);

    window.open(url, "_blank", "noopener,noreferrer");

  });

}


/* ==========================================================
   10. AKHIR SCRIPT
   ========================================================== */

console.log("Script undangan berhasil dijalankan.");