Word = ws "/"? Syllable* "/"? ws
ws = " "*


Syllable =
      SyllableWithEnding
    / SyllableWithConsonant
    / SyllableBare

SyllableWithEnding =
    Stress? InitialConsonant Stress? SyllableEnding

SyllableWithConsonant =
    Stress? InitialConsonant

SyllableBare =
    Stress? SyllableEnding

SyllableEnding =
      DiphthongWithEnding
    / VowelWithEnding
    / BareDiphthong
    / BareVowel
    
DiphthongWithEnding = (Diphthong) (EndingConsonant / ApprxEndingConsonant) !(Diphthong / Vowel) 
VowelWithEnding = Vowel (EndingConsonant / ApprxEndingConsonant) !(Diphthong / Vowel) 

Diphthong = 
    Glide TrueDiphthong
    / Glide Vowel
    / TrueDiphthong

BareDiphthong =
    Diphthong !Vowel

BareVowel =
    Vowel

InitialConsonant =
      "b"
    / "tʃ"
    / "tɹ"

    # german
    / "ts"
    / "pf"

    / "t"
    / "k"
    / "z"
    / "ɹ"
    / "r"
    / "s"
    / "m"
    / "f"
    / "ɡ"
    / "n"
    / "ɫ"
    / "l"
    / "j"
    / "w"
    / "p"
    / "θ"
    / "v"
    / "h"
    / "ŋ"
    / "ʃ"
    / "ʒ"
    / "dʒ"
    / "d"
    / "ð"

    # french 
    / "ɲ"
    / "ʁ"

    # german
    / "ç"
    / "x"
    / "ʔ"

    # russian
    / "ʐ" # espeak use this letter for /ʒ/ sound, but in russian it is /ʐ/
    / "ɕ"  # espeak use this letter for /ʃ/ sound, but in russian it is /ɕ/
    / "ʑ" 
    / "ɭ"

# whatever appear in EndingConsonant or ApprxEndingConsonant needs to be mapped in ENDING_CONSONANT_MAPPING (otherwise will be mapped to null )
EndingConsonant =
# very specific for vietnamese
     "t" !"ʃ"
    / "k" !(Stress? "w")
    / "p"

    / "m"
    / "n"
    / "ŋ"

# this are mostly kept as they are for 'weak vietify' and turn to an approximate one in 'strong vietify'
ApprxEndingConsonant = 
# i purposefully only choose stop consonants and l here
     "b"
    / "ɡ"
    / "d"

    / "v"
    / "f"
    / "s"
    / "z"

    / "l"
    / "ɫ"

    # french 
    / "ʁ"
    
    #german
    / "ts"
    / "pf"

    / "r"
    / "x"
    / "ç"
# other consonant are treated as seperated syllable

Vowel =
    #fr
      "ɑ̃"
    / "ɛ̃"
    / "ɔ̃"
    / "œ̃"
    / "ø"
    / "œ"
    / "y"
    ##
    / "a"
    / "ʊ"
    / "ə"
    / "ɔ"
    / "u"
    / "ɪ"
    / "o"
    / "ɛ"
    / "e"
    / "i"
    / "ɑ"
    / "ɝ"
    / "æ"

    # german
    / "ɐ"
    / "ʏ"

    # russian
    / "ɵ"
    / "ɨ"

Stress =
      "ˈ"
    / "ˌ"


# DiphthongEnding =
#       "eɪt"
#     / "jəŋ"
#     / "eɪn"

Glide =
    "j"
    / "w"

TrueDiphthong =
      "oʊ"
    / "eɪ"
    / "aɪ"
    / "ɑɪ"
    / "aʊ"
    / "əj"
    / "ɔɪ"
    / "wa"
    / "yi"

    #german
    / "aɪ"
    / "ɔʏ"