/* Original supplementary questions. This file is packaged only for the private Apps Script backend. */
function makeMockExamPaper_(year,subject,seed){
 let state=Array.from(seed).reduce((hash,c)=>Math.imul(hash^c.charCodeAt(0),16777619),2166136261)>>>0;
 const next=n=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return Math.floor(state/4294967296*n)};
 function mix(items){
  const values=[...items];
  for(let i=values.length-1;i>0;i--){const j=next(i+1);[values[i],values[j]]=[values[j],values[i]];}
  return values;
 }
 const choice=(prompt,values,passage='')=>{
  const options=mix(values);
  return {prompt,passage,options,key:options.indexOf(values[0])};
 };
 let questions;
 if(subject==='maths'){
  const a=year<3?4+next(4):13+next(6),b=2+next(3),c=3+next(3),n=year<3?a*10+b:a*100+c*10+b;
  const definitions=[
   [`Write the number that comes after ${n}.`,n+1],
   [`What number is ${n} − ${b}?`,n-b],
   [`Farah has ${a} shells. Amir gives her ${b} more. How many does she have now?`,a+b],
   [`There are ${a+b} books. ${b} are borrowed. How many books remain?`,a],
   [`What comes next? ${2*b}, ${3*b}, ${4*b}, □.`,5*b],
   [`A jar holds ${a} beads and a second holds ${a+c}. How many beads are in the two jars altogether?`,2*a+c],
   [`There are ${c} groups of 2 children. How many children altogether?`,2*c],
   [`Aisyah has RM${a+c}. She spends RM${a}. How much is left? Write the amount in ringgit.`,c],
   [`Today is Tuesday. In how many days will it be Thursday?`,2],
   [`How many sides do ${b} separate triangles have altogether?`,3*b],
   [`A ribbon is ${a+b} cm long. A ${a} cm piece is cut off. How many centimetres are left?`,b],
   [`How many faces does a cube have?`,6]
  ];
  const stage2=[
   [`What is the value of the digit ${c} in ${c*10+b}?`,c*10],
   [`There are ${b} trays with ${c} buns on every tray. How many buns are there?`,b*c],
   [`Share ${a*b} pencils equally among ${b} pupils. How many does each get?`,a],
   [`How many centimetres are in ${b} metres?`,100*b],
   [`What is half of ${2*a}?`,a],
   [`Which is greater, ${n} or ${n-10}?`,n],
   [`Round ${a*10+7} to the nearest ten.`,(a+1)*10],
   [`A show starts at 2:15 and lasts 25 minutes. What minute will the clock show when it finishes?`,40],
   [`A toy costs RM${a+c} and a pen costs RM${b}. What is the total in ringgit?`,a+b+c],
   [`One quarter of a box of 20 crayons is red. How many crayons are red?`,5],
   [`A picture chart uses one symbol for two books. How many books do ${a} symbols represent?`,2*a],
   [`A bottle has 750 mL of water. You pour out 250 mL. How many millilitres remain?`,500]
  ];
  const stage3=[
   [`Round ${n*10+6} to the nearest ten.`,n*10+10],
   [`There are ${a} groups of ${b+c} seedlings. How many seedlings altogether?`,a*(b+c)],
   [`Share ${a*b+b-1} stickers equally among ${b} pupils, with ${b-1} stickers left over. How many does each get?`,a],
   [`Convert ${b} m and ${c*10} cm to centimetres.`,100*b+c*10],
   [`What is three quarters of ${4*a}?`,3*a],
   [`Find the perimeter in centimetres of a rectangle ${a} cm long and ${c} cm wide.`,2*(a+c)],
   [`How many minutes are in ${b} hours and 15 minutes?`,60*b+15],
   [`Hana pays RM${a+b+c} for two books costing RM${b} and RM${c}. How much change does she get in ringgit?`,a],
   [`A rectangular mat is ${a} m by ${b} m. What is its area in square metres?`,a*b],
   [`A jug has ${b} L of water. A pupil pours out 450 mL. How many millilitres are left?`,b*1000-450],
   [`Classes collected ${a} cans on Monday and ${a+b} on Tuesday. How many cans altogether?`,2*a+b],
   [`How many grams are in ${b} kg and 350 g?`,1000*b+350]
  ];
  const upper=[
   [`Find ${n} × ${b}.`,n*b],
   [`A tank holds ${b} L. It is three quarters full. How many millilitres of water does it contain?`,b*750],
   [`A bag costs RM${a*10}. It is reduced by 20%. Find the sale price in ringgit.`,a*8],
   [`What is 2.75 + ${b}.5?`,b+3.25],
   [`How many square centimetres cover a rectangle measuring ${a} cm by ${b+c} cm?`,a*(b+c)],
   [`A film starts at 14:35 and lasts ${a+60} minutes. What minute will the clock show at the end?`,35+a],
   [`The mean of two scores is ${a}. One score is ${a+b}. What is the other score?`,a-b],
   [`What is the volume in cubic centimetres of a box ${a} cm long, ${b} cm wide and ${c} cm high?`,a*b*c],
   [`A class collects ${n} g of paper each day for ${b} days. Write the total in kilograms.`,n*b/1000],
   [`A rectangular field has an area of ${a*b} square metres and width ${b} m. What is its length in metres?`,a],
   [`In a survey of ${4*a} pupils, ${a} chose football. What percentage did that represent? Write a number only.`,25],
   [`A stall sells ${a} packs for RM${a*b}. How much would ${c} packs cost at the same price per pack? Answer in ringgit.`,b*c]
  ];
  const extensions=[
   [`A car travels ${60*a} km in 3 hours at a steady speed. What is its speed in km/h?`,20*a],
   [`There are ${a*b} pupils. The ratio of adults to pupils is 1 : ${b}. How many adults are there?`,a],
   [`A RM${a*20} tablet is discounted by 15%. How many ringgit is the discount?`,3*a],
   [`A toy factory makes ${n*10} toys in one day. If 10% are set aside, how many toys is that?`,n],
   [`A rectangular box holds ${a*b*c} cubic centimetres. Its base is ${a*b} square centimetres. How many centimetres high is it?`,c],
   [`A concert ticket costs RM${a}. There is a RM2 fee per order. How much does an order for ${b} tickets cost in ringgit?`,a*b+2],
   [`A shop sold ${a-b}, ${a}, and ${a+b} loaves over three days. What was the mean number sold per day?`,a],
   [`What is 7.2 divided by 0.8?`,9],
   [`A runner finishes 3.5 laps of a 400 m track. What distance did the runner cover in metres?`,1400],
   [`A square has perimeter ${a*4} cm. Find its area in square centimetres.`,a*a],
   [`Convert 2 hours 45 minutes to decimal hours.`,2.75],
   [`An account has RM${a*20}. Its balance rises by 5%. How many ringgit are now in the account?`,a*21]
  ];
  const pairs=year===1?[[...definitions],[...stage2].filter((_,i)=>[2,5,7,8,10,11].includes(i))]:
   year===2?[definitions,stage2]:year===3?[stage2,stage3]:year===4?[stage3,upper.slice(0,6)]:year===5?[stage3,upper]:[upper,extensions];
  const wrongFor=key=>[key,key-Math.min(key,1+next(2)),key+1+next(2),key+(key>20?10:4)].map(String);
  questions=[...mix(pairs[0]).map(([prompt,key])=>choice(prompt,wrongFor(key))),...mix(pairs[1]).map(([prompt,key])=>({prompt,key}))];
 }else if(subject==='science'){
  const parse=rows=>rows.trim().split('\n').map(row=>row.trim().split('|'));
  const shared=year<=3?MOCK_SCIENCE_LOWER_:MOCK_SCIENCE_UPPER_;
  questions=mix([...parse(MOCK_SCIENCE_[year-1]),...parse(shared)]).map(([prompt,...options])=>choice(prompt,options));
 }else{
  const [passage,items]=MOCK_ENGLISH_READING_[year-1];
  const parse=rows=>rows.trim().split('\n').map(row=>row.trim().split('|'));
  questions=[
   ...parse(items).map(([prompt,...options])=>choice(prompt,options,passage)),
   ...mix(parse(year<=3?MOCK_ENGLISH_LOWER_:MOCK_ENGLISH_UPPER_)).map(([prompt,...options])=>choice(prompt,options))
  ];
 }
 return {year,title:MOCK_EXAM_SUBJECTS_[subject]+' · Year '+year,questions};
}

