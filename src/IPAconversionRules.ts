export const NULL_MAPPING = "_";

export const ENDING_CONSONANT_MAPPING: Record<string, string> = {
  "t": "t",
  "d": "d",
  "k": "c",
  "ɡ": "ɡ",
  "p": "p",
  "b": "b",

  "m": "m",
  "n": "n",
  "ŋ": "ng",

  "v": "v",
  "f": "f",
  "s": "s",
  "z": "z",

  "l": "l",
  "ɫ": "l",

  "ʁ": "ʁ",

  // german
  "x": "kh",
  "ç": "kh",

  "ts": "ts",
  "pf": "pf",
  "r": "r",
};

export const NUCLEUS_MAPPING: Record<string, string> = {
  // exact 1-1 correspondant
  "a": "a",
  "aɪ": "ai",
  "e": "ê",
  "eɪ": "ây",
  "i": "i",
  "iɛ": "ia",
  "o": "o",
  "oʊ": "âu",
  "u": "u",
  "uɛ": "oe",
  "ɔ": "o",
  "ɔɪ": "oi",
  "ə": "ơ",
  "əj": "ơi",
  "ɛ": "e",

  "ɨ": "ư",

  // not exact equivalence in vietnamese
  "aʊ": "ao",
  "yi": "üi",

  // german
  "ɔʏ": "oi",

  "jaʊ": "iau",
  "jeɪ": "iây",
  "ji": "i",
  "joʊ": "iau",
  "ju": "iu",
  "jæ": "iae",
  "jɑ": "ia",
  "jɔ": "io",
  "jə": "ia",
  "jɛ": "iê",
  "jɪ": "i",
  "jʊ": "iu",

  "waʊ": "uau",
  "weɪ": "uây",
  "wi": "ui",
  "woʊ": "uâu",
  "wu": "u",
  "wæ": "uae",
  "wɑ": "ua",
  "wɔ": "uo",
  "wə": "ua",
  "wɛ": "uê",
  "wɪ": "ui",
  "wʊ": "u",
  "wa": "oa",

  "æ": "ae",
  "ɑ": "ä",
  "ɑɛ": "ae",

  // very similar to /i/ and /u/ /y/ just mostly length, slightly less forward/backward
  "ɪ": "i",
  "ʊ": "u",
  "ʏ": "ü",

  "y": "ü",
  "ø": "ø",
  "œ": "œ",
  "ɐ": "â",

  "ɑ̃": "oong",
  "ɛ̃": "ăng",
  "ɔ̃": "ông",
  "œ̃": "ăng",

  "jɑ̃": "ioong",
  "jɛ̃": "iăng",
  "jɔ̃": "iông",
  "jœ̃": "iăng",

  // russian
  "ɵ": "ô",
};

export const SYLLABLE_ENDING_MAPPING: Record<string, string> = {
  ...NUCLEUS_MAPPING,
  ...Object.fromEntries(
    Object.entries(NUCLEUS_MAPPING).flatMap(([nucleus, mappedNucleus]) =>
      Object.entries(ENDING_CONSONANT_MAPPING).map(
        ([ending, mappedEnding]) => [
          nucleus + ending,
          mappedNucleus + mappedEnding,
        ],
      ),
    ),
  ),

  // ia/ja + ending → iê + mapped ending
  ...Object.fromEntries(
    Object.entries(ENDING_CONSONANT_MAPPING).flatMap(
      ([ending, mappedEnding]) =>
        ["ia", "ja", "jə", "iə"].map((nucleus) => [
          nucleus + ending,
          "iê" + mappedEnding,
        ]),
    ),
  ),

  // ua/wa + ending → uô + mapped ending
  ...Object.fromEntries(
    Object.entries(ENDING_CONSONANT_MAPPING).flatMap(
      ([ending, mappedEnding]) =>
        ["uə", "wə"].map((nucleus) => [
          nucleus + ending,
          "uô" + mappedEnding,
        ]),
    ),
  ),

  // uỵa + ending → uyệ + mapped ending
  ...Object.fromEntries(
    Object.entries(ENDING_CONSONANT_MAPPING).flatMap(
      ([ending, mappedEnding]) =>
        ["wiə"].map((nucleus) => [
          nucleus + ending,
          "uô" + mappedEnding,
        ]),
    ),
  ),

  // Overrides
  "ɔŋ": "oong",
  "jəŋ": "iêng",

  // rule: ich/ac
  "ec": "ach",
  "êc": "êch",
  "ic": "ich",
  "yc": "ych",
  "oec": "oach",
  "uêc": "uêch",
  "uyc": "uych",
};

export const LETTER_MAPPING: Record<string, string> = {
  // exact 1-1 correspondant
  " ": "",
  ",": "",
  "/": "",
  "ˈ": "",
  "ˌ": "",

  // t aspiration rule
  "tˈ": "th",
  "tˌ": "th",
  "ˈt": "th",
  "ˌt": "th",
  "t": "t",

  "a": "a",
  "b": "b",
  "d": "đ",
  "e": "e",
  "o": "ô",
  "f": "ph",
  "h": "h",
  "i": "i",
  "k": "k",
  "m": "m",
  "n": "n",
  "p": "p",
  "s": "x",
  "tʃ": "ch",
  "u": "u",
  "v": "v",
  "w": "w",
  "ŋ": "ng",

  "ɔ": "o",
  "ə": "ơ",
  "ɛ": "ê",
  "l": "l",

  "tɹ": "tr",

  "z": "z",
  "r": "r",

  // french
  "ɲ": "nh",

  // not exact equivalence in vietnamese
  "dʒ": "dʒ",
  "ʒ": "ʒ",
  "j": "j",

  "æ": "ae",
  "ɑ": "ä",
  "ɪ": "i",
  "ʊ": "u",
  "ɝ": "ơr",

  "ɡ": "ɡ",
  "ɫ": "l",
  "ɹ": "r",
  "ʃ": "sh",
  "θ": "ss",
  "ð": "zz",

  // french
  "y": "ü",

  "ɑ̃": "oong",
  "ɛ̃": "ăng",
  "ɔ̃": "ông",
  "œ̃": "ăng",

  "ø": "ø",
  "œ": "œ",

  "ʁ": "ʁ",

  // german
  "ʏ": "ü",
  "ɐ": "â",
  "x": "kh",
  "ç": "kh",
  "ts": "ts",
  "pf": "pf",

  // russian
  "ʐ": "zh",
  "ɕ": "sh",
  "ʑ": "zh",

  "ɨ": "ư",
  "ɵ": "ô",
};

export const GERMAN_R_VOCALIZATION: Record<string, string> = {
  // German R-vocalization
  "ɪr": "iê",
  "ir": "iê",

  "ʏr": "üê",
  "yr": "üê",

  "ʊr": "ươ",
  "ur": "uô",

  "ɛr": "eơ",
  "er": "êơ",

  "œr": "œơ",
  "ør": "øơ",

  "ɔr": "oơ",
  "or": "ôơ",

  "ar": "aơ",
};

export const GERMAN_R_VOCALIZATION_WITHOUT_CODA: Record<string, string> = {
  "ɪr": "ia",
  "ir": "ia",
  "ʏr": "üa",
  "yr": "üa",
  "ʊr": "ưa",
  "ur": "ua",
};