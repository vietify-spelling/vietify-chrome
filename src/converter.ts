
import {
  IPAruleStrong,
  IPAruleWeak,
  pinyinRuleStrong,
  pinyinRuleWeak,
} from "./IPAconversionRules";
import { parse } from "./parser.generated";
import { parse as parsePinyin } from "./pinyinParser.generated";

export type RuleMode = "weak" | "strong";

export const COMBINE_ACUTE = "\u0301"; // sắc: á
export const COMBINE_GRAVE = "\u0300"; // huyền: à
export const COMBINE_HOOK_ABOVE = "\u0309"; // hỏi: ả
export const COMBINE_TILDE = "\u0303"; // ngã: ã
export const COMBINE_DOT = "\u0323"; // nặng: ạ
export const COMBINE_NONE = ""; // ngang: a

export const COMBINE_MACRON = "\u0304"; // 1st: mā

export type ConversionRules = {
  SYLLABLE_ENDING_MAPPING: Record<string, string>;
  LETTER_MAPPING: Record<string, string>;
  NULL_MAPPING: "_";
};

export type VieOptions = {
  vowelEpenthesis?: {
    skipAll?: boolean;
    skipLast?: boolean;
    replacement?: string;
  };
  uppercaseStress?: boolean;
  language?: string;
};

export type Syllable = {
  initial?: string | null;
  nucleus?: string | null;
  ending?: string | null;
  stress?: number | null;
  tone?: number;
  [key: string]: unknown;
};

export type VieResult = {
  ipa: string;
  ast: Syllable[];
  vie: string;
};

export type PinyinResult = {
  pinyin: string;
  ast: Syllable[];
  vie: string;
};

const RULES: Record<RuleMode, ConversionRules> = {
  weak: IPAruleWeak,
  strong: IPAruleStrong,
};

const PINYIN_RULES: Record<RuleMode, ConversionRules> = {
  weak: pinyinRuleWeak,
  strong: pinyinRuleStrong,
};

const rulesForMode = (
  mode: RuleMode,
  language?: string,
): ConversionRules => {
  const ruleTables = language === "ch" ? PINYIN_RULES : RULES;

  if (!(mode in ruleTables)) {
    throw new Error(`mode must be 'weak' or 'strong', got ${mode}`);
  }

  return ruleTables[mode];
};

export const normalizeNfc = (value: string): string => {
  return value.normalize("NFC");
};

export const normalizeNfd = (value: string): string => {
  return value.normalize("NFD");
};

export const vieConsonantRule = (
  consonant: string,
  vowel: string,
): string => {
  if (
    vowel &&
    ["k", "c"].includes(consonant) &&
    normalizeNfd(vowel[0])[0] === "u" &&
    vowel.length > 1 &&
    [
      "a",
      "e",
      "ê",
      "i",
      "o",
      "u",
      "œ",
      "ø",
      "ä",
      "ö",
      "ü",
    ].includes(normalizeNfd(vowel[1])[0])
  ) {
    return "qu" + vowel.slice(1);
  }

  if (
    vowel &&
    consonant === "k" &&
    ["a", "o", "u", "ä", "ü"].includes(
      normalizeNfd(vowel[0])[0],
    )
  ) {
    return "c" + vowel;
  }

  if (
    vowel &&
    consonant === "c" &&
    ["e", "ê", "i", "œ", "ø"].includes(
      normalizeNfd(vowel[0])[0],
    )
  ) {
    return "k" + vowel;
  }

  return consonant + vowel;
};

const VIE_SYLLABLE_REPLACEMENTS: Record<string, string> = {
  wi: "uy",
  wa: "oa",
  wâ: "uâ",
  we: "oe",
  wơ: "uơ",
  ge: "ghe",
  gi: "ghi",
  gê: "ghê",
  qui: "quy",
};

const VIE_SYLLABLE_PATTERN =
  /wi|wa|wâ|we|wơ|ge|gi(?!a)|gê|qui/g;

