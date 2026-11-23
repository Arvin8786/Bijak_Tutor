const pick = values => values[Math.floor(Math.random()*values.length)];
const number = max => 1 + Math.floor(Math.random()*max);
export function shuffle(values) {
 const result=[...values];
 for(let i=result.length-1;i>0;i--){
  const j=Math.floor(Math.random()*(i+1));
  [result[i],result[j]]=[result[j],result[i]];
 }
 return result;
}
const sample = (rows, explanation) => () => {
 const [prompt,answer,...options]=pick(rows);
 return {prompt,answer,options:shuffle([answer,...options]),explanation};
};
const math = generate => () => {
 const [prompt,answer]=generate(number(9),number(8),number(5));
 return {prompt,answer,options:shuffle([answer,answer+1,answer+2,answer+4])};
};
const order = (prompt, values) => () => {
 const answer=pick(values);
 return {prompt,answer,options:shuffle(answer),type:'order'};
};
export const games = [
 ['pairs','Word Match','Words'],
 ['sudoku','Sudoku 4 × 4','Logic'],
 ['tiles','Word Tiles vs Bot','Words'],
 ['friend','Name, Place, Food, Animal','Words'],
 ['add','Addition Dash','Maths',math((a,b)=>[`What is ${a} + ${b}?`,a+b])],
 ['subtract','Subtract and Find','Maths',math((a,b)=>[`What is ${a+b} − ${b}?`,a])],
 ['multiply','Times Table Challenge','Maths',math((a,b)=>[`What is ${a} × ${b}?`,a*b])],
 ['divide','Share Equally','Maths',math((a,b)=>[`Share ${a*b} counters equally among ${b} people. How many each?`,a])],
 ['missing','Missing Number','Maths',math((a,b)=>[`What goes in the box? □ + ${b} = ${a+b}`,a])],
 ['place-value','Place Value','Maths',math((a,b)=>[`What is the value of the tens digit in ${10*a+b}?`,10*a])],
 ['money','Market Change','Maths',math((a,b)=>[`You pay RM${a+b} for a book costing RM${b}. What is your change, in ringgit?`,a])],
 ['fractions','Fraction Kitchen','Maths',sample([['What is half of 12 slices?',6,4,8,10],['What is one quarter of 20 grapes?',5,4,10,15],['Which is larger?','3/4','1/4','1/2','1/8']])],
 ['time','Clock Detective','Maths',sample([['What time is half past two?','2:30','2:15','3:30','2:50'],['What time is quarter to five?','4:45','5:15','5:45','4:15'],['A game starts at 9:10 and lasts 20 minutes. When does it end?','9:30','9:20','10:10','9:40']])],
 ['units','Measure It','Maths',sample([['Which unit fits the length of a pencil?','Centimetres','Kilometres','Litres','Kilograms'],['Which unit fits a bag of rice?','Kilograms','Minutes','Litres','Metres'],['Which unit fits the capacity of a water bottle?','Millilitres','Kilograms','Centimetres','Hours']])],
 ['pattern','Pattern Builder','Logic',sample([['What comes next? ● ▲ ● ▲ ●','▲','●','■','◆'],['What comes next? 3, 6, 9, 12','15','14','16','18'],['What comes next? 2, 4, 8, 16','32','18','30','24']])],
 ['sequence','Number Staircase','Logic',order('Put the numbers in order from smallest to largest.',[[2,5,9,13],[6,12,18,24],[10,21,29,42]])],
 ['alphabet','Alphabet Line-Up','Words',order('Put the letters in alphabetical order.',[['B','F','J','R'],['A','G','M','S'],['C','H','P','Z']])],
 ['sentence','Sentence Builder','Words',order('Put the words in order to make a sentence.',[['A','frog','can','jump.'],['We','read','books','together.'],['Sam','likes','ripe','mangoes.']])],
 ['spelling','Spelling Scramble','Words',order('Tap the letters in order to spell the word.',[['F','R','O','G'],['B','I','R','D'],['S','T','A','R']])],
 ['rhymes','Rhyme Time','Words',sample([['Which word rhymes with light?','Kite','Leaf','Seat','Rock'],['Which word rhymes with rain?','Train','Road','Wind','Drum'],['Which word rhymes with shell?','Bell','Shoe','Seed','Boat']])],
 ['opposites','Opposite Hunt','Words',sample([['What is the opposite of smooth?','Rough','Soft','Shiny','Wet'],['What is the opposite of early?','Late','Quick','Near','Long'],['What is the opposite of empty?','Full','Light','Wide','Tall']])],
 ['homophones','Sound-Alike Detective','Words',sample([['I can ___ the bell.','Hear','Here','Hair','Her'],['The sun is bright up ___.','There','Their','They’re','Three'],['I have ___ pencils.','Two','Too','To','Tow']])],
 ['malay','Padankan Makna','Words',sample([['Which English word matches “awan”?','Cloud','River','Rain','Hill'],['Which English word matches “buku”?','Book','Pencil','Table','School'],['Which English word matches “ikan”?','Fish','Crab','Bird','Frog']])],
 ['habitat','Animal Homes','Science',sample([['Where is a clownfish most likely to live?','Coral reef','Desert dune','Tree canopy','Grassland'],['Where is a camel adapted to live?','Desert','Pond','Coral reef','Ice sheet'],['Where does an earthworm usually live?','Moist soil','Salt water','High branches','Dry sand']])],
 ['food-chain','Food Chain','Science',order('Build a food chain, starting with the producer.',[['Grass','Grasshopper','Frog','Snake'],['Algae','Zooplankton','Small fish','Large fish'],['Leaves','Caterpillar','Small bird','Hawk']])],
 ['life-cycle','Life Cycle Line-Up','Science',order('Order the stages, starting with the egg.',[['Egg','Caterpillar','Chrysalis','Butterfly'],['Egg','Tadpole','Froglet','Adult frog']])],
 ['sort-waste','Recycling Sort','Science',sample([['Which material is a clean newspaper?','Paper','Glass','Metal','Plastic'],['Which material is an empty aluminium can?','Metal','Paper','Glass','Plastic'],['Which material is a jam jar?','Glass','Paper','Food','Metal']])],
 ['matter','State of Matter','Science',sample([['What state is an ice cube?','Solid','Liquid','Gas','Plasma'],['What state is water vapour?','Gas','Liquid','Solid','Plasma'],['What state is juice in a cup?','Liquid','Gas','Solid','Plasma']])],
 ['forces','Push or Pull','Science',sample([['You draw an open drawer towards you. What do you apply?','Pull','Push','Light','Heat'],['You move a toy cart away with your hand. What do you apply?','Push','Pull','Light','Heat'],['Which force slows a book sliding across a desk?','Friction','Magnetism','Heat','Sound']])],
 ['directions','Compass Navigator','Logic',sample([['Face north, then turn right once. Which way do you face?','East','West','South','North'],['Face south, then turn left once. Which way do you face?','East','West','North','South'],['What direction is opposite east?','West','North','South','East']])],
 ['logic','Clue Detective','Logic',sample([['I have four equal sides and four right angles. What am I?','Square','Triangle','Circle','Pentagon'],['Mia is taller than Kim. Kim is taller than Lee. Who is shortest?','Lee','Kim','Mia','All equal'],['A red key opens only a red box. A blue key opens only a blue box. Which key opens the blue box?','Blue','Red','Green','Yellow']])],
 ['memory','Memory Trail','Logic',()=>({type:'memory',prompt:'Study the trail for three seconds, then rebuild it.',answer:shuffle(['★','●','▲','◆'])})],
 ['grid','Robot Grid','Logic'],
 ['perimeter','Fence Planner','Maths',math((a,b)=>[`A rectangle is ${a} m by ${b} m. How many metres of fence go all the way round?`,2*(a+b)])],
 ['elapsed','Bus Timetable','Maths',math((a,b)=>[`Your bus leaves at 9:0${a} and arrives at 9:${20+b}. How many minutes is the trip?`,20+b-a])],
 ['coordinates','Grid Address','Logic',sample([['From (2, 3), move two spaces right. Where are you?','(4, 3)','(2, 5)','(0, 3)'],['From (1, 1), move three spaces up. Where are you?','(1, 4)','(4, 1)','(3, 3)']])],
 ['materials','Materials Workshop','Science',sample([['Which property helps a raincoat work?','Water resistance','Transparency','Magnetism'],['Why choose glass for a window?','It lets light pass','It bends easily','It absorbs rain'],['Which property helps a sponge dry a spill?','Absorbency','Hardness','Shininess']])],
 ['prefix','Prefix Workshop','Words',sample([['What does rebuild mean?','Build again','Stop building','Build beneath'],['Which word means not fair?','Unfair','Refair','Prefair'],['Which word means before school?','Preschool','Reschool','Unschool']])],
 ['odd','Odd One Out','Logic',sample([['Which one is not a fruit?','Carrot','Mango','Banana','Apple'],['Which one does not have wings?','Frog','Bee','Eagle','Butterfly'],['Which number is odd?','7','2','4','8']])]
];

