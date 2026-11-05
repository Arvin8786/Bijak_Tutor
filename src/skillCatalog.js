import {EXPANDED_LESSONS} from './expandedLessons.js';
export const BASE_SKILL_CATALOG = [
  {
    "id": "Y1-MATH-QUANTITY",
    "slug": "banding-kumpulan",
    "title": "Banyak, Sedikit dan Sama Banyak",
    "icon": "🍊",
    "standards": [
      "1.1.1"
    ],
    "prerequisites": [],
    "status": "demo",
    "objective": "Compare groups by pairing objects one-to-one",
    "order": 1
  },
  {
    "id": "Y1-MATH-COUNT",
    "slug": "kira-objek",
    "title": "Kira Benda 1 hingga 10",
    "icon": "🍎",
    "standards": [
      "1.2.1"
    ],
    "prerequisites": [
      "Y1-MATH-QUANTITY"
    ],
    "status": "demo",
    "objective": "Count objects and name the quantity",
    "order": 2
  },
  {
    "id": "Y1-MATH-MATCH",
    "slug": "padan-nombor",
    "title": "Padankan Benda dengan Nombor",
    "icon": "🧸",
    "standards": [
      "1.2.2"
    ],
    "prerequisites": [
      "Y1-MATH-COUNT"
    ],
    "status": "demo",
    "objective": "Match a group of objects to its numerical representation",
    "order": 3
  },
  {
    "id": "Y1-MATH-ORDER",
    "slug": "susun-nombor",
    "title": "Susun Nombor Mengikut Turutan",
    "icon": "🔢",
    "standards": [
      "1.2.2"
    ],
    "prerequisites": [
      "Y1-MATH-MATCH"
    ],
    "status": "demo",
    "objective": "Place numbers in ascending and descending order",
    "order": 4
  },
  {
    "id": "Y1-MATH-ADD",
    "slug": "tambah-kumpulan",
    "title": "Tambah dengan Objek",
    "icon": "🧸",
    "standards": [
      "2.1.1",
      "2.2.1"
    ],
    "prerequisites": [
      "Y1-MATH-COUNT"
    ],
    "status": "demo",
    "objective": "Combine groups and find total",
    "order": 5
  },
  {
    "id": "Y1-MATH-SUBTRACT",
    "slug": "tolak-kumpulan",
    "title": "Tolak dengan Benda",
    "icon": "🍎",
    "standards": [
      "2.1.1",
      "2.3.1"
    ],
    "prerequisites": [
      "Y1-MATH-COUNT"
    ],
    "status": "demo",
    "objective": "Take objects away and find remainder",
    "order": 6
  }
];
export const CURRICULUM_INFO = {
  "curriculumId": "KSSR-SEMAKAN-2017",
  "year": 1,
  "subject": "Matematik",
  "school": "SK",
  "sources": [
    "https://sites.google.com/moe-dl.edu.my/dskpskfp1/tahun-1",
    "https://ecentral.my/wp-content/uploads/2024/09/DOKUMEN-PENJAJARAN_KSSR-MATEMATIK-TAHAP-1_EDISI-3-compressed.pdf"
  ],
  "scopeNote": "Skill sequence is BijakLearn original, not a textbook chapter order. Mappings checked against published KSSR/penjajaran resources; teacher review needed before publication. SJKC/SJKT mappings not certified."
};

export const SKILL_CATALOG=[...BASE_SKILL_CATALOG,...EXPANDED_LESSONS.map((l,i)=>({id:"Y1-MATH-"+l.id.split("-").slice(-1)[0].toUpperCase(),slug:l.id,title:l.title,icon:l.icon,standards:l.standards,prerequisites:[],status:"DRAFT_TEACHER_REVIEW",objective:l.summary,chapter:l.chapter,order:BASE_SKILL_CATALOG.length+i+1}))];