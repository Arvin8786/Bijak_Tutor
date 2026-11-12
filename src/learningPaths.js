export const PATHS = [
 {id:'addition', icon:'➕', title:'Addition Lab · Tambah', year:1, subject:'Matematik',
  lessons:['y1-math-add','explore-math','review-math-y1'], tool:'addition',
  instructions:'Build both groups, then count how many counters there are altogether.'},
 {id:'time', icon:'🕒', title:'Clock Lab · Belajar Jam', year:3, subject:'Matematik',
  lessons:['discover-duration'], tool:'time',
  instructions:'Move the clock in five-minute or one-hour steps. Set the hands to the target time.'},
 {id:'fractions', icon:'📏', title:'Fraction Lab · Pecahan', year:4, subject:'Matematik',
  lessons:['jr-math-4-1','review-math-y4'], tool:'fractions',
  instructions:'Divide the number line into equal parts, then move the marker to the target fraction.'},
 {id:'science', icon:'🔦', title:'Shadow Lab · Cahaya dan Bayang', year:4, subject:'Sains',
  lessons:['discover-shadow-distance'], tool:'science',
  instructions:'Predict what happens to the shadow when the card moves closer to the lamp. Then run the model.'},
];

export function missedQuestions(attempts, learner, lessons) {
 const lookup = new Map(lessons.map(lesson => [lesson.id, lesson]));
 const missed = [];
 for (const [key, skill] of Object.entries(attempts)) {
  const [owner, lessonId] = key.split('/');
  if (owner !== learner) continue;
  const lesson = lookup.get(lessonId);
  if (!lesson) continue;
  const latest = new Map(skill.attempts.map(attempt => [attempt.questionId, attempt]));
  for (const attempt of latest.values()) {
   const question = lesson.check.find(item => item.id === attempt.questionId);
   if (!attempt.correct && question) missed.push({lesson, question, at: attempt.at});
  }
 }
 return missed.sort((a,b) => Date.parse(b.at) - Date.parse(a.at));
}