export const matchPairs=[['Awan','Cloud'],['Ikan','Fish'],['Buku','Book'],['Rumah','House'],['Bunga','Flower'],['Bulan','Moon'],['Pintu','Door'],['Pokok','Tree']];
export const physicalGames=[
 ['Mirror Moves','Stand an arm’s length apart. One person leads slow movements and the other mirrors them. Swap leaders after 30 seconds.'],
 ['Beanbag Targets','Mark three targets on the floor. Take turns tossing a soft beanbag from behind a line. Score one, two, or three points by distance.'],
 ['Shape Hunt','Call out a shape. Players point to an object with that shape, then explain how they recognised it. Take turns choosing the shape.'],
 ['Freeze Dance','Play music and dance with space between players. Freeze when the music stops. Try a new balance pose each round.'],
 ['Number Hop','Lay numbered paper cards on a non-slip floor or draw numbers with chalk. Call an addition clue and step to its answer.'],
 ['Pass the Pattern','Sit in a circle. The leader claps a short pattern and the next player repeats it, then adds one sound. Pass it around.'],
 ['Sink or Float Relay','Place a shallow tray of water on a stable table. Players predict whether each safe object floats, then test one at a time with an adult.'],
 ['Treasure Map','Draw a map of a room or garden. Mark a safe hiding place and guide a partner using left, right and counting steps.']
];
