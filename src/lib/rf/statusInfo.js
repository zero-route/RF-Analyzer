export function describeStatus(level, eirpDbm) {
  const value = `${eirpDbm.toFixed(1)} dBm`;

  if (level === "isolated") {
    return {
      title: "Aman: sinyal terisolasi",
      body: "Sinyal diarahkan ke dummy load atau shielded enclosure, jadi tidak dipancarkan ke udara bebas dan tidak mengganggu perangkat lain. Cocok untuk pengujian di meja kerja.",
    };
  }

  if (level === "safe") {
    return {
      title: "Kenapa aman",
      body: `EIRP ${value} masih di bawah atau sama dengan 20 dBm (100 mW), tingkat yang umum untuk perangkat Wi-Fi 2.4 GHz biasa. Pada level ini jangkauannya terbatas dan kecil kemungkinan mengganggu perangkat lain di sekitar.`,
    };
  }

  if (level === "permit") {
    return {
      title: "Kenapa perlu izin",
      body: `EIRP ${value} sudah melewati 20 dBm (100 mW) tetapi masih di bawah 30 dBm (1 W). Ini di atas batas umum perangkat tanpa izin, jadi pemakaiannya bisa memerlukan izin atau sertifikasi, dan perangkat di sekitar mulai bisa terganggu. Cek aturan Komdigi/SDPPI, atau turunkan daya dan gain.`,
    };
  }

  return {
    title: "Kenapa bahaya",
    body: `EIRP ${value} melewati 30 dBm (1 W). Pada level ini sinyal bisa membanjiri Wi-Fi, Bluetooth, dan perangkat lain di pita yang sama, sehingga berpotensi bekerja seperti pengacau sinyal (jammer), yang dilarang di banyak negara. Gunakan dummy load atau shielded enclosure, atau turunkan daya dan gain.`,
  };
}
