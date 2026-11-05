export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const EARLY_WORDS = [
 ['A','APPLE','🍎','epal'],['B','BALL','⚽','bola'],['C','CAT','🐈','kucing'],['D','DOG','🐕','anjing'],['E','EGG','🥚','telur'],['F','FISH','🐟','ikan'],
 ['G','GOAT','🐐','kambing'],['H','HAT','🎩','topi'],['I','ICE','🧊','ais'],['J','JAM','🍓','jem'],['K','KITE','🪁','layang-layang'],['L','LION','🦁','singa'],
 ['M','MOON','🌙','bulan'],['N','NEST','🪺','sarang'],['O','ORANGE','🍊','oren'],['P','PEN','🖊️','pen'],['Q','QUEEN','👑','ratu'],['R','RAIN','🌧️','hujan'],
 ['S','SUN','☀️','matahari'],['T','TREE','🌳','pokok'],['U','UMBRELLA','☂️','payung'],['V','VAN','🚐','van'],['W','WATER','💧','air'],['X','XYLOPHONE','🎼','xilofon'],
 ['Y','YO-YO','🪀','yo-yo'],['Z','ZEBRA','🦓','zebra']
];
export const BM_SYLLABLES = [
 ['ba','baju','👕'],['bu','buku','📚'],['bo','bola','⚽'],['ma','mata','👁️'],['mi','milo','🥛'],['su','susu','🥛'],
 ['ku','kuda','🐎'],['sa','sapu','🧹'],['ro','roti','🍞'],['la','lampu','💡'],['ca','cawan','☕'],['ja','jari','🖐️']
];

export function getLetterTask(index){const i=((index%26)+26)%26;return {letter:ALPHABET[i],lower:ALPHABET[i].toLowerCase(),word:EARLY_WORDS[i][1],emoji:EARLY_WORDS[i][2],meaning:EARLY_WORDS[i][3]};}