const ENDING_REPLACEMENTS: Record<string, string> = {
  ki: "ky",
  li: "ly",
  mi: "my",
  si: "sy",
  ti: "ty",
  hi: "hy",
};

const ENDING_PATTERN = /ki$|li$|mi$|si$|ti$|hi$/;

const replaceVieSyllablePatterns = (vie: string): string => {
  return vie.replace(
    VIE_SYLLABLE_PATTERN,
    (match) => VIE_SYLLABLE_REPLACEMENTS[match],
  );
};

const applyVowelEpenthesis = (
  vie: string,
  options: VieOptions,
): string => {
  const vowelEpenthesis = options.vowelEpenthesis ?? {};

  return vie.replace(/._/g, (match) => {
    const consonant = match[0];
    const replacement =
      vowelEpenthesis.replacement ?? "ơ";

    return vieConsonantRule(
      consonant,
      replacement,
    );
  });
};

const applyEndingReplacements = (vie: string): string => {
  return vie.replace(
    ENDING_PATTERN,
    (match) => ENDING_REPLACEMENTS[match],
  );
};

const applyInitialConsonantRule = (vie: string): string => {
  if (
    vie.length < 2 ||
    !["k", "c"].includes(vie[0])
  ) {
    return vie;
  }

  return vieConsonantRule(
    vie[0],
    vie.slice(1),
  );
};

const applyFinalKRule = (vie: string): string => {
  if (!vie.endsWith("c") || vie.length < 2) {
    return vie;
  }

  const preceding = normalizeNfd(
    vie[vie.length - 2],
  )[0];

  if (["e", "ê", "i"].includes(preceding)) {
    return vie.slice(0, -1) + "ch";
  }

  return vie;
};

const shouldSkipVowelEpenthesis = (
  options: VieOptions,
  isLastSyllable: boolean,
): boolean => {
  const vowelEpenthesis =
    options.vowelEpenthesis ?? {};

  return Boolean(
    vowelEpenthesis.skipAll ||
      (vowelEpenthesis.skipLast && isLastSyllable),
  );
};

const buildVieSyllable = (
  syllable: Syllable,
  rules: ConversionRules,
  language?: string,
  hasFollowingConsonant = false,
): [string, boolean] => {
  const head = syllable.initial ?? "";
  const nucleus = syllable.nucleus ?? "";
  const ending = syllable.ending ?? "";

  const tail = nucleus + ending;

  let syllableEndingMapping =
    rules.SYLLABLE_ENDING_MAPPING;

  if (language === "de") {
    syllableEndingMapping = {
      ...syllableEndingMapping,
      ...IPAruleWeak.GERMAN_R_VOCALIZATION,
    };

    if (!hasFollowingConsonant) {
      syllableEndingMapping = {
        ...syllableEndingMapping,
        ...IPAruleWeak.GERMAN_R_VOCALIZATION_WITHOUT_CODA,
      };
    }
  }

  const isNullEnding =
    !(tail in syllableEndingMapping);

  const vie =
    (rules.LETTER_MAPPING[head] ?? "") +
    (syllableEndingMapping[tail] ??
      rules.NULL_MAPPING);

  return [
    replaceVieSyllablePatterns(vie),
    isNullEnding,
  ];
};

export const syllableToVie = (
  syllable: Syllable,
  options: VieOptions = {},
  isLastSyllable = false,
  mode: RuleMode,
  hasFollowingConsonant = false,
): string => {
  const rules = rulesForMode(
    mode,
    options.language,
  );

  let [vieSyllable, isNullVowel] =
    buildVieSyllable(
      syllable,
      rules,
      options.language,
      hasFollowingConsonant,
    );

  if (isNullVowel) {
    if (mode === "strong") {
      if (
        shouldSkipVowelEpenthesis(
          options,
          isLastSyllable,
        )
      ) {
        return "";
      }

      vieSyllable = applyVowelEpenthesis(
        vieSyllable,
        options,
      );
    } else {
      vieSyllable = vieSyllable.replace(
        rules.NULL_MAPPING,
        "",
      );
    }
  } else {
    vieSyllable = applyEndingReplacements(
      vieSyllable,
    );

    vieSyllable = applyInitialConsonantRule(
      vieSyllable,
    );

    vieSyllable = applyFinalKRule(
      vieSyllable,
    );
  }

  if (
    options.uppercaseStress &&
    syllable.stress
  ) {
    return vieSyllable.toLocaleUpperCase("vi");
  }

  return vieSyllable;
};

