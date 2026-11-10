const API = "https://api.alquran.cloud/v1";
const surahSelect = document.getElementById("surahSelect");
const audioSurah = document.getElementById("audioSurah");
const loadButton = document.getElementById("loadSurah");
const content = document.getElementById("surahContent");
const statusText = document.getElementById("status");
const audioPlayer = document.getElementById("audioPlayer");

async function getJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error("تعذر الاتصال بالخدمة.");
  const json = await response.json();
  if (json.code !== 200) throw new Error("لم يتم تحميل البيانات.");
  return json.data;
}

function addSurahOptions(surahs) {
  for (const surah of surahs) {
    const label = `${surah.number}. ${surah.name}`;
    for (const select of [surahSelect, audioSurah]) {
      const option = document.createElement("option");
      option.value = surah.number;
      option.textContent = label;
      select.appendChild(option);
    }
  }
}

async function loadSurah() {
  const number = surahSelect.value;
  if (!number) {
    statusText.textContent = "يرجى اختيار سورة أولاً.";
    return;
  }
  loadButton.disabled = true;
  statusText.textContent = "جارٍ تحميل السورة...";
  content.replaceChildren();
  try {
    const data = await getJson(`${API}/surah/${number}`);
    const title = document.createElement("h3");
    title.className = "surah-title";
    title.textContent = data.name;
    content.appendChild(title);

    for (const ayah of data.ayahs) {
      const span = document.createElement("span");
      span.className = "verse";
      span.textContent = ayah.text + " ";
      const numberSpan = document.createElement("span");
      numberSpan.className = "verse-number";
      numberSpan.textContent = `۞ ${ayah.numberInSurah}`;
      content.append(span, numberSpan, document.createTextNode(" "));
    }

    const dua = document.createElement("p");
    dua.className = "dua";
    dua.textContent = "ادعيلي دعوة الخير";
    content.appendChild(dua);
    statusText.textContent = `سورة ${data.name} — ${data.numberOfAyahs} آية`;
  } catch (error) {
    statusText.textContent = error.message + " تحقق من اتصال الإنترنت وحاول مجدداً.";
    content.innerHTML = '<p class="placeholder">تعذر عرض السورة حالياً.</p>';
  } finally {
    loadButton.disabled = false;
  }
}

async function playSurah() {
  const number = audioSurah.value;
  if (!number) return;
  audioPlayer.src = `https://cdn.islamic.network/quran/audio-surah/128/ar.alafasy/${number}.mp3`;
  try {
    await audioPlayer.play();
  } catch {
    audioPlayer.focus();
  }
}

loadButton.addEventListener("click", loadSurah);
audioSurah.addEventListener("change", playSurah);

(async function init() {
  try {
    const surahs = await getJson(`${API}/surah`);
    addSurahOptions(surahs);
    statusText.textContent = "اختر سورة من القائمة لقراءتها.";
  } catch (error) {
    statusText.textContent = "تعذر تحميل قائمة السور. تحقق من اتصال الإنترنت ثم حدّث الصفحة.";
    surahSelect.innerHTML = '<option value="">تعذر التحميل</option>';
    audioSurah.innerHTML = '<option value="">تعذر التحميل</option>';
  }
})();
