// Parent dashboard language. BijakLearn Team and parent consoles are English by default;
// only a parent can choose another language, and the choice is remembered on this device.
export const PORTAL_LANGUAGES=[['en','English'],['ms','Bahasa Melayu'],['zh','中文'],['ta','தமிழ்']];
const KEY='bijaklearn:portal-language:v1';
export const readPortalLanguage=()=>{try{const v=localStorage.getItem(KEY);return PORTAL_LANGUAGES.some(l=>l[0]===v)?v:'en'}catch{return 'en'}};
export const writePortalLanguage=code=>{try{localStorage.setItem(KEY,code)}catch{}};

// Keys are the English strings used in the parent dashboard.
export const PORTAL_COPY={
 ms:{
  'Add a child':'Tambah anak',
  'Linked children':'Anak yang dipautkan','No linked children yet.':'Belum ada anak yang dipautkan.','View progress':'Lihat kemajuan','Edit profile':'Edit profil','Show all child reports':'Lihat semua laporan anak','Preschool':'Prasekolah','Save profile':'Simpan profil','Cancel':'Batal',
  'Child reports':'Laporan anak','Enrol a child':'Daftar anak','Comments & suggestions':'Komen & cadangan','Membership & payments':'Keahlian & pembayaran','Referrals & earnings':'Rujukan & pendapatan','Premium Kasih':'Premium Kasih',
  'Parent dashboard':'Papan pemuka ibu bapa','Sign out':'Log keluar','Parent navigation':'Navigasi ibu bapa','YOUR FAMILY SPACE':'RUANG KELUARGA ANDA',
  'Private reports for children linked to your verified parent Google account.':'Laporan peribadi untuk anak yang dipautkan ke akaun Google ibu bapa anda yang telah disahkan.','Language':'Bahasa','Saved successfully.':'Berjaya disimpan.',
  'Family reports':'Laporan keluarga','Google account access is checked by the server.':'Akses akaun Google disemak oleh pelayan.',
  'Results below come from server-marked lesson checks. Games and practice that do not submit an assessment are not counted as test results. Reported activity time excludes hidden pages and extended inactivity and is approximate.':'Keputusan di bawah datang daripada semakan pelajaran yang ditanda oleh pelayan. Permainan dan latihan yang tidak menghantar penilaian tidak dikira sebagai keputusan ujian. Masa aktiviti yang dilaporkan tidak termasuk halaman tersembunyi dan tempoh tidak aktif yang panjang, dan merupakan anggaran.',
  'No children are paired yet. Enrol a child and add their separate Google account from Enrol a child.':'Belum ada anak yang dipasangkan. Daftar anak dan tambah akaun Google berasingan mereka daripada Daftar anak.',
  'Year':'Tahun','Test attempts':'Percubaan ujian','Correct answers':'Jawapan betul','Accuracy':'Ketepatan','No tests yet':'Belum ada ujian','Practice milestones':'Pencapaian latihan','Reported learning time':'Masa belajar dilaporkan',
  'Daily usage':'Penggunaan harian','No usage reported yet.':'Belum ada penggunaan dilaporkan.','Recent test results':'Keputusan ujian terkini','Correct':'Betul','Needs practice':'Perlu latihan','hints':'petunjuk','No test results yet.':'Belum ada keputusan ujian.','Refresh child reports':'Muat semula laporan anak',
'Parent account:':'Akaun ibu bapa:',
  'Child nickname':'Nama panggilan anak','Student Google email':'E-mel Google pelajar','School year':'Tahun persekolahan','School stream':'Aliran sekolah','Learning language':'Bahasa pembelajaran',
  'I am the parent or guardian and consent to pairing this student account and viewing its learning reports.':'Saya ibu bapa atau penjaga dan bersetuju memasangkan akaun pelajar ini serta melihat laporan pembelajarannya.',

  'Add child account':'Tambah akaun anak','Enrolment requests':'Permintaan pendaftaran','No enrolment requests yet.':'Belum ada permintaan pendaftaran.',
  'Share a comment or improvement idea':'Kongsi komen atau idea penambahbaikan','Category':'Kategori','Improvement suggestion':'Cadangan penambahbaikan','Comment':'Komen','Report an issue':'Laporkan masalah','Your message':'Mesej anda',
  'Please do not include passwords, payment-card details or sensitive documents.':'Sila jangan sertakan kata laluan, butiran kad pembayaran atau dokumen sensitif.','Send to BijakLearn Team':'Hantar kepada pentadbir','Your messages and replies':'Mesej dan balasan anda','BijakLearn Team reply':'Balasan pentadbir','No messages yet.':'Belum ada mesej.'
 },
 zh:{
  'Add a child':'添加孩子',
  'Linked children':'已关联的孩子','No linked children yet.':'尚未关联孩子。','View progress':'查看进度','Edit profile':'编辑档案','Show all child reports':'查看所有孩子的报告','Preschool':'学前班','Save profile':'保存档案','Cancel':'取消',
  'Child reports':'孩子报告','Enrol a child':'登记孩子','Comments & suggestions':'意见与建议','Membership & payments':'会员与付款','Referrals & earnings':'推荐与收益','Premium Kasih':'Premium Kasih',
  'Parent dashboard':'家长控制台','Sign out':'退出登录','Parent navigation':'家长导航','YOUR FAMILY SPACE':'您的家庭空间',
  'Private reports for children linked to your verified parent Google account.':'仅限已关联到您已验证的家长 Google 账户的孩子的私人报告。','Language':'语言','Saved successfully.':'保存成功。',
  'Family reports':'家庭报告','Google account access is checked by the server.':'Google 账户访问由服务器验证。',
  'Results below come from server-marked lesson checks. Games and practice that do not submit an assessment are not counted as test results. Reported activity time excludes hidden pages and extended inactivity and is approximate.':'以下结果来自由服务器批改的课程检测。未提交评估的游戏和练习不计入测试结果。所报告的活动时间不包括隐藏页面和长时间无操作，仅为大约数值。',
  'No children are paired yet. Enrol a child and add their separate Google account from Enrol a child.':'尚未关联任何孩子。请在“登记孩子”中登记孩子并添加其独立的 Google 账户。',
  'Year':'年级','Test attempts':'测试次数','Correct answers':'答对题数','Accuracy':'正确率','No tests yet':'暂无测试','Practice milestones':'练习里程碑','Reported learning time':'报告的学习时间',
  'Daily usage':'每日使用','No usage reported yet.':'暂无使用记录。','Recent test results':'最近的测试结果','Correct':'正确','Needs practice':'需要练习','hints':'次提示','No test results yet.':'暂无测试结果。','Refresh child reports':'刷新孩子报告',
'Parent account:':'家长账户：',
  'Child nickname':'孩子昵称','Student Google email':'学生 Google 电子邮件','School year':'就读年级','School stream':'学校类型','Learning language':'学习语言',
  'I am the parent or guardian and consent to pairing this student account and viewing its learning reports.':'我是家长或监护人，同意关联此学生账户并查看其学习报告。',

  'Add child account':'添加孩子账户','Enrolment requests':'登记申请','No enrolment requests yet.':'暂无登记申请。',
  'Share a comment or improvement idea':'分享意见或改进想法','Category':'类别','Improvement suggestion':'改进建议','Comment':'意见','Report an issue':'报告问题','Your message':'您的留言',
  'Please do not include passwords, payment-card details or sensitive documents.':'请勿包含密码、支付卡信息或敏感文件。','Send to BijakLearn Team':'发送给管理员','Your messages and replies':'您的留言和回复','BijakLearn Team reply':'管理员回复','No messages yet.':'暂无留言。'
 },
 ta:{
  'Add a child':'குழந்தையைச் சேர்க்கவும்',
  'Linked children':'இணைக்கப்பட்ட குழந்தைகள்','No linked children yet.':'இதுவரை எந்தக் குழந்தையும் இணைக்கப்படவில்லை.','View progress':'முன்னேற்றத்தைக் காண்க','Edit profile':'சுயவிவரத்தைத் திருத்து','Show all child reports':'அனைத்து குழந்தைகளின் அறிக்கைகளையும் காண்க','Preschool':'முன்பள்ளி','Save profile':'சுயவிவரத்தைச் சேமி','Cancel':'ரத்துசெய்',
  'Child reports':'குழந்தை அறிக்கைகள்','Enrol a child':'குழந்தையைப் பதிவு செய்','Comments & suggestions':'கருத்துகள் & பரிந்துரைகள்','Membership & payments':'உறுப்பினர் & கட்டணங்கள்','Referrals & earnings':'பரிந்துரைகள் & வருவாய்','Premium Kasih':'Premium Kasih',
  'Parent dashboard':'பெற்றோர் முகப்புப் பலகை','Sign out':'வெளியேறு','Parent navigation':'பெற்றோர் வழிசெலுத்தல்','YOUR FAMILY SPACE':'உங்கள் குடும்ப இடம்',
  'Private reports for children linked to your verified parent Google account.':'உங்கள் சரிபார்க்கப்பட்ட பெற்றோர் Google கணக்குடன் இணைக்கப்பட்ட குழந்தைகளுக்கான தனிப்பட்ட அறிக்கைகள்.','Language':'மொழி','Saved successfully.':'வெற்றிகரமாகச் சேமிக்கப்பட்டது.',
  'Family reports':'குடும்ப அறிக்கைகள்','Google account access is checked by the server.':'Google கணக்கு அணுகல் சேவையகத்தால் சரிபார்க்கப்படுகிறது.',
  'Results below come from server-marked lesson checks. Games and practice that do not submit an assessment are not counted as test results. Reported activity time excludes hidden pages and extended inactivity and is approximate.':'கீழே உள்ள முடிவுகள் சேவையகம் மதிப்பிட்ட பாடச் சோதனைகளிலிருந்து வருகின்றன. மதிப்பீட்டைச் சமர்ப்பிக்காத விளையாட்டுகளும் பயிற்சிகளும் தேர்வு முடிவுகளாகக் கணக்கிடப்படாது. பதிவான செயல்பாட்டு நேரத்தில் மறைந்த பக்கங்களும் நீண்ட செயலற்ற நேரமும் சேர்க்கப்படாது; இது தோராயமானது.',
  'No children are paired yet. Enrol a child and add their separate Google account from Enrol a child.':'இன்னும் குழந்தைகள் இணைக்கப்படவில்லை. “குழந்தையைப் பதிவு செய்” பகுதியில் குழந்தையைப் பதிவு செய்து அவர்களின் தனி Google கணக்கைச் சேர்க்கவும்.',
  'Year':'ஆண்டு','Test attempts':'தேர்வு முயற்சிகள்','Correct answers':'சரியான விடைகள்','Accuracy':'துல்லியம்','No tests yet':'இன்னும் தேர்வுகள் இல்லை','Practice milestones':'பயிற்சி மைல்கற்கள்','Reported learning time':'பதிவான கற்றல் நேரம்',
  'Daily usage':'தினசரி பயன்பாடு','No usage reported yet.':'இன்னும் பயன்பாடு பதிவாகவில்லை.','Recent test results':'சமீபத்திய தேர்வு முடிவுகள்','Correct':'சரி','Needs practice':'பயிற்சி தேவை','hints':'குறிப்புகள்','No test results yet.':'இன்னும் தேர்வு முடிவுகள் இல்லை.','Refresh child reports':'குழந்தை அறிக்கைகளைப் புதுப்பி',
'Parent account:':'பெற்றோர் கணக்கு:',
  'Child nickname':'குழந்தையின் செல்லப் பெயர்','Student Google email':'மாணவரின் Google மின்னஞ்சல்','School year':'பள்ளி ஆண்டு','School stream':'பள்ளி வகை','Learning language':'கற்றல் மொழி',
  'I am the parent or guardian and consent to pairing this student account and viewing its learning reports.':'நான் பெற்றோர் அல்லது பாதுகாவலர்; இந்த மாணவர் கணக்கை இணைக்கவும் அதன் கற்றல் அறிக்கைகளைப் பார்க்கவும் சம்மதிக்கிறேன்.',

  'Add child account':'குழந்தை கணக்கைச் சேர்','Enrolment requests':'பதிவு கோரிக்கைகள்','No enrolment requests yet.':'இன்னும் பதிவு கோரிக்கைகள் இல்லை.',
  'Share a comment or improvement idea':'கருத்து அல்லது மேம்பாட்டு யோசனையைப் பகிருங்கள்','Category':'வகை','Improvement suggestion':'மேம்பாட்டுப் பரிந்துரை','Comment':'கருத்து','Report an issue':'சிக்கலைப் புகாரளி','Your message':'உங்கள் செய்தி',
  'Please do not include passwords, payment-card details or sensitive documents.':'கடவுச்சொற்கள், கட்டண அட்டை விவரங்கள் அல்லது உணர்திறன் ஆவணங்களைச் சேர்க்க வேண்டாம்.','Send to BijakLearn Team':'நிர்வாகிக்கு அனுப்பு','Your messages and replies':'உங்கள் செய்திகளும் பதில்களும்','BijakLearn Team reply':'நிர்வாகியின் பதில்','No messages yet.':'இன்னும் செய்திகள் இல்லை.'
 }
};
export const portalText=(language,text)=>language==='en'?text:(PORTAL_COPY[language]?.[text]??text);
