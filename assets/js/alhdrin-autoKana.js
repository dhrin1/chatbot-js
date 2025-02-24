async function loadKanjiData() {
  const response = await fetch("/chatbot/assets/kanji-jouyou.json");
  const kanjiData = await response.json();
  return kanjiData;
}

function convertKanjiHarigana(kanjiData, input) {
  let kanaResult = "";
  for (let char of input) {
    if (kanjiData[char]) {
      const readingsKun =
        kanjiData[char].wk_readings_kun.length > 0
          ? kanjiData[char].wk_readings_kun
          : kanjiData[char].wk_readings_on;
      const validReadings = readingsKun.map((reading) =>
        reading.replace(/!/g, "")
      );
      if (validReadings.length > 0) {
        kanaResult += validReadings[validReadings.length - 1];
      } else {
        kanaResult += char;
      }
    } else {
      kanaResult += char;
    }
  }
  return kanaResult;
}

function getKanjiData() {
  return loadKanjiData().then((data) => {
    return data;
  });
}
