/* Curated independent mathematics practice for specific Tahun 2–6 foundation skills. Units are shown where appropriate. */
export const MATH_GRADED_PRACTICE = {
  "jr-math-2-1": [
    [
      "Dalam 635, berapakah nilai digit 6?",
      "600"
    ],
    [
      "Dalam 472, berapakah nilai digit 7?",
      "70"
    ],
    [
      "Dalam 809, berapakah nilai digit 9?",
      "9"
    ],
    [
      "Dalam 341, berapakah nilai digit 4?",
      "40"
    ]
  ],
  "jr-math-2-2": [
    [
      "26 + 17 = ?",
      "43"
    ],
    [
      "48 + 26 = ?",
      "74"
    ],
    [
      "59 + 13 = ?",
      "72"
    ],
    [
      "37 + 28 = ?",
      "65"
    ]
  ],
  "jr-math-3-1": [
    [
      "6 kumpulan dengan 4 biji setiap kumpulan = ?",
      "24"
    ],
    [
      "7 × 3 = ?",
      "21"
    ],
    [
      "5 × 8 = ?",
      "40"
    ],
    [
      "9 × 2 = ?",
      "18"
    ]
  ],
  "jr-math-3-2": [
    [
      "24 gula-gula dibahagi kepada 4 kanak-kanak. Setiap seorang dapat berapa?",
      "6"
    ],
    [
      "18 ÷ 3 = ?",
      "6"
    ],
    [
      "28 ÷ 7 = ?",
      "4"
    ],
    [
      "32 objek dibahagi sama rata kepada 8 kumpulan. Setiap kumpulan ada berapa?",
      "4"
    ]
  ],
  "jr-math-4-1": [
    [
      "Pecahan setara bagi 1/3 ialah?",
      "2/6"
    ],
    [
      "Pecahan setara bagi 3/4 ialah?",
      "6/8"
    ],
    [
      "Pecahan setara bagi 2/5 ialah?",
      "4/10"
    ],
    [
      "Pecahan setara bagi 1/4 ialah?",
      "2/8"
    ]
  ],
  "jr-math-4-2": [
    [
      "Perimeter segi empat tepat 7 cm × 2 cm ialah?",
      "18"
    ],
    [
      "Perimeter segi empat sama sisi 6 cm ialah?",
      "24"
    ],
    [
      "Perimeter segi empat tepat 6 cm × 4 cm ialah?",
      "20"
    ],
    [
      "Perimeter segi empat tepat 9 cm × 3 cm ialah?",
      "24"
    ]
  ],
  "jr-math-5-1": [
    [
      "0.25 bersamaan pecahan yang mana?",
      "1/4"
    ],
    [
      "0.75 bersamaan pecahan yang mana?",
      "3/4"
    ],
    [
      "0.2 bersamaan pecahan yang mana?",
      "1/5"
    ],
    [
      "0.1 bersamaan pecahan yang mana?",
      "1/10"
    ]
  ],
  "jr-math-5-2": [
    [
      "Luas segi empat tepat 7 cm × 3 cm ialah?",
      "21"
    ],
    [
      "Luas segi empat tepat 9 cm × 5 cm ialah?",
      "45"
    ],
    [
      "Luas segi empat tepat 8 cm × 4 cm ialah?",
      "32"
    ],
    [
      "Luas segi empat tepat 12 cm × 2 cm ialah?",
      "24"
    ]
  ],
  "jr-math-6-1": [
    [
      "50% bersamaan pecahan yang mana?",
      "1/2"
    ],
    [
      "10% bersamaan pecahan yang mana?",
      "1/10"
    ],
    [
      "75% bersamaan pecahan yang mana?",
      "3/4"
    ],
    [
      "20% bersamaan pecahan yang mana?",
      "1/5"
    ]
  ],
  "jr-math-6-2": [
    [
      "Isipadu kuboid 3 × 3 × 2 cm ialah?",
      "18"
    ],
    [
      "Isipadu kuboid 4 × 2 × 5 cm ialah?",
      "40"
    ],
    [
      "Isipadu kuboid 5 × 2 × 3 cm ialah?",
      "30"
    ],
    [
      "Isipadu kuboid 6 × 4 × 2 cm ialah?",
      "48"
    ]
  ]
};
export function withMathPractice(lessons){return lessons.map(l=>{const items=MATH_GRADED_PRACTICE[l.id];if(!items)return l;return {...l,check:[...l.check,...items.map(([text,answer],i)=>({id:l.id+'-math-'+(i+1),mode:'text',text,answer,transfer:i>=2,why:'Semak langkah pengiraan dan bandingkan jawapan anda: '+answer}))]};})}