const MOCK_SCIENCE_=[
`Which body part helps you hear a bell?|Ears|Eyes|Nose|Hands
Which part of a plant usually takes in water from soil?|Roots|Flowers|Fruit|Leaves
A pupil wants to see the colour of a marble. Which sense is needed?|Sight|Hearing|Smell|Taste
Which one is a living thing?|A young mango plant|A pencil|A stone|A toy duck
Which object usually feels smooth?|A clean glass marble|Rough tree bark|Sandpaper|A broken rock
Which animal usually has feathers?|Chicken|Cat|Fish|Ant`,
`Both pups need something to drink every day. What should you give them?|Clean water|Salt|Soil|Cooking oil
What usually happens first when a seed starts to grow?|A small root comes out|A flower opens|Fruit becomes ripe|Leaves fall off
Which material is best for a window you need to see through?|Clear glass|Cardboard|Cloth|Wood
A magnet picks up one object. Which is most likely?|An iron paper clip|A pencil|A rubber band|A plastic lid
Which action helps save water?|Turn off the tap while brushing|Leave the tap running|Fill a bucket and pour it away|Water plants during heavy rain
Which observation shows that a chick is growing?|It becomes heavier over several weeks|It makes a sound|It blinks|It walks a few steps`,
`An ice cube was left on a plate. It became water. What change happened?|Melting|Freezing|Burning|Condensing
What is the main purpose of a lamp on a bicycle at night?|To help others see the bicycle|To make the tyres turn|To weigh down the bicycle|To make the bell louder
Two identical cups of water are put in different places. Which cup will usually dry more quickly?|A cup in warm moving air|A cup under a closed box|A cup in a fridge|A cup in a closed cupboard
Which material would best keep a person dry in rain?|Waterproof plastic|Tissue paper|Cotton wool|An open net
A ball rolls across a rough mat and stops. What slowed it?|Friction|Light|Sound|A magnet
Which instrument would you use to measure the length of a leaf?|Ruler|Thermometer|Clock|Weighing scale`,
`Which organ pumps blood around the body?|Heart|Lungs|Stomach|Skin
Why is a shadow shorter when the Sun is higher in the sky?|The light strikes the object from a steeper angle|The object always becomes smaller at noon|The Sun becomes colder|The ground stops blocking the light
Which relationship is shown by grass → grasshopper → frog?|A feeding relationship|A water cycle|The order of animal growth|A change of state
A plant bends toward a window. What best explains this?|Its shoot grows toward light|Its roots are looking for sound|It is avoiding air|The window has no light
A battery, bulb and two wires are used. What must happen for the bulb to light?|There must be a closed path through the battery and bulb|At least one wire must be left loose|The bulb must touch water|Both wires must be connected only to each other
Which change is reversible by cooling?|Melting ice|Burning paper|Cooking an egg|Rusting iron`,
`Which liquid usually evaporates fastest when all other conditions are equal?|The same liquid spread in a wide shallow dish|The same liquid in a narrow test tube|The same liquid sealed in a jar|The same liquid in a closed bottle
A bag is made of tightly woven material over a waterproof lining. What is the purpose of the lining?|To stop rain reaching the things inside|To let water soak in faster|To make the bag transparent|To make the bag conduct electricity
Which sign best supports the claim that a plant is reproducing?|It produces seeds that can germinate|A leaf casts a shadow|It takes in water|The stem bends in wind
Why is a metal spoon usually warmer at the handle than a wooden spoon after both sit in hot soup?|Metal conducts heat more readily|Wood produces cold|Metal absorbs the soup|Wood contains ice
In a closed circuit, what happens if a wire is disconnected?|The bulb goes out because the path is broken|The bulb becomes twice as bright|The battery immediately becomes larger|The circuit has two closed paths
What is the best way to compare the strength of two magnets?|Count identical paper clips each magnet can lift using the same method|Weigh each magnet once|Compare their colours|Measure their shadows`,
`What happens to the speed of sound as it moves from air into water under normal conditions?|It increases|It becomes zero|It decreases to half its value|It always stays the same
A beam balances on a pivot. What can balance a heavy load close to one side?|A lighter load farther from the pivot on the other side|A lighter load close to the pivot on the same side|Any load at the pivot|Removing the pivot
Researchers test how soil type affects drainage. Which setup is fair?|Equal soil amounts and equal water volumes in identical containers|Different soil amounts and different water volumes|A large container for one soil and a smaller one for each other soil|Different waiting times for each soil
What happens to most of the solid particles when muddy water is passed through a suitable filter?|They stay on the filter|They turn into pure water|They all dissolve immediately|They become heavier as they pass through
Which energy change happens in a working electric fan?|Electrical energy to movement, with some sound and heat|Movement energy to sunlight|Heat to stored chemical energy only|Sound energy to water
Why can a small gear turn faster than a larger gear driving it?|The small gear has fewer teeth to pass in one turn|The small gear has more teeth|The gears never touch|The gears do not rotate`
];
const MOCK_SCIENCE_LOWER_=`
Which item sinks in a bowl of water under ordinary conditions?|A small solid stone|An empty sealed plastic bottle|A piece of cork|A dry leaf floating flat
What does a healthy young plant usually need to grow?|Water and light|Paint and glue|An airtight box|Salt and cooking oil
Which animal lives most of its life in water?|Goldfish|Hen|Goat|Butterfly
Which tool is safest for picking up a hot baking tray with an adult?|Dry oven gloves|Wet paper|Bare hands|A thin sheet of plastic
Which material absorbs spilled water well?|A dry cloth|A metal sheet|A glass plate|A plastic ruler
What happens when you pull a drawer gently toward you?|It moves toward you|It turns into a liquid|It becomes lighter immediately|It always moves away
Where would a black shadow usually form when a torch shines on an opaque box?|On the side away from the torch|Inside the torch|Between the torch and the box only|In every direction equally
Which change takes place as water freezes?|It becomes solid|It becomes a gas|It turns into sand|It becomes salt
Which item would a pupil measure with a clock?|How long a song lasts|How heavy a bag is|The length of a book|How much water is in a cup
What does it mean to make an observation?|Use your senses or tools to notice what happens|Draw a picture without looking|Guess with your eyes closed|Change several things at the same time
`;
const MOCK_SCIENCE_UPPER_=`
The stem shrivels after a plant has not been watered for days. What is a sensible prediction after proper watering?|A still-living plant may become firmer|It must bloom immediately|It will turn into another species|Its leaves will always get larger in one minute
Which material transfers electricity most readily in a simple classroom circuit?|Copper wire|Dry wood|Rubber band|Glass rod
What is formed when water vapour cools into liquid droplets?|Condensation|Evaporation|Melting|Freezing
Which example is a source of renewable energy?|Sunlight|Coal|Diesel|Natural gas
Which object has the greatest friction on a dry floor under comparable conditions?|An object with a rough rubber base|The same object on a polished sliding plate|The same object on free-turning wheels|The same object on ice
A pupil changes the distance between a torch and a block. What should be kept the same when testing shadow size?|The same block and screen position|The distance being tested|A different screen for each reading|The direction of the torch should change each time
Which observation shows dissolving?|Salt grains disappear from view in stirred water|Sand settles in water|A coin sinks to the bottom|Wax floats on water
Which part of a food chain would be affected first if most grass disappeared?|The animals that eat the grass directly|Predators that never feed nearby|The rocks under the grass|The Sun
What helps make an experimental result more reliable?|Repeat the same test and compare results|Change all conditions each time|Record only results that fit the prediction|Use a different measuring tool for each group
Which substance is usually formed when iron rusts?|Iron oxide|Pure water|Sodium chloride|Carbon dioxide only
`;