const cleanIpaItem = (item: string): string => {
  return item
    .replaceAll("ɝˈ", "əˈɹ")
    .replaceAll("ɝ", "əɹ");
};

const normalizeStress = (
  ast: Syllable[],
): void => {
  const stressCount = ast.reduce(
    (count, syllable) =>
      count + (syllable.stress ? 1 : 0),
    0,
  );

  const vowelCount = ast.reduce(
    (count, syllable) =>
      count + (syllable.nucleus ? 1 : 0),
    0,
  );

  if (stressCount !== vowelCount) {
    return;
  }

  const secondary = ast.find(
    (syllable) => syllable.stress === 2,
  );

  if (secondary) {
    secondary.stress = undefined;
  }
};

const moveStressFromEmptySyllables = (
  ast: Syllable[],
): void => {
  ast.forEach((syllable, index) => {
    if (
      syllable.stress &&
      !syllable.nucleus &&
      index + 1 < ast.length
    ) {
      ast[index + 1].stress =
        syllable.stress;

      syllable.stress = undefined;
    }
  });
};

const convertAstToVie = (
  ast: Syllable[],
  options: VieOptions,
  mode: RuleMode,
): string => {
  const lastSyllableIdx = ast.length - 1;
  const vieParts: string[] = [];

  ast.forEach((syllable, index) => {
    const vieSyl = syllableToVie(
      syllable,
      options,
      index === lastSyllableIdx,
      mode,
      index + 1 < ast.length &&
        Boolean(ast[index + 1].initial) &&
        !ast[index + 1].nucleus,
    );

    if (index !== 0 && vieSyl) {
      vieParts.push("-");
    }

    vieParts.push(vieSyl);
  });

  return vieParts.join("");
};

const convertIpaItem = (
  item: string,
  options: VieOptions,
  mode: RuleMode,
): VieResult => {
  const cleaned = cleanIpaItem(item);
  const ast = parse(cleaned) as Syllable[];

  normalizeStress(ast);
  moveStressFromEmptySyllables(ast);

  const vie = convertAstToVie(
    ast,
    options,
    mode,
  );

  return {
    ipa: item,
    ast,
    vie,
  };
};

const LIAISON_CONSONANTS = new Set([
  "z",
  "x",
  "t",
  "d",
  "n",
  "ph",
]);

const VOWELS = new Set([
  "a",
  "e",
  "ê",
  "i",
  "o",
  "u",
  "œ",
  "ø",
  "ä",
  "ö",
  "ü",
]);

const applyFrenchLiaison = (
  results: VieResult[],
): VieResult[] => {
  results.forEach((current, index) => {
    const following = results[index + 1];

    if (!following) {
      return;
    }

    const currentVie = current.vie;
    const followingVie = following.vie;

    if (
      currentVie &&
      followingVie &&
      [...LIAISON_CONSONANTS].some(
        (consonant) =>
          currentVie
            .toLowerCase()
            .endsWith(consonant),
      ) &&
      VOWELS.has(
        followingVie[0].toLowerCase(),
      )
    ) {
      current.vie = currentVie + " →";
    }
  });

  return results;
};

export const ipaToVie = (
  ipa: string,
  options: VieOptions = {},
  mode: RuleMode,
): VieResult[] => {
  rulesForMode(mode);

  const results: VieResult[] = [];

  ipa.split(", ").forEach((item) => {
    results.push(
      convertIpaItem(
        item,
        options,
        mode,
      ),
    );
  });

  if (options.language === "fr") {
    applyFrenchLiaison(results);
  }

  return results;
};

