// Parent dashboard language. Administrator and parent consoles are English by default;
// only a parent can choose another language, and the choice is remembered on this device.
export const PORTAL_LANGUAGES=[['en','English'],['ms','Bahasa Melayu'],['zh','中文'],['ta','தமிழ்']];
const KEY='bijaklearn:portal-language:v1';
export const readPortalLanguage=()=>{try{const v=localStorage.getItem(KEY);return PORTAL_LANGUAGES.some(l=>l[0]===v)?v:'en'}catch{return 'en'}};
export const writePortalLanguage=code=>{try{localStorage.setItem(KEY,code)}catch{}};

// Keys are the English strings used in the parent dashboard.
export const PORTAL_COPY={
 ms:{
  'Child reports':'Laporan anak','Enrol a child':'Daftar anak','Comments & suggestions':'Komen & cadangan','Membership & payments':'Keahlian & pembayaran','Referrals & earnings':'Rujukan & pendapatan','Premium Kasih':'Premium Kasih',
  'Parent dashboard':'Papan pemuka ibu bapa','Growing together, every day':'Membesar bersama, setiap hari','Sign out':'Log keluar','Parent navigation':'Navigasi ibu bapa','YOUR FAMILY SPACE':'RUANG KELUARGA ANDA',
  'Every small step counts.':'Setiap langkah kecil bermakna.','Celebrate curiosity, effort and the joy of learning.':'Raikan rasa ingin tahu, usaha dan kegembiraan belajar.','CHEER ON THEIR NEXT DISCOVERY':'SORAK PENEMUAN SETERUSNYA',
  'Private reports for children linked to your verified parent Google account.':'Laporan peribadi untuk anak yang dipautkan ke akaun Google ibu bapa anda yang telah disahkan.','Language':'Bahasa','Saved successfully.':'Berjaya disimpan.',
  'Family reports':'Laporan keluarga','Google account access is checked by the server.':'Akses akaun Google disemak oleh pelayan.',
  'Results below come from server-marked lesson checks. Games and practice that do not submit an assessment are not counted as test results. Reported activity time excludes hidden pages and extended inactivity and is approximate.':'Keputusan di bawah datang daripada semakan pelajaran yang ditanda oleh pelayan. Permainan dan latihan yang tidak menghantar penilaian tidak dikira sebagai keputusan ujian. Masa aktiviti yang dilaporkan tidak termasuk halaman tersembunyi dan tempoh tidak aktif yang panjang, dan merupakan anggaran.',
  'No children are paired yet. Enrol a child and add their separate Google account from Enrol a child.':'Belum ada anak yang dipasangkan. Daftar anak dan tambah akaun Google berasingan mereka daripada Daftar anak.',
  'Year':'Tahun','Test attempts':'Percubaan ujian','Correct answers':'Jawapan betul','Accuracy':'Ketepatan','No tests yet':'Belum ada ujian','Practice milestones':'Pencapaian latihan','Reported learning time':'Masa belajar dilaporkan',
  'Daily usage':'Penggunaan harian','No usage reported yet.':'Belum ada penggunaan dilaporkan.','Recent test results':'Keputusan ujian terkini','Correct':'Betul','Needs practice':'Perlu latihan','hints':'petunjuk','No test results yet.':'Belum ada keputusan ujian.','Refresh child reports':'Muat semula laporan anak',
  'Link a child’s Google account':'Pautkan akaun Google anak','Parent account:':'Akaun ibu bapa:','This pairing comes from your verified sign-in and cannot be changed by typing another parent’s address.':'Pasangan ini datang daripada log masuk anda yang telah disahkan dan tidak boleh diubah dengan menaip alamat ibu bapa lain.',
  'Child nickname':'Nama panggilan anak','Student Google email':'E-mel Google pelajar','School year':'Tahun persekolahan','School stream':'Aliran sekolah','Learning language':'Bahasa pembelajaran',
  'I am the parent or guardian and consent to pairing this student account and viewing its learning reports.':'Saya ibu bapa atau penjaga dan bersetuju memasangkan akaun pelajar ini serta melihat laporan pembelajarannya.',
  'Your Google-verified parent account authorizes this link immediately. The child must sign in with that Google account. Only an administrator can remove or change a link. Children beyond paid Premium slots use Free modules until the extra RM30 payment is approved.':'Akaun ibu bapa anda yang disahkan Google membenarkan pautan ini serta-merta. Anak mesti log masuk dengan akaun Google itu. Hanya pentadbir boleh membuang atau menukar pautan. Anak melebihi slot Premium berbayar menggunakan modul Percuma sehingga bayaran tambahan RM30 diluluskan.',
  'Add child account':'Tambah akaun anak','Enrolment requests':'Permintaan pendaftaran','No enrolment requests yet.':'Belum ada permintaan pendaftaran.',
  'Share a comment or improvement idea':'Kongsi komen atau idea penambahbaikan','Category':'Kategori','Improvement suggestion':'Cadangan penambahbaikan','Comment':'Komen','Report an issue':'Laporkan masalah','Your message':'Mesej anda',
  'Please do not include passwords, payment-card details or sensitive documents.':'Sila jangan sertakan kata laluan, butiran kad pembayaran atau dokumen sensitif.','Send to administrator':'Hantar kepada pentadbir','Your messages and replies':'Mesej dan balasan anda','Administrator reply':'Balasan pentadbir','No messages yet.':'Belum ada mesej.'
 },
 zh:{
  'Child reports':'孩子报告','Enrol a child':'登记孩子','Comments & suggestions':'意见与建议','Membership & payments':'会员与付款','Referrals & earnings':'推荐与收益','Premium Kasih':'Premium Kasih',
  'Parent dashboard':'家长控制台','Growing together, every day':'每一天，一起成长','Sign out':'退出登录','Parent navigation':'家长导航','YOUR FAMILY SPACE':'您的家庭空间',
  'Every small step counts.':'每一小步都有意义。','Celebrate curiosity, effort and the joy of learning.':'为好奇心、努力和学习的快乐喝彩。','CHEER ON THEIR NEXT DISCOVERY':'为他们的下一个发现加油',
  'Private reports for children linked to your verified parent Google account.':'仅限已关联到您已验证的家长 Google 账户的孩子的私人报告。','Language':'语言','Saved successfully.':'保存成功。',
  'Family reports':'家庭报告','Google account access is checked by the server.':'Google 账户访问由服务器验证。',
  'Results below come from server-marked lesson checks. Games and practice that do not submit an assessment are not counted as test results. Reported activity time excludes hidden pages and extended inactivity and is approximate.':'以下结果来自由服务器批改的课程检测。未提交评估的游戏和练习不计入测试结果。所报告的活动时间不包括隐藏页面和长时间无操作，仅为大约数值。',
  'No children are paired yet. Enrol a child and add their separate Google account from Enrol a child.':'尚未关联任何孩子。请在“登记孩子”中登记孩子并添加其独立的 Google 账户。',
  'Year':'年级','Test attempts':'测试次数','Correct answers':'答对题数','Accuracy':'正确率','No tests yet':'暂无测试','Practice milestones':'练习里程碑','Reported learning time':'报告的学习时间',
  'Daily usage':'每日使用','No usage reported yet.':'暂无使用记录。','Recent test results':'最近的测试结果','Correct':'正确','Needs practice':'需要练习','hints':'次提示','No test results yet.':'暂无测试结果。','Refresh child reports':'刷新孩子报告',
  'Link a child’s Google account':'关联孩子的 Google 账户','Parent account:':'家长账户：','This pairing comes from your verified sign-in and cannot be changed by typing another parent’s address.':'此关联来自您已验证的登录，不能通过输入其他家长的地址来更改。',
  'Child nickname':'孩子昵称','Student Google email':'学生 Google 电子邮件','School year':'就读年级','School stream':'学校类型','Learning language':'学习语言',
  'I am the parent or guardian and consent to pairing this student account and viewing its learning reports.':'我是家长或监护人，同意关联此学生账户并查看其学习报告。',
  'Your Google-verified parent account authorizes this link immediately. The child must sign in with that Google account. Only an administrator can remove or change a link. Children beyond paid Premium slots use Free modules until the extra RM30 payment is approved.':'您经 Google 验证的家长账户将立即授权此关联。孩子必须使用该 Google 账户登录。只有管理员可以移除或更改关联。超出付费 Premium 名额的孩子在额外的 RM30 付款获批前使用免费模块。',
  'Add child account':'添加孩子账户','Enrolment requests':'登记申请','No enrolment requests yet.':'暂无登记申请。',
  'Share a comment or improvement idea':'分享意见或改进想法','Category':'类别','Improvement suggestion':'改进建议','Comment':'意见','Report an issue':'报告问题','Your message':'您的留言',
  'Please do not include passwords, payment-card details or sensitive documents.':'请勿包含密码、支付卡信息或敏感文件。','Send to administrator':'发送给管理员','Your messages and replies':'您的留言和回复','Administrator reply':'管理员回复','No messages yet.':'暂无留言。'
 },
 ta:{
  'Child reports':'குழந்தை அறிக்கைகள்','Enrol a child':'குழந்தையைப் பதிவு செய்','Comments & suggestions':'கருத்துகள் & பரிந்துரைகள்','Membership & payments':'உறுப்பினர் & கட்டணங்கள்','Referrals & earnings':'பரிந்துரைகள் & வருவாய்','Premium Kasih':'Premium Kasih',
  'Parent dashboard':'பெற்றோர் முகப்புப் பலகை','Growing together, every day':'ஒவ்வொரு நாளும் சேர்ந்து வளர்கிறோம்','Sign out':'வெளியேறு','Parent navigation':'பெற்றோர் வழிசெலுத்தல்','YOUR FAMILY SPACE':'உங்கள் குடும்ப இடம்',
  'Every small step counts.':'ஒவ்வொரு சிறு அடியும் முக்கியம்.','Celebrate curiosity, effort and the joy of learning.':'ஆர்வம், முயற்சி, கற்றலின் மகிழ்ச்சியைக் கொண்டாடுங்கள்.','CHEER ON THEIR NEXT DISCOVERY':'அவர்களின் அடுத்த கண்டுபிடிப்பை உற்சாகப்படுத்துங்கள்',
  'Private reports for children linked to your verified parent Google account.':'உங்கள் சரிபார்க்கப்பட்ட பெற்றோர் Google கணக்குடன் இணைக்கப்பட்ட குழந்தைகளுக்கான தனிப்பட்ட அறிக்கைகள்.','Language':'மொழி','Saved successfully.':'வெற்றிகரமாகச் சேமிக்கப்பட்டது.',
  'Family reports':'குடும்ப அறிக்கைகள்','Google account access is checked by the server.':'Google கணக்கு அணுகல் சேவையகத்தால் சரிபார்க்கப்படுகிறது.',
  'Results below come from server-marked lesson checks. Games and practice that do not submit an assessment are not counted as test results. Reported activity time excludes hidden pages and extended inactivity and is approximate.':'கீழே உள்ள முடிவுகள் சேவையகம் மதிப்பிட்ட பாடச் சோதனைகளிலிருந்து வருகின்றன. மதிப்பீட்டைச் சமர்ப்பிக்காத விளையாட்டுகளும் பயிற்சிகளும் தேர்வு முடிவுகளாகக் கணக்கிடப்படாது. பதிவான செயல்பாட்டு நேரத்தில் மறைந்த பக்கங்களும் நீண்ட செயலற்ற நேரமும் சேர்க்கப்படாது; இது தோராயமானது.',
  'No children are paired yet. Enrol a child and add their separate Google account from Enrol a child.':'இன்னும் குழந்தைகள் இணைக்கப்படவில்லை. “குழந்தையைப் பதிவு செய்” பகுதியில் குழந்தையைப் பதிவு செய்து அவர்களின் தனி Google கணக்கைச் சேர்க்கவும்.',
  'Year':'ஆண்டு','Test attempts':'தேர்வு முயற்சிகள்','Correct answers':'சரியான விடைகள்','Accuracy':'துல்லியம்','No tests yet':'இன்னும் தேர்வுகள் இல்லை','Practice milestones':'பயிற்சி மைல்கற்கள்','Reported learning time':'பதிவான கற்றல் நேரம்',
  'Daily usage':'தினசரி பயன்பாடு','No usage reported yet.':'இன்னும் பயன்பாடு பதிவாகவில்லை.','Recent test results':'சமீபத்திய தேர்வு முடிவுகள்','Correct':'சரி','Needs practice':'பயிற்சி தேவை','hints':'குறிப்புகள்','No test results yet.':'இன்னும் தேர்வு முடிவுகள் இல்லை.','Refresh child reports':'குழந்தை அறிக்கைகளைப் புதுப்பி',
  'Link a child’s Google account':'குழந்தையின் Google கணக்கை இணைக்கவும்','Parent account:':'பெற்றோர் கணக்கு:','This pairing comes from your verified sign-in and cannot be changed by typing another parent’s address.':'இந்த இணைப்பு உங்கள் சரிபார்க்கப்பட்ட உள்நுழைவிலிருந்து வருகிறது; வேறொரு பெற்றோரின் முகவரியை உள்ளிட்டு மாற்ற முடியாது.',
  'Child nickname':'குழந்தையின் செல்லப் பெயர்','Student Google email':'மாணவரின் Google மின்னஞ்சல்','School year':'பள்ளி ஆண்டு','School stream':'பள்ளி வகை','Learning language':'கற்றல் மொழி',
  'I am the parent or guardian and consent to pairing this student account and viewing its learning reports.':'நான் பெற்றோர் அல்லது பாதுகாவலர்; இந்த மாணவர் கணக்கை இணைக்கவும் அதன் கற்றல் அறிக்கைகளைப் பார்க்கவும் சம்மதிக்கிறேன்.',
  'Your Google-verified parent account authorizes this link immediately. The child must sign in with that Google account. Only an administrator can remove or change a link. Children beyond paid Premium slots use Free modules until the extra RM30 payment is approved.':'Google சரிபார்த்த உங்கள் பெற்றோர் கணக்கு இந்த இணைப்பை உடனே அங்கீகரிக்கிறது. குழந்தை அதே Google கணக்கில் உள்நுழைய வேண்டும். நிர்வாகி மட்டுமே இணைப்பை நீக்கவோ மாற்றவோ முடியும். கட்டணம் செலுத்திய Premium இடங்களுக்கு மேலான குழந்தைகள் கூடுதல் RM30 கட்டணம் அங்கீகரிக்கப்படும் வரை இலவசப் பகுதிகளைப் பயன்படுத்துவர்.',
  'Add child account':'குழந்தை கணக்கைச் சேர்','Enrolment requests':'பதிவு கோரிக்கைகள்','No enrolment requests yet.':'இன்னும் பதிவு கோரிக்கைகள் இல்லை.',
  'Share a comment or improvement idea':'கருத்து அல்லது மேம்பாட்டு யோசனையைப் பகிருங்கள்','Category':'வகை','Improvement suggestion':'மேம்பாட்டுப் பரிந்துரை','Comment':'கருத்து','Report an issue':'சிக்கலைப் புகாரளி','Your message':'உங்கள் செய்தி',
  'Please do not include passwords, payment-card details or sensitive documents.':'கடவுச்சொற்கள், கட்டண அட்டை விவரங்கள் அல்லது உணர்திறன் ஆவணங்களைச் சேர்க்க வேண்டாம்.','Send to administrator':'நிர்வாகிக்கு அனுப்பு','Your messages and replies':'உங்கள் செய்திகளும் பதில்களும்','Administrator reply':'நிர்வாகியின் பதில்','No messages yet.':'இன்னும் செய்திகள் இல்லை.'
 }
};
export const portalText=(language,text)=>language==='en'?text:(PORTAL_COPY[language]?.[text]??text);