const MOCK_ENGLISH_READING_=[
 ['Mina woke up early on Saturday. She put on a red hat and walked to the park with her brother. They took a small ball and played near a big tree. When it began to rain, they went home.',`
Which day did Mina go to the park?|Saturday|Tuesday|Sunday|Friday
What colour was her hat?|Red|Blue|Yellow|White
Who went with Mina?|Her brother|Her aunt|Her friend|Her teacher
What did they play with?|A ball|A kite|A skipping rope|A toy car
Why did they leave the park?|It began to rain|It got dark|They lost the ball|The park was closed
Where did they play?|Near a big tree|By a bridge|Inside a shop|Under a table`],
 ['Jay found a small kitten outside the school library. It was hiding under a bench. Jay did not touch it. He told his teacher, who called a nearby animal shelter. A worker brought a carrier and took the kitten somewhere safe.',`
Where was the kitten hiding?|Under a bench|Behind a door|On a roof|Inside a carrier
What did Jay do first to get help?|He told his teacher|He took the kitten home|He called his brother|He opened a book
The word carrier most likely means what here?|A container for moving an animal|A coat|An animal's food|A school chair
Who came to help the kitten?|An animal shelter worker|A bus driver|A librarian|Jay’s brother
What happened last?|The worker took the kitten somewhere safe|Jay found the kitten|The teacher called the shelter|The kitten hid under a bench
Which word best describes Jay’s choice to ask a teacher?|Sensible|Noisy|Careless|Sleepy`],
 ['On Monday, Class 3A started a small herb garden. First, pupils filled used cartons with soil. Then they planted seeds and wrote labels for each carton. One group watered the plants, and another group recorded how tall the shoots grew. By Friday, tiny green leaves had appeared in two of the cartons.',`
What did pupils use as pots?|Used cartons|Glass jars|Metal cans|Paper bags
Why did they write labels?|To identify which seeds were planted|To stop the plants from growing|To measure the wind|To show who was absent
What did the recording group measure?|The height of the shoots|The weight of the cartons|The number of pupils|The price of the soil
By what day did they notice leaves?|Friday|Monday|Tuesday|Sunday
Which step came first?|Fill the cartons with soil|Write down shoot heights|Notice tiny leaves|Water the growing plants
Which of these is the best title?|A Garden in Our Classroom|A Trip to the Sea|After-School Football|How to Cook Vegetables`],
 ['Our library used to attract few pupils at lunchtime. The books were arranged by height, so pupils found it difficult to choose a title. A committee replaced the old labels with signs such as Adventure, Facts and Mysteries. Borrowing increased within a fortnight. The committee then surveyed pupils to find out which books to buy next.',`
Why did pupils find books difficult to choose?|The shelves were arranged by height|The library was locked all day|All the books were the same|Borrowing was too expensive
What did the committee change?|It grouped books by type|It replaced every book|It removed all signs|It closed at lunchtime
What does fortnight mean?|Two weeks|One night|One month|One day
What does the increase in borrowing suggest?|Pupils found it easier or more appealing to choose books|The new signs made borrowing impossible|The library lent fewer books|The committee surveyed no one
Why did the committee survey pupils?|To decide which books to buy next|To count the shelves|To measure book heights|To change lunch times
Which event happened first?|The library attracted few pupils at lunchtime|The committee surveyed pupils|Borrowing increased|The signs showed Mysteries`],
 ['When Anya built her model bridge, she made two designs. The first consisted of a flat strip of folded paper. The second had triangular supports underneath. To compare them fairly, she used equal lengths of the same paper and added identical weights one at a time. The second bridge held more. Her partner suggested testing both bridges again before drawing a firm conclusion.',`
Why did both designs use equal lengths of the same paper?|To keep the comparison fair|To give the second bridge an advantage|To make the first bridge heavier|To avoid using weights
Which design held more weight?|The one with triangular supports|The flat strip|Both held the same|Neither held a weight
What does consisted of mean here?|Was made up of|Had to carry|Was stronger than|Was drawn beside
Why were weights added one at a time?|To find how much each design could hold before failing|To make both designs look alike|To stop the paper from being folded|To measure the length of the paper
What did the partner want to improve by repeating the test?|The reliability of the finding|The colour of the paper|The cost of the model|The size of the classroom
Which is the best summary?|Anya compared two bridges under the same conditions|Anya built a full-size bridge for the class|Anya chose a paper colour for a poster|Anya decided weights could never be used in tests`],
 ['The town introduced a weekend market for neighbours to sell or repair used items. At first, stallholders were sceptical about demand for repaired goods. In the first month, more shoppers than expected brought broken lamps and small appliances. Organisers recorded both repaired items and items still awaiting parts, then asked for a separate repair space. They argued that this would give shoppers room to browse while volunteers worked safely.',`
What was one purpose of the market?|To help people repair used items|To sell new appliances only|To move volunteers out of town|To collect rent from neighbours
What does sceptical mean in this passage?|Doubtful|Delighted|Furious|Certain
Which event challenged the stallholders' initial belief?|More shoppers than expected brought broken items|Volunteers stopped repairing anything|The market was cancelled|Nobody visited during the first month
What distinction did the organisers record?|Repaired items and items awaiting parts|New items and advertised items|Items bought by children and adults|Indoor items and outdoor items
Why did organisers ask for a separate repair space?|To make browsing easier and repair work safer|To keep all shoppers out|To sell all appliances at one price|To stop collecting records
Which statement is supported by the passage?|The proposal was based on what organisers observed at the market|All repaired goods were sold in the first month|Every broken item was beyond repair|The volunteers planned to leave permanently`]
];
const MOCK_ENGLISH_LOWER_=`
Choose the question with correct punctuation.|Where is my bag?|Where is my bag.|where is my bag?|Where is my bag!
There ___ three apples on the table.|are|is|am|be
Which word means the opposite of empty?|Full|Slow|Cold|Small
We ___ to school yesterday.|walked|walks|walking|walk
Which word is a person?|Teacher|Table|River|Pencil
I saw ___ elephant at the zoo.|an|a|many|any
Which sentence uses a capital letter correctly?|Rina likes to swim.|rina likes to Swim.|Rina Likes To Swim.|rina likes to swim.
Choose the correct plural of box.|Boxes|Boxs|Boxies|Boxen
The children ___ playing in the field now.|are|is|am|be
Which sentence tells someone what to do?|Please close the door.|The door is blue.|Where is the door?|There are two doors.
`;
const MOCK_ENGLISH_UPPER_=`
Choose the sentence with correct agreement.|Neither answer is correct.|Neither answer are correct.|Neither answers is correct.|Neither answer were correct.
We stayed indoors ___ it was raining.|because|unless|although|or
Which word is closest in meaning to cautious?|Careful|Careless|Eager|Sudden
By the time we reached the hall, the meeting ___ already begun.|had|has|have|having
Which sentence shows a contrast?|The trail was steep, but we kept climbing.|We packed food because we were hungry.|We stopped when the bell rang.|We brought a bottle and a hat.
Choose the correctly punctuated sentence.|After dinner, Mia washed the dishes.|After dinner Mia, washed the dishes.|After, dinner Mia washed the dishes.|After dinner Mia washed, the dishes.
The words very old can best be replaced by which word when describing a ruin?|Ancient|Modern|Recent|New
Which phrase signals a conclusion?|Therefore|For example|Meanwhile|At first
Choose the sentence written in the passive voice.|The poster was painted by Kamal.|Kamal painted the poster.|Kamal is painting the poster.|Kamal will paint the poster.
If I ___ more time, I would finish the model today.|had|have|has|will have
`;