export const addTonalMarkToVowel = (
  vie: string,
  tonalMark: string,
): string => {
  for (const pattern of [
    "ươ",
    "uô",
    "iê",
    "yê",
    "uê",
  ]) {
    const match = vie.match(
      new RegExp(pattern, "i"),
    );

    if (match && match.index !== undefined) {
      const vowelIndex =
        match.index + match[0].length - 1;

      const vowel = vie[vowelIndex];

      return (
        vie.slice(0, vowelIndex) +
        normalizeNfc(vowel + tonalMark) +
        vie.slice(vowelIndex + 1)
      );
    }
  }

  const inherentMatch = vie.match(
    /[âăêôơư]/i,
  );

  if (
    inherentMatch &&
    inherentMatch.index !== undefined
  ) {
    const vowel = inherentMatch[0];

    return (
      vie.slice(0, inherentMatch.index) +
      normalizeNfc(vowel + tonalMark) +
      vie.slice(
        inherentMatch.index + vowel.length,
      )
    );
  }

  const ordinaryMatch =
    vie.match(/[aeiou]/i);

  if (
    ordinaryMatch &&
    ordinaryMatch.index !== undefined
  ) {
    const vowel = ordinaryMatch[0];

    return (
      vie.slice(0, ordinaryMatch.index) +
      normalizeNfc(vowel + tonalMark) +
      vie.slice(
        ordinaryMatch.index + vowel.length,
      )
    );
  }

  const yMatch = vie.match(/y/i);

  if (
    yMatch &&
    yMatch.index !== undefined
  ) {
    const vowel = yMatch[0];

    return (
      vie.slice(0, yMatch.index) +
      normalizeNfc(vowel + tonalMark) +
      vie.slice(yMatch.index + vowel.length)
    );
  }

  return vie;
};

const convertTonalAstToVie = (
  ast: Syllable[],
  options: VieOptions,
  mode: RuleMode,
): string => {
  const lastSyllableIdx = ast.length - 1;
  const vieParts: string[] = [];

  const toneMarks: Record<
    number,
    string
  > = {
    1: COMBINE_MACRON,
    2: COMBINE_ACUTE,
    3: COMBINE_HOOK_ABOVE,
    4: COMBINE_GRAVE,
    5: "",
  };

  ast.forEach((syllable, index) => {
    const tone = syllable.tone ?? 5;

    if (!(tone in toneMarks)) {
      throw new Error(
        `invalid Chinese tone: ${tone}`,
      );
    }

    let vieSyl = syllableToVie(
      syllable,
      options,
      index === lastSyllableIdx,
      mode,
      index + 1 < ast.length &&
        Boolean(ast[index + 1].initial) &&
        !ast[index + 1].nucleus,
    );

    const toneMark = toneMarks[tone];

    if (toneMark) {
      const original = vieSyl;

      vieSyl = addTonalMarkToVowel(
        vieSyl,
        toneMark,
      );

      if (
        vieSyl === original &&
        !/[aeiouyâăêôơư]/i.test(vieSyl)
      ) {
        throw new Error(
          `cannot apply tone ${tone} to syllable ${vieSyl}`,
        );
      }
    }

    if (index !== 0 && vieSyl) {
      vieParts.push("-");
    }

    vieParts.push(vieSyl);
  });

  return vieParts.join("");
};

export const pinyinToVie = (
  pinyin: string,
  options: VieOptions = {},
  mode: RuleMode,
): PinyinResult => {
  const convertedOptions: VieOptions = {
    ...options,
    language: "ch",
  };

  rulesForMode(mode, "ch");

  let ast: Syllable[];

  try {
    ast = parsePinyin(pinyin) as Syllable[];
  } catch (error) {
    throw new Error(
      `could not parse pinyin input: ${pinyin}`,
      { cause: error },
    );
  }

  const vie = convertTonalAstToVie(
    ast,
    convertedOptions,
    mode,
  );

  return {
    pinyin,
    ast,
    vie,
  };
};

