const SCRIPT_URL='https://script.google.com/macros/s/AKfycbxYjeoCtNv3G9UScOl0AW2H3KZazvFF02Yxd8BX7qw6QJt16g_SRYZJYM1aZU-qvqOt/exec';

// ── THEME ───────────────────────────────────────
let _dark = localStorage.getItem('theme') === 'dark';
function applyTheme() {
  document.documentElement.setAttribute('data-theme', _dark ? 'dark' : 'light');
  document.querySelectorAll('.theme-btn').forEach(b => b.innerHTML = _dark ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>' : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>');
}
function toggleTheme() {
  _dark = !_dark;
  localStorage.setItem('theme', _dark ? 'dark' : 'light');
  applyTheme();
}
applyTheme();

// ── DEEP LINK ─────────────────────────────────────────────────────
// When HR taps the Telegram link (?req=REQ-XXXXXXXX), auto-open HR view
let _deepReq = new URLSearchParams(window.location.search).get('req') || '';
if(_deepReq){
  hrFilter_ = 'All';
  document.addEventListener('DOMContentLoaded', function(){
    // Navigate to HR section — login gate will show by default
    document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
    const hv=document.getElementById('v-hr');if(hv)hv.classList.add('active');
    // Show a subtle hint so HR knows why they're here
    const lerr=document.getElementById('hr-lerr');
    if(lerr)lerr.textContent='Log in to review request '+_deepReq;
  });
}

// ── SESSION RESTORE ──────────────────────────────────────────────
(function restoreSession(){
  try{
    const raw=sessionStorage.getItem('hr_sess');
    if(!raw)return;
    const s=JSON.parse(raw);
    if(s.token&&s.user&&s.hmacKey){
      hrUser=s.user;hrToken=s.token;
      setHmacKey(s.hmacKey);
    }else{
      sessionStorage.removeItem('hr_sess');
    }
  }catch(e){sessionStorage.removeItem('hr_sess');}
})();
// Begin silent background fetch immediately after session restore
setTimeout(hrPreload, 100);

// ── NAV ─────────────────────────────────────────
function goTo(v) {
  document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));
  const targetView = document.getElementById('v-'+v);
  if (targetView) targetView.classList.add('active');
  window.scrollTo(0,0);
  try {
    if(v==='request')rReset();
    if(v==='status')stReset();
    if(v==='notice')ntReset();
    if(v==='home')loadHomeLeaveBoard();
    if(v==='hr'){
      if(hrUser){
        const hrLogin = document.getElementById('hr-login');
        const hrDash = document.getElementById('hr-dash');
        if (hrLogin) hrLogin.style.display='none';
        if (hrDash) hrDash.style.display='block';
        const bBtn=document.getElementById('hr-back-btn');if(bBtn)bBtn.style.display='none';
        const lBtn=document.getElementById('hr-logout-btn');if(lBtn)lBtn.style.display='inline-flex';
        const hrGreet = document.getElementById('hr-greet');
        if (hrGreet) hrGreet.textContent=tx('hrGreet')+hrUser;
        const hrGsub = document.getElementById('hr-gsub');
        if (hrGsub) hrGsub.textContent=tx('hrGsub')+' — '+todayFmt();
        hrLoadData(true);
      } else {
        const hrLogin = document.getElementById('hr-login');
        const hrDash = document.getElementById('hr-dash');
        if (hrLogin) hrLogin.style.display='block';
        if (hrDash) hrDash.style.display='none';
        const bBtn=document.getElementById('hr-back-btn');if(bBtn)bBtn.style.display='inline-flex';
        const lBtn=document.getElementById('hr-logout-btn');if(lBtn)lBtn.style.display='none';
      }
    }
  } catch(e) {
    console.error('goTo error for view ' + v + ':', e);
  }
}

// ── LANG ────────────────────────────────────────
let LANG=localStorage.getItem('lang')||'en';
const T={
  en:{hEy:'Late / Leave Early / Annual Leave Request',hSub:'Insurance Brokers (Cambodia) Co., Ltd.',hC1t:'Request Leave',hC1d:'Submit a new annual or special leave request',hC2t:'My Leave Status',hC2d:'Check remaining days, history and print past requests',hC3t:'HR Dashboard',hC3d:'Approve, manage requests and staff records',back:'Back',rTitle:'Request Leave',stTitle:'My Leave Status',hrTitle:'HR Dashboard',rgTitle:'Enter Your Employee ID',rgSub:'Your identity will be verified before proceeding',rgBtn:'Verify & Continue',stgTitle:'Enter Your Employee ID',stgSub:'View your leave balance and history',stgBtn:'View My Leave',rsl1:'Verify ID',rsl2:'Fill Form',rsl3:'Review',rsl4:'Confirm',rsh1:'Staff Information',rsh2:'Leave Details',rsh3:'Submission Info',rlEid:'Employee ID',rlName:'Full Name',rlGen:'Gender',rlPos:'Position',rlType:'Leave Type',rlFrom:'From Date',rlTo:'To Date',rlRsn:'Reason',rlSdate:'Submission Date',rlSloc:'Location',lt1:'Annual Leave',lt2:'Sick Leave',lt3:'Emergency Leave',lt4:'Special Leave',lt5:'Unpaid Leave',lt6:'Other',lt7:'Training / Mission',dinfo:'Working days requested',dsub:'Excluding weekends',balUsed:'Used this year',rpBtn:'Preview & Continue →',rprTitle:'Review Your Request',pnHd:'',pnBd:'Your request has been sent to the HR team.<br><br><strong>Please print the form, sign it yourself, and bring it to management for approval.</strong><br><br>HR will notify you when your request is approved.',editBtn:'Edit',conTxt:'Confirm & Print',stTotLbl:'Total Days',stUsedLbl:'Used',stRemLbl:'Remaining',stBalTitle:'Annual Leave Balance',stHistTitle:'Leave History',stTh1:'ID',stTh2:'Type',stTh3:'From',stTh4:'To',stTh5:'Days',stTh6:'Status',stTh7:'Print',stNoData:'No leave history found.',hrLt:'HR Access',hrLs:'Authorised personnel only',hrLu:'Username',hrLp:'Password',hrLbtn:'Login',hrLerr:'Invalid credentials.',hrGreet:'Welcome back, ',hrGsub:'Lockton IBS HR Portal',hrLo:'Logout',hrNt1:'Requests',hrNt2:'Staff Records',hrStLbl:'Total',hrSpLbl:'Pending',hrSaLbl:'Approved',hrSrLbl:'Rejected',hftAll:'All',hftPend:'Pending',hftAppr:'Approved',hftRej:'Rejected',hrTh1:'Req ID',hrTh2:'Staff',hrTh3:'Type',hrTh4:'From',hrTh5:'Days',hrTh6:'Status',hrTh7:'Action',hrApprove:'Approve',hrReject:'Reject',hrSh:'Staff Registry',hrSth1:'ID',hrSth2:'Name',hrSth3:'Position',hrSth4:'Total',hrSth5:'Used',hrSth6:'Remaining',approveQ:'Approve this request?',rejectQ:'Reject this request?',notFound:'Employee ID not found.',daysRem:'days remaining',errFields:'Please fill in all required fields.',errDate:'End date must be after start date.',errType:'Please select a leave type.',sending:'Submitting...',success:'Submitted! Preparing print...',errSubmit:'Submission failed. Try again.',male:'Male',female:'Female',ptEid:'Employee ID',ptName:'Full Name',ptGen:'Gender',ptPos:'Position',ptType:'Leave Type',ptFrom:'From',ptTo:'To',ptDays:'Working Days',ptRsn:'Reason',ptSub:'Submitted',tourGuide:'Guide'},
  kh:{hEy:'ស្នើសុំឈប់សម្រាកប្រចាំឆ្នាំ/ មកយឺត / សុំចេញមុន',hSub:'ការស្នើសុំច្បាប់ឈប់សម្រាក',hC1t:'ស្នើសុំច្បាប់',hC1d:'ដាក់ពាក្យស្នើសុំច្បាប់ឈប់សម្រាកថ្មី',hC2t:'ការឈប់សម្រាករបស់ខ្ញុំ',hC2d:'ពិនិត្យថ្ងៃដែលនៅសល់ ប្រវត្តិច្បាប់ដែលបានសុំ និងព្រីន FORM ដែលបានស្នើរួច',hC3t:'HR Dashboard',hC3d:'អនុម័ត គ្រប់គ្រងការស្នើ និងព័ត៌មានបុគ្គលិក',back:'ត្រឡប់ក្រោយ',rTitle:'ស្នើសុំច្បាប់',stTitle:'ស្ថានភាពច្បាប់',hrTitle:'ផ្ទាំងបញ្ជា HR',rgTitle:'បញ្ចូលលេខអត្តសញ្ញាណ',rgSub:'អត្តសញ្ញាណរបស់អ្នកនឹងត្រូវបានផ្ទៀងផ្ទាត់',rgBtn:'ផ្ទៀងផ្ទាត់ & បន្ត',stgTitle:'បញ្ចូលលេខអត្តសញ្ញាណ',stgSub:'មើលថ្ងៃដែលនៅសល់ និងប្រវត្តិ',stgBtn:'មើលច្បាប់របស់ខ្ញុំ',rsl1:'ផ្ទៀងអត្តសញ្ញាណ',rsl2:'បំពេញទម្រង់',rsl3:'មើលជាមុន',rsl4:'បញ្ជាក់',rsh1:'ព័ត៌មានបុគ្គលិក',rsh2:'ព័ត៌មានការស្នើ',rsh3:'ព័ត៌មានការដាក់ពាក្យ',rlEid:'លេខអត្តសញ្ញាណ',rlName:'ឈ្មោះពេញ',rlGen:'ភេទ',rlPos:'មុខតំណែង',rlType:'ប្រភេទច្បាប់',rlFrom:'ចាប់ពីថ្ងៃ',rlTo:'ដល់ថ្ងៃ',rlRsn:'មូលហេតុ',rlSdate:'ថ្ងៃដាក់ពាក្យ',rlSloc:'ទីតាំង',lt1:'ច្បាប់ប្រចាំឆ្នាំ',lt2:'ច្បាប់ឈឺ',lt3:'ច្បាប់បន្ទាន់',lt4:'ច្បាប់ពិសេស',lt5:'ច្បាប់គ្មានប្រាក់',lt6:'ផ្សេងៗ',lt7:'បេសកកម្ម / វគ្គបណ្ត',dinfo:'ចំនួនថ្ងៃការងារ',dsub:'មិនរាប់ថ្ងៃចុងសប្តាហ៍',balUsed:'បានប្រើឆ្នាំនេះ',rpBtn:'មើលជាមុន & បន្ត →',rprTitle:'ពិនិត្យការស្នើ',pnHd:'សំខាន់:',pnBd:' បន្ទាប់ពីបញ្ជាក់ សូមព្រីនទម្រង់នេះ ចុះហត្ថលេខា ហើយដាក់ជូន HR។',editBtn:'កែប្រែ',conTxt:'បញ្ជាក់ & ព្រីន',stTotLbl:'ថ្ងៃសរុប',stUsedLbl:'បានប្រើ',stRemLbl:'នៅសល់',stBalTitle:'ថ្ងៃច្បាប់ប្រចាំឆ្នាំ',stHistTitle:'ប្រវត្តិការស្នើ',stTh1:'លេខ',stTh2:'ប្រភេទ',stTh3:'ចាប់ពី',stTh4:'ដល់',stTh5:'ថ្ងៃ',stTh6:'ស្ថានភាព',stTh7:'ព្រីន',stNoData:'មិនមានប្រវត្តិ។',hrLt:'ចូលប្រព័ន្ធ HR',hrLs:'សម្រាប់បុគ្គលិក HR ដែលមានការអនុញ្ញាត',hrLu:'ឈ្មោះអ្នកប្រើ',hrLp:'ពាក្យសម្ងាត់',hrLbtn:'ចូល',hrLerr:'ឈ្មោះ ឬពាក្យសម្ងាត់មិនត្រឹមត្រូវ។',hrGreet:'សូមស្វាគមន៍, ',hrGsub:'វិបផតែ HR ឡក តន អាយប៊ីស៊ី',hrLo:'ចាកចេញ',hrNt1:'ការស្នើ',hrNt2:'ទិន្នន័យបុគ្គលិក',hrStLbl:'សរុប',hrSpLbl:'រង់ចាំ',hrSaLbl:'អនុម័ត',hrSrLbl:'បដិសេធ',hftAll:'ទាំងអស់',hftPend:'រង់ចាំ',hftAppr:'អនុម័ត',hftRej:'បដិសេធ',hrTh1:'លេខ',hrTh2:'បុគ្គលិក',hrTh3:'ប្រភេទ',hrTh4:'ចាប់ពី',hrTh5:'ថ្ងៃ',hrTh6:'ស្ថានភាព',hrTh7:'សកម្មភាព',hrApprove:'អនុម័ត',hrReject:'បដិសេធ',hrSh:'ទំព័របុគ្គលិក',hrSth1:'អត្តសញ្ញាណ',hrSth2:'ឈ្មោះ',hrSth3:'មុខតំណែង',hrSth4:'សរុប',hrSth5:'បានប្រើ',hrSth6:'នៅសល់',approveQ:'អនុម័តការស្នើនេះ?',rejectQ:'បដិសេធការស្នើនេះ?',notFound:'រកមិនឃើញ។',daysRem:'ថ្ងៃនៅសល់',errFields:'សូមបំពេញព័ត៌មានទាំងអស់។',errDate:'ថ្ងៃបញ្ចប់ត្រូវក្រោយថ្ងៃចាប់ផ្តើម។',errType:'សូមជ្រើសប្រភេទច្បាប់។',sending:'កំពុងដាក់...',success:'ការស្នើបានជោគជ័យ!',errSubmit:'ការដាក់ពាក្យបរាជ័យ។',male:'ប្រុស',female:'ស្រី',ptEid:'លេខអត្តសញ្ញាណ',ptName:'ឈ្មោះ',ptGen:'ភេទ',ptPos:'មុខតំណែង',ptType:'ប្រភេទ',ptFrom:'ចាប់ពី',ptTo:'ដល់',ptDays:'ចំនួនថ្ងៃ',ptRsn:'មូលហេតុ',ptSub:'ថ្ងៃដាក់',tourGuide:'ណែនាំ'}
};
function tx(k){return(T[LANG]||T.en)[k]||T.en[k]||k;}
function setLang(l){LANG=l;localStorage.setItem('lang',l);document.querySelectorAll('.lb').forEach(b=>b.classList.remove('on'));document.querySelectorAll('.lb[data-lang="'+l+'"]').forEach(b=>b.classList.add('on'));applyLang();}
function applyLang(){
  const s=(id,k)=>{const e=document.getElementById(id);if(e)e.textContent=tx(k);};
  s('h-ey','hEy');s('h-sub','hSub');s('h-c1t','hC1t');s('h-c1d','hC1d');s('h-c2t','hC2t');s('h-c2d','hC2d');s('h-c3t','hC3t');s('h-c3d','hC3d');
  s('r-back','back');s('r-title','rTitle');s('rg-title','rgTitle');s('rg-sub','rgSub');s('r-gate-txt','rgBtn');
  s('tour-btn-lbl','tourGuide');
  s('rsl1','rsl1');s('rsl2','rsl2');s('rsl3','rsl3');s('rsl4','rsl4');
  s('rsh1','rsh1');s('rsh2','rsh2');s('rsh3','rsh3');
  s('rl-eid','rlEid');s('rl-name','rlName');s('rl-gen','rlGen');s('rl-pos','rlPos');
  s('rl-type','rlType');s('rl-from','rlFrom');s('rl-to','rlTo');s('rl-rsn','rlRsn');
  s('rl-sdate','rlSdate');s('rl-sloc','rlSloc');
  s('lt1','lt1');s('lt2','lt2');s('lt3','lt3');s('lt4','lt4');s('lt5','lt5');s('lt6','lt6');s('lt7','lt7');
  s('r-dinfo','dinfo');s('r-dsub','dsub');s('r-bal-used-lbl','balUsed');s('r-prev-btn','rpBtn');s('r-prev-txt','rpBtn');
  s('rpr-title','rprTitle');s('r-edit-btn','editBtn');s('r-con-txt','conTxt');
  const _pnBd=document.getElementById('pn-bd');if(_pnBd)_pnBd.innerHTML=tx('pnBd');
  s('st-back','back');s('st-title','stTitle');s('stg-title','stgTitle');s('stg-sub','stgSub');s('st-gate-txt','stgBtn');
  s('st-tot-lbl','stTotLbl');s('st-used-lbl','stUsedLbl');s('st-rem-lbl','stRemLbl');
  s('st-bal-title','stBalTitle');s('st-hist-title','stHistTitle');
  s('st-th1','stTh1');s('st-th2','stTh2');s('st-th3','stTh3');s('st-th4','stTh4');s('st-th5','stTh5');s('st-th6','stTh6');s('st-th7','stTh7');
  s('hr-back','back');s('hr-pg-title','hrTitle');s('hr-lt','hrLt');s('hr-ls','hrLs');s('hr-lu','hrLu');s('hr-lp','hrLp');s('hr-lbtxt','hrLbtn');
  s('hr-lo','hrLo');s('hr-lo-btn-txt','hrLo');s('hr-nt1','hrNt1');s('hr-nt2','hrNt2');
  s('hr-st-lbl','hrStLbl');s('hr-sp-lbl','hrSpLbl');s('hr-sa-lbl','hrSaLbl');s('hr-sr-lbl','hrSrLbl');
  s('hft-all','hftAll');s('hft-pend','hftPend');s('hft-appr','hftAppr');s('hft-rej','hftRej');
  s('hr-th1','hrTh1');s('hr-th2','hrTh2');s('hr-th3','hrTh3');s('hr-th4','hrTh4');s('hr-th5','hrTh5');s('hr-th6','hrTh6');s('hr-th7','hrTh7');
  if(rStaff) { rLoadForm(); }
  if(stStaff) { renderStDash(); }
  if(hrUser){ hrRenderReqs(); hrRenderStaff(); }
  loadHomeLeaveBoard();
}

function formatGender(g, lang){
  const str = String(g || '').trim().toLowerCase();
  const isFemale = str.startsWith('f') || str.includes('female') || str === 'ស្រី' || str === 'w' || str === 'woman' || str === 'ស' || str.startsWith('ms') || str.startsWith('mrs') || str.startsWith('miss') || str === '女';
  const isMale = str.startsWith('m') || str.includes('male') || str === 'ប្រុស' || str === 'man' || str === 'ប' || str.startsWith('mr') || str === '男';
  if(lang === 'kh'){
    return isFemale ? (T.kh.female || 'ស្រី') : (isMale ? (T.kh.male || 'ប្រុស') : (g || 'ប្រុស'));
  }
  return isFemale ? 'Female' : (isMale ? 'Male' : (g || 'Male'));
}

document.querySelectorAll('.lb').forEach(b=>b.addEventListener('click',()=>setLang(b.dataset.lang),{passive:true}));
document.querySelectorAll('.lb[data-lang="'+LANG+'"]').forEach(b=>b.classList.add('on'));

// ── LEAVE TYPE HIGHLIGHT ─────────────────────────
function highlightType(input){
  document.querySelectorAll('.topt').forEach(l=>l.classList.remove('sel'));
  if(input.checked) input.closest('.topt').classList.add('sel');
  if(typeof tourNotifyAction === 'function') tourNotifyAction('type');
}

// ── SYNC ────────────────────────────────────────
async function syncAll(){
  const btn=document.getElementById('sync-btn');
  if(!btn)return;
  btn.classList.add('spinning');
  btn.disabled=true;
  try{
    // Ping server to verify connectivity
    await apiGet('ping');
    // Refresh HR data if logged in
    if(hrUser)await hrLoadData();
    // Refresh status if viewing
    if(stStaff){
      const res=await apiPost('getHistory',{empId:stStaff.empId,fullName:stStaff.name});
      if(res.result==='success'){stHistory=res.history||[];renderStDash();}
    }
    toast('Synced','ok2');
  }catch(e){toast('Sync failed','bad');}
  finally{btn.classList.remove('spinning');btn.disabled=false;}
}

// ── TOAST ────────────────────────────────────────
let _tt;
function toast(msg,type=''){const el=document.getElementById('toast');requestAnimationFrame(()=>{el.textContent=msg;el.className='show '+type;});clearTimeout(_tt);_tt=setTimeout(()=>requestAnimationFrame(()=>{el.className='';}),3400);}
function clearFieldErr(){document.querySelectorAll('.field-err').forEach(el=>el.classList.remove('field-err'));const g=document.getElementById('ltype-grid');if(g)g.classList.remove('tgrid-err');}

// ── HOLIDAYS & UTILS ─────────────────────────────────────
const DEFAULT_HOLIDAYS = [
  { date: '2026-01-01', name: 'International New Year', nameKh: 'ទិវាចូលឆ្នាំសកល', type: 'Public Holiday' },
  { date: '2026-01-07', name: 'Victory over Genocide Day', nameKh: 'ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍', type: 'Public Holiday' },
  { date: '2026-03-08', name: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', type: 'Public Holiday' },
  { date: '2026-04-14', name: 'Khmer New Year (Day 1)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ ថ្ងៃទី១', type: 'Public Holiday' },
  { date: '2026-04-15', name: 'Khmer New Year (Day 2)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ ថ្ងៃទី២', type: 'Public Holiday' },
  { date: '2026-04-16', name: 'Khmer New Year (Day 3)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ ថ្ងៃទី៣', type: 'Public Holiday' },
  { date: '2026-05-01', name: 'International Labor Day', nameKh: 'ទិវាពលកម្មអន្តរជាតិ', type: 'Public Holiday' },
  { date: '2026-05-14', name: "King Sihamoni's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះមហាក្សត្រ', type: 'Public Holiday' },
  { date: '2026-06-18', name: "Queen Mother's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចម៉ែ', type: 'Public Holiday' },
  { date: '2026-09-24', name: 'Constitutional Day', nameKh: 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ', type: 'Public Holiday' },
  { date: '2026-10-29', name: "King's Coronation Day", nameKh: 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ', type: 'Public Holiday' },
  { date: '2026-11-09', name: 'National Independence Day', nameKh: 'ទិវាបុណ្យឯករាជ្យជាតិ', type: 'Public Holiday' }
];

let _holidaysList = (function(){
  try {
    const s = localStorage.getItem('hr_holidays_cache');
    return s ? JSON.parse(s) : DEFAULT_HOLIDAYS;
  } catch(e) { return DEFAULT_HOLIDAYS; }
})();

function saveHolidaysCache(list) {
  if (Array.isArray(list)) {
    _holidaysList = list;
    try { localStorage.setItem('hr_holidays_cache', JSON.stringify(list)); } catch (e) {}
  }
}

function isWeekend(dStr){
  if(!dStr)return false;
  const dt=new Date(dStr+(String(dStr).includes('T')?'':'T00:00:00'));
  if(isNaN(dt.getTime()))return false;
  const day=dt.getDay();
  return day===0||day===6; // 0 = Sunday, 6 = Saturday
}

function isHoliday(dStr){
  if(!dStr)return false;
  const iso = String(dStr).slice(0, 10);
  return (_holidaysList || []).some(h => (h.date === iso || h.dateISO === iso));
}

function getHolidayObj(dStr){
  if(!dStr)return null;
  const iso = String(dStr).slice(0, 10);
  return (_holidaysList || []).find(h => (h.date === iso || h.dateISO === iso)) || null;
}

function isNonWorkingDay(dStr){
  return isWeekend(dStr) || isHoliday(dStr);
}

function workDays(f,t){
  if(!f||!t||f>t)return 0;
  let n=0,c=new Date(f+'T00:00:00'),e=new Date(t+'T00:00:00');
  while(c<=e){
    const d=c.getDay();
    const iso=c.getFullYear()+'-'+String(c.getMonth()+1).padStart(2,'0')+'-'+String(c.getDate()).padStart(2,'0');
    if(d!==0&&d!==6&&!isHoliday(iso))n++; // Skip Sunday, Saturday and Holidays
    c.setDate(c.getDate()+1);
  }
  return n;
}

function weekendDays(f,t){
  if(!f||!t||f>t)return 0;
  let n=0,c=new Date(f+'T00:00:00'),e=new Date(t+'T00:00:00');
  while(c<=e){
    const d=c.getDay();
    if(d===0||d===6)n++;
    c.setDate(c.getDate()+1);
  }
  return n;
}

function holidayDays(f,t){
  if(!f||!t||f>t)return 0;
  let n=0,c=new Date(f+'T00:00:00'),e=new Date(t+'T00:00:00');
  while(c<=e){
    const d=c.getDay();
    const iso=c.getFullYear()+'-'+String(c.getMonth()+1).padStart(2,'0')+'-'+String(c.getDate()).padStart(2,'0');
    if(d!==0&&d!==6&&isHoliday(iso))n++; // Weekday holidays
    c.setDate(c.getDate()+1);
  }
  return n;
}

function getIsoDateVal(elId) {
  const el = document.getElementById(elId);
  if (!el) return '';
  const val = el.dataset.iso || el.value || '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  const parsed = new Date(val);
  if (!isNaN(parsed.getTime())) {
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }
  return '';
}

function autoSetTo(){
  const f = getIsoDateVal('rf-from');
  if(!f)return;
  const toEl=document.getElementById('rf-to');
  const t = getIsoDateVal('rf-to');
  if(!t || t < f) {
    toEl.value = f;
    toEl.dataset.iso = f;
  }
  if(isHoliday(f)){
    const hol = getHolidayObj(f);
    const name = hol ? (LANG === 'kh' && hol.nameKh ? hol.nameKh : hol.name) : 'Official Holiday';
    toast(LANG==='kh'?`កាលបរិច្ឆេទនេះចំថ្ងៃឈប់សម្រាកបុណ្យ (${name})។ ថ្ងៃបុណ្យនឹងត្រូវរំលងដោយស្វ័យប្រវត្តិ។`:`Selected date is an official holiday (${name}). Holidays are automatically skipped.`,'');
  } else if(isWeekend(f)){
    toast(LANG==='kh'?'កាលបរិច្ឆេទដែលបានជ្រើសរើសចំថ្ងៃចុងសប្តាហ៍ (សៅរ៍/អាទិត្យ)។ ចុងសប្តាហ៍នឹងត្រូវរំលងដោយស្វ័យប្រវត្តិ។':'Selected date is on a weekend (Saturday/Sunday). Weekends are automatically skipped.','');
  }
  calcDays();
  if (typeof renderBuiltInCalendar === 'function') renderBuiltInCalendar();
}

function validateToDate(){
  const f = getIsoDateVal('rf-from');
  const toEl = document.getElementById('rf-to');
  const t = getIsoDateVal('rf-to');
  if(f && t && t < f){
    toEl.value = f;
    toEl.dataset.iso = f;
  }
  calcDays();
  if (typeof renderBuiltInCalendar === 'function') renderBuiltInCalendar();
}

function hdGetFirst(){const s=document.querySelector('input[name=halfday-first]:checked');return s?s.value:'full';}
function hdGetLast(){const s=document.querySelector('input[name=halfday-last]:checked');return s?s.value:'full';}
function hdLabel(v){return v==='morning'?'Morning':v==='afternoon'?'Evening':'';}

function getActualDays(from,to){
  if(!from||!to||from>to)return 0;
  const wd=workDays(from,to);
  if(wd===0)return 0;
  const single=from===to;
  const fv=hdGetFirst(),lv=single?fv:hdGetLast();
  let d=wd;
  const fNonWork=isNonWorkingDay(from),lNonWork=isNonWorkingDay(to);
  if(fv!=='full'&&!fNonWork)d-=0.5;
  if(!single&&lv!=='full'&&!lNonWork)d-=0.5;
  return Math.max(0,d);
}
function getHalfNote(from,to){
  const single=from===to;
  const fv=hdGetFirst(),lv=single?fv:hdGetLast();
  const fl=hdLabel(fv),ll=hdLabel(lv);
  if(single)return fl?' ('+fl+')':'';
  if(fl&&ll&&fl===ll)return' ('+fl+' Only)';
  const parts=[];
  if(fl)parts.push('First: '+fl);
  if(ll)parts.push('Last: '+ll);
  return parts.length?' ('+parts.join(', ')+')':'';
}
function fmtDate(iso){if(!iso)return'—';const d=iso.includes('T')||iso.includes('Z')?new Date(iso):new Date(iso+'T00:00:00');return isNaN(d.getTime())?iso:d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'});}
function fmtTimeVal(v){
  if(!v)return'—';
  // already HH:MM or HH:MM:SS
  if(/^\d{1,2}:\d{2}(:\d{2})?$/.test(String(v).trim())){const p=String(v).trim().split(':');return p[0].padStart(2,'0')+':'+p[1];}
  const d=new Date(v);
  if(isNaN(d.getTime()))return String(v);
  const hh=String(d.getHours()).padStart(2,'0');
  const mm=String(d.getMinutes()).padStart(2,'0');
  // GAS time-only values land on Dec 30 1899 — show just HH:MM
  if(d.getFullYear()===1899)return hh+':'+mm;
  // real datetime — show DD-MMM-YYYY, HH:MM
  return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})+', '+hh+':'+mm;
}
function todayISO(){return new Date().toISOString().split('T')[0];}
function todayFmt(){return new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'long',year:'numeric'});}
function parseDate(iso){
  if(!iso)return{};
  const d=iso.includes('T')||iso.includes('Z')?new Date(iso):new Date(iso+'T00:00:00');
  const mEN=['January','February','March','April','May','June','July','August','September','October','November','December'];
  const mKH=['មករា','កុម្ភៈ','មីនា','មេសា','ឧសភា','មិថុនា','កក្កដា','សីហា','កញ្ញា','តុលា','វិច្ឆិកា','ធ្នូ'];
  return{day:d.getDate(),month:(LANG==='kh'?mKH:mEN)[d.getMonth()],year:d.getFullYear()};
}
function normalizeId(val){
  return String(val||'').trim();
}
function isMock(){return !SCRIPT_URL.startsWith('https://script.google.com');}
function setReqBar(step){}


// ── DEVICE FINGERPRINT ──────────────────────────────────────
function getFingerprint(){const nav=window.navigator,scr=window.screen;const raw=[nav.userAgent,nav.language,scr.width+'x'+scr.height,scr.colorDepth,nav.hardwareConcurrency,nav.platform].join('|');let h=0;for(let i=0;i<raw.length;i++){h=Math.imul(31,h)+raw.charCodeAt(i)|0;}return Math.abs(h).toString(36);}

// ── HMAC SIGNING ────────────────────────────────────────────
let _hmacKey=null;
function setHmacKey(k){_hmacKey=k;}
async function signRequest(action){
  const ts=Date.now().toString();
  const nonce=Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2);
  if(!_hmacKey)return{ts,nonce,sig:'unsigned'};
  try{
    const enc=new TextEncoder();
    const key=await crypto.subtle.importKey('raw',enc.encode(_hmacKey),{name:'HMAC',hash:'SHA-256'},false,['sign']);
    const sig=await crypto.subtle.sign('HMAC',key,enc.encode(action+'|'+ts+'|'+nonce));
    return{ts,nonce,sig:Array.from(new Uint8Array(sig)).map(b=>b.toString(16).padStart(2,'0')).join('')};
  }catch(e){
    let h=0,s=action+'|'+ts+'|'+nonce+'|'+_hmacKey;
    for(let i=0;i<s.length;i++){h=Math.imul(31,h)+s.charCodeAt(i)|0;}
    return{ts,nonce,sig:Math.abs(h).toString(16)};
  }
}

// ── SECURE API ──────────────────────────────────────────────
async function apiGet(action,params={}){
  if(isMock())return{result:'mock'};
  const signed=await signRequest(action);
  const fp=getFingerprint();
  const qs=new URLSearchParams({action,...params,...signed,fp}).toString();
  const res=await fetch(SCRIPT_URL+'?'+qs);
  const data=await res.json();
  if(data.newToken){hrToken=data.newToken;try{const _s=JSON.parse(sessionStorage.getItem('hr_sess')||'{}');_s.token=data.newToken;sessionStorage.setItem('hr_sess',JSON.stringify(_s));}catch(e){}}
  return data;
}
async function apiPost(action,payload={}){
  if(isMock())return{result:'success'};
  const signed=await signRequest(action);
  const fp=getFingerprint();
  const body=JSON.stringify({action,...payload,...signed,fp});
  const res=await fetch(SCRIPT_URL,{method:'POST',headers:{'Content-Type':'text/plain'},body});
  const data=await res.json();
  if(data.newToken){hrToken=data.newToken;try{const _s=JSON.parse(sessionStorage.getItem('hr_sess')||'{}');_s.token=data.newToken;sessionStorage.setItem('hr_sess',JSON.stringify(_s));}catch(e){}}
  return data;
}

// Authenticated HR helper — auto-attaches token
async function apiHR(action, data={}){
  return apiPost(action, {...data, token:hrToken||''});
}

// ── MOCK (sample data removed — uses real sheet) ─────────────────────────
function mockStaff(id){return{result:'notfound'};}
function mockHist(id){return{result:'notfound'};}

// ── STAFF LIST & DEVICE MEMORY ──────────────────────────
let _appInitData = null;

async function loadStaffCache() {
  if (_appInitData && _appInitData.staffList && _appInitData.staffList.length > 0) return _appInitData.staffList;
  try {
    const res = await apiPost('getAppInitData', {});
    if (res && res.result === 'success') {
      _appInitData = {
        staffList: res.staffList || res.staff || [],
        history: res.history || [],
        notices: res.notices || []
      };
      if (res.holidays && Array.isArray(res.holidays) && res.holidays.length > 0) {
        saveHolidaysCache(res.holidays);
      }
      if (_appInitData.staffList.length > 0) {
        return _appInitData.staffList;
      }
    }
  } catch (e) {}

  try {
    const resStaff = await apiPost('getAllStaff', {});
    if (resStaff && resStaff.result === 'success' && resStaff.staffList) {
      if (!_appInitData) _appInitData = { staffList: [], history: [], notices: [] };
      _appInitData.staffList = resStaff.staffList;
      return _appInitData.staffList;
    }
  } catch(e){}

  return (_appInitData && _appInitData.staffList) ? _appInitData.staffList : [];
}

function saveUserDeviceMemory(staff) {
  if (!staff) return;
  try {
    localStorage.setItem('saved_staff_user', JSON.stringify({
      empId: staff.empId || '',
      name: staff.name || '',
      nameKh: staff.nameKh || '',
      gender: staff.gender || '',
      position: staff.position || '',
      positionKh: staff.positionKh || '',
      annualDays: staff.annualDays || 18,
      usedDays: staff.usedDays || 0,
      location: staff.location || 'Phnom Penh'
    }));
  } catch (e) {}
}

function getSavedUserDeviceMemory() {
  try {
    const s = localStorage.getItem('saved_staff_user');
    return s ? JSON.parse(s) : null;
  } catch (e) { return null; }
}

async function showStaffDropdown(inputId, listId) {
  const staffList = await loadStaffCache();
  if (!staffList || !staffList.length) return;
  onStaffInput(inputId, '', listId);
}

async function onStaffInput(inputId, fbId, listId) {
  if (fbId) {
    const fb = document.getElementById(fbId);
    if (fb) fb.textContent = '';
  }
  const inputEl = document.getElementById(inputId);
  if (inputEl && inputEl.dataset.selectedStaff) {
    delete inputEl.dataset.selectedStaff;
    updateStaffGateActions(inputId);
  }
  const listEl = document.getElementById(listId);
  if (!inputEl || !listEl) return;

  const query = inputEl.value.trim().toLowerCase();
  const staffList = await loadStaffCache();

  const filtered = staffList.filter(s => {
    if (!query) return true;
    const n = (s.name || '').toLowerCase();
    const nk = (s.nameKh || '').toLowerCase();
    const id = (s.empId || '').toLowerCase();
    return n.includes(query) || nk.includes(query) || id.includes(query);
  });

  if (!filtered.length) {
    listEl.style.display = 'none';
    return;
  }

  listEl.innerHTML = filtered.map(s => {
    const displayName = (LANG === 'kh' ? (s.nameKh || s.name) : s.name);
    return `<div class="staff-dd-item" onclick="selectStaffItem('${inputId}', '${listId}', '${encodeURIComponent(JSON.stringify(s))}')">
      <span>${displayName}</span>
      <span class="sd-id">(${s.empId})</span>
    </div>`;
  }).join('');
  listEl.style.display = 'block';
}

function updateStaffGateActions(inputId) {
  const inputEl = document.getElementById(inputId);
  if (inputEl) {
    if (inputEl.dataset.selectedStaff) {
      inputEl.readOnly = true;
    } else {
      inputEl.readOnly = false;
    }
  }
}

function rClearSelectedStaff() {
  const inputEl = document.getElementById('r-name-input');
  if (inputEl) {
    inputEl.value = '';
    delete inputEl.dataset.selectedStaff;
    inputEl.readOnly = false;
    inputEl.focus();
  }
  const fb = document.getElementById('r-idfb');
  if (fb) fb.textContent = '';
  updateStaffGateActions('r-name-input');
}

function ntClearSelectedStaff() {
  const inputEl = document.getElementById('nt-name-input');
  if (inputEl) {
    inputEl.value = '';
    delete inputEl.dataset.selectedStaff;
    inputEl.readOnly = false;
    inputEl.focus();
  }
  const fb = document.getElementById('nt-idfb');
  if (fb) fb.textContent = '';
  updateStaffGateActions('nt-name-input');
}

function stClearSelectedStaff() {
  const inputEl = document.getElementById('st-name-input');
  if (inputEl) {
    inputEl.value = '';
    delete inputEl.dataset.selectedStaff;
    inputEl.readOnly = false;
    inputEl.focus();
  }
  const fb = document.getElementById('st-idfb');
  if (fb) fb.textContent = '';
  updateStaffGateActions('st-name-input');
}

function selectStaffItem(inputId, listId, encodedStaff) {
  try {
    const staff = JSON.parse(decodeURIComponent(encodedStaff));
    const inputEl = document.getElementById(inputId);
    if (inputEl) {
      inputEl.value = (LANG === 'kh' ? (staff.nameKh || staff.name) : staff.name) + ' (' + staff.empId + ')';
      inputEl.dataset.selectedStaff = JSON.stringify(staff);
    }
  } catch (e) {}
  const listEl = document.getElementById(listId);
  if (listEl) listEl.style.display = 'none';
  updateStaffGateActions(inputId);
}

document.addEventListener('click', (e) => {
  if (!e.target.closest('.gate-input')) {
    document.querySelectorAll('.staff-dd-list').forEach(el => el.style.display = 'none');
  }
});

// Auto-fill saved user memory on page load
document.addEventListener('DOMContentLoaded', () => {
  const saved = getSavedUserDeviceMemory();
  if (saved) {
    const disp = (saved.name || '') + ' (' + saved.empId + ')';
    ['r-name-input', 'nt-name-input', 'st-name-input'].forEach(id => {
      const el = document.getElementById(id);
      if (el && !el.value) {
        el.value = disp;
        el.dataset.selectedStaff = JSON.stringify(saved);
        updateStaffGateActions(id);
      }
    });
  }
});

// ══════════════════ REQUEST ══════════════════════
let rStaff=null;
function rReset(){
  rStaff=null;
  document.getElementById('r-gate').style.display='flex';
  document.getElementById('req-form').style.display='none';
  const _rs=document.getElementById('r-success');
  if(_rs)_rs.style.display='none';
  document.querySelectorAll('input[name=halfday-first][value="full"],input[name=halfday-last][value="full"]').forEach(r=>r.checked=true);
  const _rni=document.getElementById('r-name-input');
  if(_rni){
    const saved = getSavedUserDeviceMemory();
    if(saved){
      _rni.value = (saved.name || '') + ' (' + saved.empId + ')';
      _rni.dataset.selectedStaff = JSON.stringify(saved);
    } else {
      _rni.value='';
      delete _rni.dataset.selectedStaff;
    }
  }
  updateStaffGateActions('r-name-input');
  document.getElementById('r-idfb').textContent='';
  setRStep(1);setReqBar(0);closeReviewModal();_isSubmitting=false;_pendingPayload=null;clearFieldErr();
}
function rIDClear(){document.getElementById('r-idfb').textContent='';}
function setRStep(n){for(let i=1;i<=4;i++){const dot=document.getElementById('rsd'+i),si=document.getElementById('rsi'+i);dot.classList.remove('act','dn');si.classList.remove('active');if(i<n){dot.classList.add('dn');dot.innerHTML='<svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';}else if(i===n){dot.classList.add('act');dot.innerHTML=i;si.classList.add('active');}else{dot.innerHTML=i;}}}
async function rVerify(){
  const inputEl = document.getElementById('r-name-input');
  const rawInput = inputEl ? inputEl.value.trim() : '';
  const fb = document.getElementById('r-idfb');
  if (!rawInput) { fb.textContent = 'Please select or enter your Full Name.'; fb.className = 'idfb err'; gateSetError('r-gate'); return; }

  let targetStaff = null;
  const staffList = await loadStaffCache();

  if (inputEl.dataset.selectedStaff) {
    try { targetStaff = JSON.parse(inputEl.dataset.selectedStaff); } catch (e) {}
  }

  // Always resolve against full staff list to ensure all properties (gender, position, location, annualDays, etc.) exist
  let fullStaff = null;
  if (targetStaff && targetStaff.empId) {
    const tid = String(targetStaff.empId).trim().toUpperCase();
    fullStaff = staffList.find(s => String(s.empId).trim().toUpperCase() === tid || String(s.empId).replace(/^0+/, '') === tid.replace(/^0+/, ''));
  }
  if (!fullStaff && targetStaff && (targetStaff.name || targetStaff.nameKh)) {
    const n = String(targetStaff.name || '').trim().toLowerCase();
    const nk = String(targetStaff.nameKh || '').trim().toLowerCase();
    fullStaff = staffList.find(s => (s.name && String(s.name).trim().toLowerCase() === n) || (s.nameKh && String(s.nameKh).trim().toLowerCase() === nk));
  }

  if (!fullStaff) {
    const match = rawInput.match(/\(([^)]+)\)$/);
    const targetId = match ? match[1].trim() : '';
    const cleanName = rawInput.replace(/\([^)]+\)$/, '').trim().toLowerCase();
    fullStaff = staffList.find(s => {
      const idMatch = targetId && (String(s.empId).trim().toUpperCase() === targetId.toUpperCase() || String(s.empId).replace(/^0+/, '') === targetId.replace(/^0+/, ''));
      const nameMatch = (s.name && String(s.name).trim().toLowerCase() === cleanName) || (s.nameKh && String(s.nameKh).trim().toLowerCase() === cleanName);
      return idMatch || nameMatch;
    });
  }

  if (fullStaff) {
    targetStaff = Object.assign({}, fullStaff);
  } else {
    try {
      const res = await apiPost('getStaff', { empId: rawInput, query: rawInput });
      if (res && res.result === 'success' && res.staff) {
        targetStaff = res.staff;
      }
    } catch(e){}
  }

  if (!targetStaff || (!targetStaff.name && !targetStaff.nameKh && !targetStaff.empId)) {
    fb.textContent = 'Staff name not found. Please select from the dropdown.'; fb.className = 'idfb err'; gateSetError('r-gate'); return;
  }

  // Ensure default fallbacks for essential profile fields
  if (!targetStaff.gender) targetStaff.gender = 'Male';
  if (!targetStaff.location) targetStaff.location = 'Phnom Penh';
  if (targetStaff.annualDays === undefined || targetStaff.annualDays === null || isNaN(Number(targetStaff.annualDays))) targetStaff.annualDays = 18;
  if (targetStaff.usedDays === undefined || targetStaff.usedDays === null || isNaN(Number(targetStaff.usedDays))) targetStaff.usedDays = 0;

  // Reconcile usedDays if 0 from history if available
  if (Number(targetStaff.usedDays) === 0 && _appInitData && _appInitData.history) {
    const sId = String(targetStaff.empId || '').toUpperCase();
    const sIdTrim = sId.replace(/^0+/, '');
    const approvedAL = _appInitData.history.filter(h => {
      const hId = String(h.empId || '').toUpperCase();
      const idMatch = hId && (hId === sId || hId.replace(/^0+/, '') === sIdTrim);
      const isApproved = h.status === 'Approved';
      const isAL = (h.leaveType || h.type || '').toLowerCase().includes('annual') || (h.leaveType || h.type || '').includes('ប្រចាំឆ្នាំ');
      return idMatch && isApproved && isAL;
    });
    const calcUsed = approvedAL.reduce((sum, h) => sum + (Number(h.workingDays || h.days) || 0), 0);
    if (calcUsed > 0) targetStaff.usedDays = calcUsed;
  }

  rStaff = targetStaff;
  saveUserDeviceMemory(rStaff);
  rStaff._usedDates = [];
  if (_appInitData && _appInitData.history) {
    const sId = String(targetStaff.empId || '').toUpperCase();
    const sIdTrim = sId.replace(/^0+/, '');
    const histData = _appInitData.history.filter(r => {
      const hId = String(r.empId || '').toUpperCase();
      return hId && (hId === sId || hId.replace(/^0+/, '') === sIdTrim);
    });
    histData.forEach(r => { if (r.status !== 'Rejected' && r.from && r.to) rStaff._usedDates.push({ from: r.from, to: r.to, status: r.status }); });
  }

  document.getElementById('r-gate').style.display = 'none';
  document.getElementById('req-form').style.display = 'grid';
  setReqBar(2); rLoadForm(); setRStep(2);
}

function rLoadForm(){
  if(!rStaff) return;
  const s=rStaff;
  const name=(LANG==='kh'?(s.nameKh||s.name):s.name)||(s.name||s.nameKh||'Staff');
  const rawPos=(LANG==='kh'?(s.positionKh||s.position):s.position);
  const pos=(rawPos&&rawPos!=='undefined'&&rawPos!=='—')?rawPos:'—';
  const gen=formatGender(s.gender, LANG);
  const today=todayFmt();
  const loc=s.location||'Phnom Penh';

  const eidEl=document.getElementById('rf-eid'); if(eidEl) eidEl.value=s.empId||'';
  const nameEl=document.getElementById('rf-name'); if(nameEl) nameEl.value=name;
  const genEl=document.getElementById('rf-gen'); if(genEl) genEl.value=formatGender(s.gender, 'en');
  const posEl=document.getElementById('rf-pos'); if(posEl) posEl.value=(pos==='—'?'':pos);
  const sdateEl=document.getElementById('rf-sdate'); if(sdateEl) sdateEl.value=today;
  const slocEl=document.getElementById('rf-sloc'); if(slocEl) slocEl.value=loc;

  const eidDisp=document.getElementById('rf-eid-disp'); if(eidDisp) eidDisp.textContent=s.empId||'—';
  const nameDisp=document.getElementById('rf-name-disp'); if(nameDisp) nameDisp.textContent=name;
  const genDisp=document.getElementById('rf-gen-disp'); if(genDisp) genDisp.textContent=gen;
  const posDisp=document.getElementById('rf-pos-disp'); if(posDisp) posDisp.textContent=pos;
  const sdateDisp=document.getElementById('rf-sdate-disp'); if(sdateDisp) sdateDisp.textContent=today;
  const slocDisp=document.getElementById('rf-sloc-disp'); if(slocDisp) slocDisp.textContent=loc;

  const av=document.getElementById('rf-avatar');
  if(av) av.textContent=(name.trim().charAt(0)||'S').toUpperCase();

  // Pre-fill dates with today (ISO format YYYY-MM-DD)
  const fromEl=document.getElementById('rf-from'),toEl=document.getElementById('rf-to');
  const tIso = todayISO();
  if(fromEl&&!fromEl.value){fromEl.value=tIso;fromEl.dataset.iso=tIso;}
  if(toEl&&!toEl.value){toEl.value=fromEl.value||tIso;toEl.dataset.iso=fromEl.dataset.iso||tIso;}
  calcDays();
  updateRBal();
  if (typeof initBuiltInCalendar === 'function') initBuiltInCalendar();
  setTimeout(() => {
    if (typeof startGuidedTour === 'function') startGuidedTour();
  }, 450);
}

function updateRBal(){
  if(!rStaff)return;
  const s=rStaff;
  const tot=Number(s.annualDays)||(s.annualDays===0?0:18);
  const used=Number(s.usedDays)||0;
  const rem=Math.max(0, tot-used);
  const ratio=tot>0?Math.max(0, Math.min(1, rem/tot)):0;
  const pct=Math.round(ratio*100);
  const staffPos=(LANG==='kh'?(s.positionKh||s.position):s.position)||'';
  const posClean=(staffPos&&staffPos!=='undefined')?staffPos:'';
  const staffName=(LANG==='kh'?(s.nameKh||s.name):s.name)||'Staff';
  
  const nameEl=document.getElementById('r-bal-name');
  if(nameEl) nameEl.textContent=posClean?(staffName+' — '+posClean):staffName;
  
  const remDisplay=Number(rem)%1===0?rem:rem.toFixed(1);
  const usedDisplay=Number(used)%1===0?used:(+used).toFixed(1);
  const dayWord=LANG==='kh'?'ថ្ងៃ':(Number(remDisplay)===1?'day':'days');
  const usedDayWord=LANG==='kh'?'ថ្ងៃ':(Number(usedDisplay)===1?'day':'days');
  const totDayWord=LANG==='kh'?'ថ្ងៃ':(Number(tot)===1?'day':'days');
  
  const valEl=document.getElementById('r-bal-rem-val');
  if(valEl) valEl.textContent=remDisplay;
  
  const lblEl=document.getElementById('r-bal-rem-lbl');
  if(lblEl) lblEl.textContent=LANG==='kh'?'ថ្ងៃនៅសល់':'Days Left';
  
  const usedValEl=document.getElementById('r-bal-used-val');
  if(usedValEl) usedValEl.textContent=usedDisplay+' '+usedDayWord;

  const totValEl=document.getElementById('r-bal-tot-val');
  if(totValEl) totValEl.textContent=tot+' '+totDayWord;

  // SVG Circle stroke-dashoffset: Circumference for r=48 is 2 * PI * 48 ≈ 301.59
  const circleBar=document.getElementById('r-bal-circle-bar');
  if(circleBar){
    const C = 301.59;
    const offset = C * (1 - ratio);
    circleBar.style.strokeDasharray = `${C}`;
    circleBar.style.strokeDashoffset = `${offset}`;
    if(ratio > 0.35) {
      circleBar.style.stroke = 'var(--ok, #16a34a)';
    } else if(ratio > 0.15) {
      circleBar.style.stroke = 'var(--warn, #eab308)';
    } else {
      circleBar.style.stroke = 'var(--red, #c0272d)';
    }
  }

  const legacyRem=document.getElementById('r-bal-rem');
  if(legacyRem) legacyRem.textContent=remDisplay+' '+dayWord+(LANG==='kh'?'':' remaining');
  const legacyFill=document.getElementById('r-bal-fill');
  if(legacyFill) legacyFill.style.width=pct+'%';
  const legacyDetail=document.getElementById('r-bal-detail');
  if(legacyDetail) legacyDetail.textContent=usedDisplay+' / '+tot+' '+(LANG==='kh'?'ថ្ងៃ':'days');
}

document.querySelectorAll('.topt input[type=radio]').forEach(r=>{r.addEventListener('change',()=>{document.querySelectorAll('.topt').forEach(o=>o.classList.remove('sel'));r.closest('.topt').classList.add('sel');},{passive:true});});
function clearFieldErr() {
  document.querySelectorAll('.field-err, .tgrid-err, .other-type-err, .input-err, .card-err').forEach(el => {
    el.classList.remove('field-err', 'tgrid-err', 'other-type-err', 'input-err', 'card-err');
  });
  const errSummary = document.getElementById('req-err-summary');
  if (errSummary) errSummary.style.display = 'none';

  ['rf-from-err', 'rf-to-err', 'rf-type-err', 'rf-other-err', 'rf-rsn-err'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = '';
      el.style.display = 'none';
    }
  });
}

function getHolidaysInRange(fromIso, toIso) {
  if (!fromIso || !toIso || fromIso > toIso || !Array.isArray(_holidaysList)) return [];
  return _holidaysList.filter(h => {
    const iso = h.date || h.dateISO;
    return iso && iso >= fromIso && iso <= toIso;
  });
}

let _cdT;
function calcDays(now){
  if(!now){clearTimeout(_cdT);_cdT=setTimeout(()=>calcDays(1),30);return;}
  const from = getIsoDateVal('rf-from');
  const to = getIsoDateVal('rf-to');
  const pill = document.getElementById('r-dpill');
  const row = document.getElementById('halfday-row');
  const noticeEl = document.getElementById('req-date-notice');

  if(!from || !to){
    if (pill) pill.style.display = 'none';
    if (row) row.style.display = 'none';
    if (noticeEl) { noticeEl.innerHTML = ''; noticeEl.style.display = 'none'; }
    return;
  }

  if (from > to) {
    if (pill) pill.style.display = 'none';
    if (row) row.style.display = 'none';
    if (noticeEl) {
      noticeEl.className = 'date-notice-card date-notice-err';
      noticeEl.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:#dc2626;margin-top:1px">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        <div><strong>Invalid Date Range:</strong> Return date (To Date) must be on or after start date (From Date).</div>
      `;
      noticeEl.style.display = 'flex';
    }
    return;
  }

  const wd = workDays(from, to);
  const single = (from === to);
  const weCount = weekendDays(from, to);
  const holCount = holidayDays(from, to);
  const holsInRange = getHolidaysInRange(from, to);

  // Total calendar days
  const dFrom = new Date(from + 'T00:00:00');
  const dTo = new Date(to + 'T00:00:00');
  const calDays = Math.round((dTo - dFrom) / (1000 * 60 * 60 * 24)) + 1;

  // Render Date Notice Breakdown
  if (noticeEl) {
    if (wd === 0) {
      const skipReasons = [];
      if (weCount > 0) skipReasons.push(`${weCount} weekend ${weCount === 1 ? 'day' : 'days'} (Sat/Sun)`);
      if (holCount > 0) {
        const holNames = holsInRange.map(h => h.name || 'Holiday').join(', ');
        skipReasons.push(`${holCount} official holiday (${holNames})`);
      }
      noticeEl.className = 'date-notice-card date-notice-warn';
      noticeEl.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:#ca8a04;margin-top:1px">
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path>
          <line x1="12" y1="9" x2="12" y2="13"></line>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        <div>
          <div style="font-weight:700;margin-bottom:2px">Non-Working Days Selected (0 Days Deducted)</div>
          <div style="font-size:11.5px;opacity:0.95">All selected dates fall on ${skipReasons.join(' & ')}. You do not need to request annual leave for non-working days.</div>
        </div>
      `;
      noticeEl.style.display = 'flex';
    } else if (weCount > 0 || holCount > 0) {
      const skipDetails = [];
      if (weCount > 0) skipDetails.push(`${weCount} weekend ${weCount === 1 ? 'day' : 'days'}`);
      if (holCount > 0) {
        const holNames = holsInRange.map(h => h.name || 'Holiday').join(', ');
        skipDetails.push(`${holCount} holiday (${holNames})`);
      }
      noticeEl.className = 'date-notice-card date-notice-info';
      noticeEl.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="flex-shrink:0;color:#16a34a;margin-top:1px">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="16" x2="12" y2="12"></line>
          <line x1="12" y1="8" x2="12.01" y2="8"></line>
        </svg>
        <div>
          <span style="font-weight:700">Notice:</span> Total <strong>${calDays} calendar days</strong> = <strong>${wd} working days requested</strong> (${skipDetails.join(' & ')} automatically excluded from leave deduction).
        </div>
      `;
      noticeEl.style.display = 'flex';
    } else {
      noticeEl.style.display = 'none';
      noticeEl.innerHTML = '';
    }
  }

  if (wd === 0) {
    document.getElementById('r-dnum').textContent = '0';
    const di = document.getElementById('r-dinfo');
    if (di) di.textContent = (LANG === 'kh' ? 'មិនមានថ្ងៃធ្វើការ (ថ្ងៃបុណ្យ ឬចុងសប្តាហ៍)' : '0 Working Days (Weekends/Holidays)');
    const ds = document.getElementById('r-dsub');
    if (ds) ds.textContent = (LANG === 'kh' ? 'ថ្ងៃចុងសប្តាហ៍ និងថ្ងៃបុណ្យត្រូវបានរំលង' : 'Non-working days are excluded from deduction');
    if (pill) pill.style.display = 'flex';
    if (row) row.style.display = 'none';
    return;
  }

  const singleDiv = document.getElementById('hd-single'), multiDiv = document.getElementById('hd-multi');
  if (row) {
    row.style.display = 'block';
    if (singleDiv) singleDiv.style.display = single ? 'grid' : 'none';
    if (multiDiv) multiDiv.style.display = single ? 'none' : 'block';
  }
  // Update date labels in multi picker
  if (!single) {
    const fd = document.getElementById('hd-first-date'), ld = document.getElementById('hd-last-date');
    if (fd) fd.textContent = fmtDate(from) + (isNonWorkingDay(from) ? ' (Non-working)' : '');
    if (ld) ld.textContent = fmtDate(to) + (isNonWorkingDay(to) ? ' (Non-working)' : '');
  }
  const d = getActualDays(from, to);
  document.getElementById('r-dnum').textContent = d;
  const ltype = document.querySelector('input[name=ltype]:checked');
  const typeTxt = ltype ? ltype.value : 'Leave';
  const halfNote = getHalfNote(from, to);
  const anyHalf = hdGetFirst() !== 'full' || ((!single) && hdGetLast() !== 'full');
  
  let mainTxt, subTxt;
  const skipCount = weCount + holCount;
  const skipNote = skipCount > 0 ? (LANG === 'kh' ? ` · រំលង ${skipCount} ថ្ងៃមិនធ្វើការ` : ` · ${skipCount} non-working days skipped`) : '';
  
  if (single && anyHalf) {
    mainTxt = 'Half day ' + hdLabel(hdGetFirst()) + ' · ' + fmtDate(from);
    subTxt = typeTxt;
  } else if (!single && halfNote) {
    mainTxt = typeTxt + halfNote;
    subTxt = fmtDate(from) + ' → ' + fmtDate(to) + skipNote;
  } else if (single) {
    mainTxt = typeTxt;
    subTxt = fmtDate(from);
  } else {
    mainTxt = typeTxt + ' (' + d + ' working ' + (d === 1 ? 'day' : 'days') + ')';
    subTxt = fmtDate(from) + ' → ' + fmtDate(to) + skipNote;
  }
  
  const di = document.getElementById('r-dinfo'); if (di) di.textContent = mainTxt;
  const ds = document.getElementById('r-dsub'); if (ds) ds.textContent = subTxt;
  if (pill) pill.style.display = 'flex';
  
  const hdRow = document.getElementById('halfday-row');
  const hdLbl = document.getElementById('hd-section-label');
  if (hdRow) {
    hdRow.style.borderColor = anyHalf ? 'var(--ok)' : null;
    hdRow.style.background = anyHalf ? 'var(--ok-soft)' : null;
    hdRow.style.boxShadow = anyHalf ? '0 0 0 3px rgba(30,122,74,.15)' : null;
  }
  if (hdLbl) {
    hdLbl.style.color = anyHalf ? 'var(--ok)' : null;
    hdLbl.style.background = anyHalf ? 'var(--ok-soft)' : null;
  }
}

function rShowPreview(){
  const pBtn = document.getElementById('r-prev-btn');
  if (pBtn) pBtn.classList.remove('btn-continue-glowing');
  clearFieldErr();
  const from = getIsoDateVal('rf-from');
  const to = getIsoDateVal('rf-to');
  const rsnEl = document.getElementById('rf-rsn');
  const rsn = rsnEl ? rsnEl.value.trim() : '';
  const ltype = document.querySelector('input[name=ltype]:checked');
  const otherInput = document.getElementById('rf-other-type');
  const otherVal = otherInput ? otherInput.value.trim() : '';

  const _missing = [];
  let firstErrEl = null;

  // 1. Staff check
  if (!rStaff) {
    _missing.push('Staff identity (Please select your name)');
    const gateInput = document.getElementById('r-name-input');
    if (gateInput) {
      gateInput.classList.add('input-err');
      if (!firstErrEl) firstErrEl = gateInput;
    }
  }

  // 2. From Date
  if (!from) {
    _missing.push('Start Date (From Date)');
    const fField = document.getElementById('f-rf-from');
    if (fField) fField.classList.add('field-err');
    const fErr = document.getElementById('rf-from-err');
    if (fErr) {
      fErr.textContent = 'Please choose start date.';
      fErr.style.display = 'flex';
    }
    if (!firstErrEl) firstErrEl = fField || document.getElementById('rf-from');
  }

  // 3. To Date
  if (!to) {
    _missing.push('End Date (To Date)');
    const tField = document.getElementById('f-rf-to');
    if (tField) tField.classList.add('field-err');
    const tErr = document.getElementById('rf-to-err');
    if (tErr) {
      tErr.textContent = 'Please choose end date.';
      tErr.style.display = 'flex';
    }
    if (!firstErrEl) firstErrEl = tField || document.getElementById('rf-to');
  }

  // 4. Date order
  if (from && to && from > to) {
    _missing.push('Valid Date Range (End date must be on or after start date)');
    const fField = document.getElementById('f-rf-from');
    const tField = document.getElementById('f-rf-to');
    if (fField) fField.classList.add('field-err');
    if (tField) tField.classList.add('field-err');
    const tErr = document.getElementById('rf-to-err');
    if (tErr) {
      tErr.textContent = 'End date cannot be earlier than start date.';
      tErr.style.display = 'flex';
    }
    if (!firstErrEl) firstErrEl = tField;
  }

  // 5. Leave Type
  if (!ltype) {
    _missing.push('Leave Type');
    const g = document.getElementById('ltype-grid');
    if (g) g.classList.add('tgrid-err');
    const typeErr = document.getElementById('rf-type-err');
    if (typeErr) {
      typeErr.textContent = 'Please select a leave category.';
      typeErr.style.display = 'flex';
    }
    if (!firstErrEl) firstErrEl = document.getElementById('rsc-type') || g;
  } else if (ltype.value === 'Other' && !otherVal) {
    _missing.push('Specify Other Leave Type');
    if (otherInput) {
      otherInput.classList.add('other-type-err');
      otherInput.focus();
    }
    const oErr = document.getElementById('rf-other-err');
    if (oErr) {
      oErr.textContent = 'Please specify the custom leave type.';
      oErr.style.display = 'flex';
    }
    if (!firstErrEl) firstErrEl = otherInput;
  }

  // 6. Reason
  if (!rsn) {
    _missing.push('Reason / Description');
    const rCard = document.getElementById('rsc-reason');
    if (rCard) rCard.classList.add('field-err');
    if (rsnEl) rsnEl.classList.add('input-err');
    const rErr = document.getElementById('rf-rsn-err');
    if (rErr) {
      rErr.textContent = 'Please provide a brief reason for HR & management approval.';
      rErr.style.display = 'flex';
    }
    if (!firstErrEl) firstErrEl = rsnEl || rCard;
  }

  // If validation errors exist, render glowing error summary and focus
  if (_missing.length > 0) {
    const summary = document.getElementById('req-err-summary');
    const list = document.getElementById('req-err-list');
    if (summary && list) {
      list.innerHTML = _missing.map(m => `<li>${m}</li>`).join('');
      summary.style.display = 'block';
    }
    if (firstErrEl) {
      firstErrEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (typeof firstErrEl.focus === 'function') firstErrEl.focus();
    }
    toast(LANG === 'kh' ? 'សូមបំពេញព័ត៌មានដែលបានសម្គាល់ពណ៌ក្រហម' : 'Please complete all highlighted fields to continue.', 'bad');
    return;
  }

  // 7. Check non-working days
  const days = getActualDays(from, to);
  if (days <= 0) {
    const fField = document.getElementById('f-rf-from');
    const tField = document.getElementById('f-rf-to');
    if (fField) fField.classList.add('field-err');
    if (tField) tField.classList.add('field-err');
    
    toast(LANG === 'kh' ? 'មិនអាចស្នើសុំច្បាប់នៅថ្ងៃឈប់សម្រាកបុណ្យ ឬចុងសប្តាហ៍ (០ ថ្ងៃការងារ)' : 'Cannot submit leave for non-working days (0 working days to deduct).', 'bad');
    if (fField) fField.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  // 8. Overlap check against existing Pending/Approved requests
  if (rStaff._usedDates && rStaff._usedDates.length) {
    const conflict = rStaff._usedDates.find(r => from <= r.to && to >= r.from);
    if (conflict) {
      const fField = document.getElementById('f-rf-from');
      const tField = document.getElementById('f-rf-to');
      if (fField) fField.classList.add('field-err');
      if (tField) tField.classList.add('field-err');
      toast('You already have a ' + conflict.status + ' request on overlapping dates (' + fmtDate(conflict.from) + (conflict.from !== conflict.to ? ' – ' + fmtDate(conflict.to) : '') + ').', 'bad');
      return;
    }
  }

  const halfNote = getHalfNote(from, to), s = rStaff;
  const name = LANG === 'kh' ? (s.nameKh || s.name) : s.name;
  const pos = LANG === 'kh' ? (s.positionKh || s.position) : s.position;
  const gen = formatGender(s.gender, LANG);
  const typeDisplay = (ltype.value === 'Other' ? (otherVal || 'Other') : ltype.value) + halfNote;
  const daysLabel = days + ' day' + (days === 1 ? '' : (days === 0.5 ? '' : 's')) + halfNote;
  
  const _rows = [
    [tx('ptEid'), s.empId, false],
    [tx('ptName'), name, false],
    [tx('ptGen'), gen, false],
    [tx('ptPos'), document.getElementById('rf-pos').value || pos, false],
    [tx('ptType'), typeDisplay, true],
    [tx('ptFrom'), fmtDate(from), true],
    [tx('ptTo'), fmtDate(to), true],
    [tx('ptDays'), daysLabel, true],
    [tx('ptRsn'), rsn, false],
    [tx('ptSub'), todayFmt(), false]
  ];
  
  document.getElementById('rpr-table').innerHTML = _rows.map(([k, v, h]) => `<tr class="${h ? 'rv-hl-row' : ''}"><td>${k}</td><td class="${h ? 'rv-hl' : ''}">${v}</td></tr>`).join('');
  const rm = document.getElementById('review-modal');
  if (rm) rm.style.display = 'flex';
  setRStep(3);
}

// ── Close review modal (back to form) ──
function closeReviewModal(){
  const rm=document.getElementById('review-modal');if(rm)rm.style.display='none';setRStep(2);
}
function rBackForm(){closeReviewModal();}
async function rConfirm(){
  if(_isSubmitting)return;
  _isSubmitting=true;
  closeReviewModal();
  const btn=document.getElementById('r-confirm-btn'),sp=document.getElementById('r-con-sp'),txt=document.getElementById('r-con-txt');
  btn.disabled=true;sp.style.display='block';txt.textContent='...';
  const from=document.getElementById('rf-from').value,to=document.getElementById('rf-to').value;
  const ltype=document.querySelector('input[name=ltype]:checked');
  const isTraining=ltype&&(ltype.value==='Training / Mission');
  const days=getActualDays(from,to);
  if(days<=0){
    toast(LANG==='kh'?'មិនអាចស្នើសុំនៅថ្ងៃសៅរ៍ ឬអាទិត្យបានទេ ព្រោះជាថ្ងៃឈប់សម្រាក':'Cannot request leave on Saturday or Sunday (Non-working days).','bad');
    _isSubmitting=false;
    btn.disabled=false;sp.style.display='none';txt.textContent=tx('conTxt');
    return;
  }
  const halfNote=getHalfNote(from,to);
  const payload={employeeId:rStaff.empId,name:rStaff.name,gender:rStaff.gender,position:document.getElementById('rf-pos').value||rStaff.position,leaveType:(ltype.value==='Other'?(document.getElementById('rf-other-type').value.trim()||'Other'):ltype.value)+(halfNote),dateFrom:from,dateTo:to,workingDays:days,halfFirstDay:hdGetFirst(),halfLastDay:hdGetLast(),reason:document.getElementById('rf-rsn').value,submissionDate:todayFmt(),submittedFrom:document.getElementById('rf-sloc').value||'Phnom Penh',status:'Pending',language:LANG.toUpperCase(),timestamp:new Date().toISOString()};
  if(isTraining){
    if (_appInitData) {
      if (!_appInitData.history) _appInitData.history = [];
      _appInitData.history.unshift({
        id: 'REQ-NEW',
        empId: rStaff.empId,
        empName: rStaff.name,
        name: rStaff.name,
        position: rStaff.position,
        gender: rStaff.gender,
        leaveType: payload.leaveType,
        type: payload.leaveType,
        from: from,
        dateFrom: from,
        to: to,
        dateTo: to,
        days: Number(days) || 1,
        workingDays: Number(days) || 1,
        status: 'Pending',
        submitted: todayFmt()
      });
      loadHomeLeaveBoard();
    }
    // Training/Mission: submit to sheets (noLeave handled server-side), no print required
    if(!isMock()){
      apiPost('submitRequest',payload).then(()=>{
        _appInitData = null;
        loadStaffCache().then(() => loadHomeLeaveBoard());
      }).catch(()=>{});
    }
    setRStep(4);setReqBar(0);
    document.getElementById('req-form').style.display='none';
    document.getElementById('r-success').style.display='flex';
    btn.disabled=false;sp.style.display='none';txt.textContent=tx('conTxt');
    toast('Submitted to HR','ok2');
    _isSubmitting=false;
    return;
  }
  // Store payload — actual submit happens in doConfirm() only
  _pendingPayload={payload,from,to,days:String(days)};
  btn.disabled=false;sp.style.display='none';txt.textContent=tx('conTxt');
  // Show yellow warning modal — submit only if user clicks Confirm, not Cancel
  const m=document.getElementById('confirm-modal');
  m.classList.add('open');m.style.display='flex';
}
let _lastSubmit=null;
let _isSubmitting=false;
let _pendingPayload=null;
function closeModal(){
  const m=document.getElementById('confirm-modal');
  m.classList.remove('open');m.style.display='none';
}
function cancelConfirmModal(){
  closeModal();
  _isSubmitting=false;
  _pendingPayload=null;
  // Return user to review modal (where they came from)
  const rm=document.getElementById('review-modal');
  if(rm)rm.style.display='flex';
  setRStep(3);
}
function doConfirm(){
  closeModal();
  if(_pendingPayload){
    const{payload,from,to,days}=_pendingPayload;
    _lastSubmit={...payload,from,to,days,requestId:''};
    if (_appInitData) {
      if (!_appInitData.history) _appInitData.history = [];
      _appInitData.history.unshift({
        id: 'REQ-NEW',
        empId: (rStaff && rStaff.empId) || payload.employeeId,
        empName: (rStaff && rStaff.name) || payload.name,
        name: (rStaff && rStaff.name) || payload.name,
        position: (rStaff && rStaff.position) || payload.position,
        gender: (rStaff && rStaff.gender) || payload.gender,
        leaveType: payload.leaveType,
        type: payload.leaveType,
        from: from,
        dateFrom: from,
        to: to,
        dateTo: to,
        days: Number(days) || 1,
        workingDays: Number(days) || 1,
        status: 'Pending',
        submitted: todayFmt()
      });
      loadHomeLeaveBoard();
    }
    if(!isMock()){
      // Fire-and-forget — update requestId in background when server responds
      apiPost('submitRequest',payload).then(function(res){
        if(res&&res.requestId&&_lastSubmit){_lastSubmit.requestId=res.requestId;}
        _appInitData = null;
        loadStaffCache().then(() => loadHomeLeaveBoard());
      }).catch(function(){});
    }
  }
  _isSubmitting=false;
  _pendingPayload=null;
  setRStep(4);
  document.getElementById('req-form').style.display='none';
  const suc=document.getElementById('r-success');
  suc.style.display='flex';
  setReqBar(0);
  if(_lastSubmit){fillPrint(_lastSubmit,_lastSubmit.from,_lastSubmit.to,_lastSubmit.days);}
  // Populate rich success page
  rPopulateSuccess();
  // Reset form fields
  document.getElementById('rf-from').value='';
  document.getElementById('rf-to').value='';
  document.getElementById('rf-rsn').value='';
  document.querySelectorAll('input[name=ltype]').forEach(r=>{r.checked=false;r.closest('.topt').classList.remove('sel');});
  document.querySelectorAll('.topt').forEach(t=>t.classList.remove('sel'));
  document.querySelectorAll('input[name=halfday-first][value="full"],input[name=halfday-last][value="full"]').forEach(r=>r.checked=true);
  document.getElementById('r-dpill').style.display='none';
  document.getElementById('halfday-row').style.display='none';
}
function rReprintLast(){if(_lastSubmit)fillPrint(_lastSubmit,_lastSubmit.from,_lastSubmit.to,_lastSubmit.days);}
function rPopulateSuccess(){
  const s=rStaff,d=_lastSubmit;
  if(!s||!d)return;
  // Submitted summary
  const sumEl=document.getElementById('rsuc-summary');
  if(sumEl){
    sumEl.innerHTML=[
      ['Type',d.leaveType||'—'],
      ['From',fmtDate(d.from||d.dateFrom)],
      ['To',fmtDate(d.to||d.dateTo)],
      ['Days',d.days+' day'+(d.days==1?'':'s')],
      ['Reason',d.reason||'—']
    ].map(([k,v])=>`<div class="rsuc-row"><span class="rsuc-key">${k}</span><span class="rsuc-val">${v}</span></div>`).join('');
  }
  // Balance — calculate post-submission
  const balEl=document.getElementById('rsuc-balance');
  if(balEl){
    const total=s.annualDays||0;
    const usedBefore=s.usedDays||0;
    const justUsed=Number(d.days)||0;
    const newUsed=usedBefore+justUsed;
    const rem=total-newUsed;
    const pct=total>0?Math.min(100,Math.round(newUsed/total*100)):0;
    const remColor=rem>5?'var(--ok)':rem>0?'var(--warn)':'var(--red)';
    balEl.innerHTML=`<div class="rsuc-bal-stat"><div class="rsuc-bal-num">${total}</div><div class="rsuc-bal-lbl">Total</div></div>`+
      `<div class="rsuc-bal-stat"><div class="rsuc-bal-num" style="color:var(--warn)">${newUsed}</div><div class="rsuc-bal-lbl">Used</div></div>`+
      `<div class="rsuc-bal-stat"><div class="rsuc-bal-num" style="color:${remColor}">${rem}</div><div class="rsuc-bal-lbl">Remaining</div></div>`+
      `<div style="grid-column:1/-1"><div class="balbar" style="margin-top:6px"><div class="balfill" style="width:${pct}%"></div></div></div>`;
  }
  // Fetch fresh history in background
  const histEl=document.getElementById('rsuc-history');
  if(!histEl)return;
  histEl.innerHTML=`<div class="rsuc-loading"><svg style="animation:spin .7s linear infinite" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> Loading…</div>`;
  (isMock()?Promise.resolve({result:'notfound'}):apiPost('getHistory',{empId:s.empId,fullName:s.name})).then(res=>{
    if(res.result==='success'&&res.history&&res.history.length){
      histEl.innerHTML=`<div class="rsuc-hist-wrap"><table class="rsuc-hist-tbl"><thead><tr><th>Type</th><th>From</th><th>Days</th><th>Status</th></tr></thead><tbody>`+
        res.history.slice(0,8).map(r=>`<tr><td>${r.type||'—'}</td><td style="white-space:nowrap">${fmtDate(r.from)}</td><td style="text-align:center">${r.days}</td><td><span class="badge b-${(r.status||'').toLowerCase()}" style="font-size:10px">${r.status}</span></td></tr>`).join('')+
        `</tbody></table></div>`;
    } else {
      histEl.innerHTML=`<div style="font-size:13px;color:var(--txt3);padding:8px 0">No previous requests found.</div>`;
    }
  }).catch(()=>{histEl.innerHTML=`<div style="font-size:13px;color:var(--txt3)">Could not load history.</div>`;});
}

// ── PRINT FILL ───────────────────────────────────
function openPrint(data){
  localStorage.setItem('lbs_print_data', JSON.stringify(data));
  window.open('print/index.html','_blank');
}
function fillPrint(d,from,to,days){
  const s=rStaff,name=LANG==='kh'?(s.nameKh||s.name):s.name,pos=LANG==='kh'?(s.positionKh||s.position):s.position,gen=formatGender(s.gender, LANG);
  openPrint({name,gender:gen,position:pos,empId:s.empId,leaveType:d.leaveType,days:String(days),reason:d.reason||'',dateFrom:from,dateTo:to,lang:LANG,requestId:d.requestId||''});
}
function fillPrintRecord(r,staff){
  const name=LANG==='kh'?(staff.nameKh||staff.name):staff.name,pos=LANG==='kh'?(staff.positionKh||staff.position):staff.position,gen=formatGender(staff.gender, LANG);
  openPrint({name,gender:gen,position:pos,empId:staff.empId||'',leaveType:LANG==='kh'?(r.typeKh||r.type):r.type,days:String(r.days),reason:r.reason||'',dateFrom:r.from,dateTo:r.to,lang:LANG,requestId:r.id||''});
}


// ══════════════════ STATUS ══════════════════════
let stStaff=null,stHistory=[],stNotices=[],stHistYear=new Date().getFullYear();
function stSetHistYear(val){stHistYear=val==='all'?'all':parseInt(val,10);renderStDash();}
function stRefreshAll(){
  const btn=document.getElementById('st-refresh-btn');
  const icon=document.getElementById('st-refresh-icon');
  if(btn){btn.disabled=true;btn.style.color='#ca8a04';}
  if(icon)icon.style.animation='spin .7s linear infinite';
  Promise.all([
    isMock()?Promise.resolve({result:'notfound'}):apiPost('getHistory',{empId:stStaff.empId,fullName:stStaff.name}),
    isMock()?Promise.resolve({result:'notfound'}):apiPost('getStaffNotices',{empId:stStaff.empId,fullName:stStaff.name})
  ]).then(([hRes,nRes])=>{
    if(hRes.result==='success'){stHistory=hRes.history||[];}
    if(nRes.result==='success'){stNotices=nRes.notices||[];}
    renderStDash();
    toast('Up to date','ok2');
  }).catch(()=>toast('Refresh failed','bad'))
  .finally(()=>{
    if(icon)icon.style.animation='';
    if(btn){btn.disabled=false;btn.style.color='';}
  });
}
function stPopulateYearFilter(){
  const sel=document.getElementById('st-hist-yr');
  if(!sel)return;
  const cur=new Date().getFullYear();
  const years=new Set([cur]);
  stHistory.forEach(r=>{
    const d=r.from?new Date(r.from.includes('T')||r.from.includes('/')?r.from:r.from+'T00:00:00'):null;
    if(d&&!isNaN(d))years.add(d.getFullYear());
  });
  const sorted=[...years].sort((a,b)=>b-a);
  sel.innerHTML='<option value="all">All Years</option>'+sorted.map(y=>`<option value="${y}"${y===stHistYear||y==stHistYear?'selected':''}>${y}</option>`).join('');
}
function stReset(){
  stStaff=null;stHistory=[];stNotices=[];stHistYear=new Date().getFullYear();
  const gate = document.getElementById('st-gate');
  const dash = document.getElementById('st-dash');
  if (gate) gate.style.display='block';
  if (dash) dash.style.display='none';
  const _sni=document.getElementById('st-name-input');
  if(_sni){
    const saved = getSavedUserDeviceMemory();
    if(saved){
      _sni.value = (saved.name || '') + ' (' + saved.empId + ')';
      _sni.dataset.selectedStaff = JSON.stringify(saved);
    } else {
      _sni.value='';
      delete _sni.dataset.selectedStaff;
    }
  }
  updateStaffGateActions('st-name-input');
  const fb = document.getElementById('st-idfb');
  if (fb) fb.textContent='';
}
// ── VERIFY MESSAGE OVERLAY ───────────────────────────────────────
// Shows sequential status messages while API call is in-flight.
// If API resolves before messages finish, cancel() skips immediately.
const GMO_MSGS=['Verifying Credentials','Connecting to Cloud Server','Unlocking HR Dashboard'];
const GMO_DUR=[1800,1800,2200]; // ms per message
function _gmoStart(gateId,msgs,durs){
  msgs=msgs||GMO_MSGS; durs=durs||GMO_DUR;
  const gate=document.getElementById(gateId);
  if(!gate)return{cancel:()=>{}};
  // Remove stale overlay
  const old=document.getElementById('gmo-'+gateId);if(old)old.remove();
  // Build overlay
  const ov=document.createElement('div');
  ov.className='gmo-overlay';ov.id='gmo-'+gateId;
  ov.innerHTML=`<div class="gmo-inner">
    <div class="gmo-header">
      <div class="gmo-title">HR Authentication</div>
      <div class="gmo-subtitle">Authorised Access Verification</div>
    </div>
    <div class="gmo-pipeline">
      <div class="sp-node sp-active sp-circling" id="gmo-n1-${gateId}">
        <div class="sp-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
        </div>
        <div class="sp-label">Credentials</div>
      </div>
      <div class="sp-connector sp-conn-on" id="gmo-c1-${gateId}">
        <div class="sp-line"></div>
        <div class="sp-dot sp-dot1"></div>
        <div class="sp-dot sp-dot2"></div>
        <div class="sp-dot sp-dot3"></div>
      </div>
      <div class="sp-node" id="gmo-n2-${gateId}">
        <div class="sp-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3"/>
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
          </svg>
        </div>
        <div class="sp-label">Cloud Server</div>
      </div>
      <div class="sp-connector" id="gmo-c2-${gateId}">
        <div class="sp-line"></div>
        <div class="sp-dot sp-dot1"></div>
        <div class="sp-dot sp-dot2"></div>
        <div class="sp-dot sp-dot3"></div>
      </div>
      <div class="sp-node" id="gmo-n3-${gateId}">
        <div class="sp-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
            <line x1="8" y1="21" x2="16" y2="21"/>
            <line x1="12" y1="17" x2="12" y2="21"/>
          </svg>
        </div>
        <div class="sp-label">HR Portal</div>
      </div>
    </div>
    <div class="gmo-msg-row">
      <span class="gmo-msg-text" id="gmo-t-${gateId}">Verifying Credentials</span>
      <span class="gmo-dots" id="gmo-d-${gateId}"></span>
    </div>
    <div class="gmo-prog-track">
      <div class="gmo-prog-fill" id="gmo-b-${gateId}"></div>
    </div>
  </div>`;
  document.body.appendChild(ov);
  const tEl=document.getElementById('gmo-t-'+gateId);
  const dEl=document.getElementById('gmo-d-'+gateId);
  const bEl=document.getElementById('gmo-b-'+gateId);
  const n1=document.getElementById('gmo-n1-'+gateId);
  const n2=document.getElementById('gmo-n2-'+gateId);
  const n3=document.getElementById('gmo-n3-'+gateId);
  const c1=document.getElementById('gmo-c1-'+gateId);
  const c2=document.getElementById('gmo-c2-'+gateId);
  // Dots ticker
  let dn=0;
  const dtick=setInterval(()=>{dn=(dn+1)%4;if(dEl)dEl.textContent='.'.repeat(dn);},350);
  // Progress bar
  const total=durs.reduce((a,b)=>a+b,0);
  if(bEl){bEl.style.transition=`width ${total}ms linear`;requestAnimationFrame(()=>requestAnimationFrame(()=>{bEl.style.width='92%';}))}
  // Cancellable sleep via shared resolve
  let _cancelResolve;
  const _cancelSig=new Promise(r=>{_cancelResolve=r;});
  function _csleep(ms){return Promise.race([new Promise(r=>setTimeout(r,ms)),_cancelSig]);}
  // Pipeline node updater
  function setPipelineStep(step){
    if(step===0){
      if(n1)n1.className='sp-node sp-active sp-circling';
      if(n2)n2.className='sp-node';
      if(n3)n3.className='sp-node';
      if(c1)c1.className='sp-connector sp-conn-on';
      if(c2)c2.className='sp-connector';
    }else if(step===1){
      if(n1)n1.className='sp-node sp-active';
      if(n2)n2.className='sp-node sp-active sp-circling';
      if(n3)n3.className='sp-node';
      if(c1)c1.className='sp-connector sp-conn-on';
      if(c2)c2.className='sp-connector sp-conn-on';
    }else if(step>=2){
      if(n1)n1.className='sp-node sp-active';
      if(n2)n2.className='sp-node sp-active';
      if(n3)n3.className='sp-node sp-active sp-circling';
      if(c1)c1.className='sp-connector sp-conn-on';
      if(c2)c2.className='sp-connector sp-conn-on';
    }
  }
  // Message loop (runs in background, independent of API)
  (async()=>{
    for(let i=0;i<msgs.length;i++){
      setPipelineStep(i);
      if(tEl){
        if(i>0){tEl.style.opacity='0';await _csleep(200);}
        tEl.textContent=msgs[i];tEl.style.opacity='1';
      }
      await _csleep(durs[i]);
    }
  })();
  function updateText(msg){
    if(tEl){
      tEl.textContent=msg;
    }
  }
  // cancel(success) — call when verification and background loads finish
  function cancel(ok){
    clearInterval(dtick);
    _cancelResolve(); // abort message loop immediately
    if(ok){
      setPipelineStep(2);
      if(tEl)tEl.textContent='Dashboard Ready';
      if(dEl)dEl.textContent='';
      if(bEl){bEl.style.transition='width 0.2s ease';bEl.style.width='100%';}
      setTimeout(()=>{
        ov.style.transition='opacity 0.22s ease, transform 0.22s ease';
        ov.style.opacity='0';
        setTimeout(()=>{if(ov.parentNode)ov.remove();},240);
      },150);
    }else{
      if(bEl){bEl.style.transition='width 0.2s ease';bEl.style.width='25%';}
      ov.style.transition='opacity 0.22s ease, transform 0.22s ease';
      ov.style.opacity='0';
      setTimeout(()=>{if(ov.parentNode)ov.remove();},240);
    }
  }
  return{cancel,updateText};
}
// ── GATE LOADING ANIMATION ───────────────────────────────────────
function gateSetLoading(gateId,btnId,on){
  const gate=document.getElementById(gateId);
  const btn=document.getElementById(btnId);
  if(gate)gate.classList.toggle('gate-verifying',on);
  if(btn){btn.disabled=on;if(on)btn.classList.add('btn-verifying');else btn.classList.remove('btn-verifying');}
}
function gateSetError(gateId){
  const gate=document.getElementById(gateId);
  if(!gate)return;
  gate.classList.remove('gate-verifying');
  gate.classList.add('gate-error');
  setTimeout(()=>gate.classList.remove('gate-error'),600);
}
async function stVerify(){
  const inputEl = document.getElementById('st-name-input');
  const rawInput = inputEl ? inputEl.value.trim() : '';
  const fb = document.getElementById('st-idfb');
  if (!rawInput) { fb.textContent = 'Please select or enter your Full Name.'; fb.className = 'idfb err'; gateSetError('st-gate'); return; }

  let targetStaff = null;
  const staffList = await loadStaffCache();

  if (inputEl.dataset.selectedStaff) {
    try { targetStaff = JSON.parse(inputEl.dataset.selectedStaff); } catch (e) {}
  }

  let fullStaff = null;
  if (targetStaff && targetStaff.empId) {
    const tid = String(targetStaff.empId).trim().toUpperCase();
    fullStaff = staffList.find(s => String(s.empId).trim().toUpperCase() === tid || String(s.empId).replace(/^0+/, '') === tid.replace(/^0+/, ''));
  }
  if (!fullStaff && targetStaff && (targetStaff.name || targetStaff.nameKh)) {
    const n = String(targetStaff.name || '').trim().toLowerCase();
    const nk = String(targetStaff.nameKh || '').trim().toLowerCase();
    fullStaff = staffList.find(s => (s.name && String(s.name).trim().toLowerCase() === n) || (s.nameKh && String(s.nameKh).trim().toLowerCase() === nk));
  }

  if (!fullStaff) {
    const match = rawInput.match(/\(([^)]+)\)$/);
    const targetId = match ? match[1].trim() : '';
    const cleanName = rawInput.replace(/\([^)]+\)$/, '').trim().toLowerCase();
    fullStaff = staffList.find(s => {
      const idMatch = targetId && (String(s.empId).trim().toUpperCase() === targetId.toUpperCase() || String(s.empId).replace(/^0+/, '') === targetId.replace(/^0+/, ''));
      const nameMatch = (s.name && String(s.name).trim().toLowerCase() === cleanName) || (s.nameKh && String(s.nameKh).trim().toLowerCase() === cleanName);
      return idMatch || nameMatch;
    });
  }

  if (fullStaff) {
    targetStaff = Object.assign({}, fullStaff);
  } else {
    try {
      const res = await apiPost('getStaff', { empId: rawInput, query: rawInput });
      if (res && res.result === 'success' && res.staff) {
        targetStaff = res.staff;
      }
    } catch(e){}
  }

  if (!targetStaff || (!targetStaff.name && !targetStaff.nameKh && !targetStaff.empId)) {
    fb.textContent = 'Staff name not found. Please select from the dropdown.'; fb.className = 'idfb err'; gateSetError('st-gate'); return;
  }

  if (!targetStaff.gender) targetStaff.gender = 'Male';
  if (!targetStaff.location) targetStaff.location = 'Phnom Penh';
  if (targetStaff.annualDays === undefined || targetStaff.annualDays === null || isNaN(Number(targetStaff.annualDays))) targetStaff.annualDays = 18;
  if (targetStaff.usedDays === undefined || targetStaff.usedDays === null || isNaN(Number(targetStaff.usedDays))) targetStaff.usedDays = 0;

  // Instant transition using pre-fetched init data
  stStaff = targetStaff;
  saveUserDeviceMemory(stStaff);
  const sId = String(targetStaff.empId || '').toUpperCase();
  const sIdTrim = sId.replace(/^0+/, '');
  const histData = (_appInitData && _appInitData.history) ? _appInitData.history.filter(r => {
    const hId = String(r.empId || '').toUpperCase();
    return hId && (hId === sId || hId.replace(/^0+/, '') === sIdTrim);
  }) : [];
  stHistory = histData;
  const notData = (_appInitData && _appInitData.notices) ? _appInitData.notices.filter(r => {
    const nId = String(r.empId || '').toUpperCase();
    return nId && (nId === sId || nId.replace(/^0+/, '') === sIdTrim);
  }) : [];
  stNotices = notData;

  document.getElementById('st-gate').style.display = 'none';
  document.getElementById('st-dash').style.display = 'block';
  renderStDash();
}
function renderStDash(){
  if (!stStaff) return;
  const s = stStaff;
  const name = LANG==='kh' ? (s.nameKh || s.name || '') : (s.name || '');
  const pos = LANG==='kh' ? (s.positionKh || s.position || '') : (s.position || '');
  const annual = Number(s.annualDays) || 0;
  const used = Number(s.usedDays) || 0;
  const rem = annual - used;
  const pct = annual > 0 ? Math.round(Math.max(0, (rem / annual) * 100)) : 0;

  const avEl = document.getElementById('st-avatar');
  if (avEl) avEl.textContent = name ? name.charAt(0).toUpperCase() : '–';
  const nameEl = document.getElementById('st-name');
  if (nameEl) nameEl.textContent = name;
  const posEl = document.getElementById('st-pos');
  if (posEl) posEl.textContent = pos;
  const eidEl = document.getElementById('st-eid');
  if (eidEl) eidEl.textContent = s.empId || '';

  const totEl = document.getElementById('st-tot');
  if (totEl) totEl.textContent = annual;
  const usedEl = document.getElementById('st-used');
  if (usedEl) usedEl.textContent = used;
  const remDisp = Number(rem) % 1 === 0 ? rem : rem.toFixed(1);
  const remEl = document.getElementById('st-rem');
  if (remEl) remEl.textContent = remDisp;

  const fillEl = document.getElementById('st-bal-fill');
  if (fillEl) fillEl.style.width = pct + '%';
  const pctEl = document.getElementById('st-bal-pct');
  if (pctEl) pctEl.textContent = pct + '%';

  const nodataEl = document.getElementById('st-nodata');
  if (nodataEl) nodataEl.textContent = tx('stNoData');

  stPopulateYearFilter();
  const tbody = document.getElementById('st-tbody');
  if (tbody) {
    tbody.innerHTML = '';
    const filtered = stHistYear === 'all' ? (stHistory || []) : (stHistory || []).filter(r => {
      const d = r.from ? new Date(r.from.includes('T') || r.from.includes('/') ? r.from : r.from + 'T00:00:00') : null;
      return d && !isNaN(d) && d.getFullYear() === stHistYear;
    });
    if (!filtered.length) {
      if (nodataEl) nodataEl.style.display = 'block';
    } else {
      if (nodataEl) nodataEl.style.display = 'none';
      tbody.innerHTML = filtered.map((r, i) => {
        const typeD = LANG === 'kh' ? (r.typeKh || r.type) : r.type;
        const origIdx = (stHistory || []).indexOf(r);
        return `<tr><td style="font-size:10px;color:var(--txt3);font-family:monospace">${r.id || ''}</td><td style="font-weight:500">${typeD || ''}</td><td>${fmtDate(r.from)}</td><td>${fmtDate(r.to)}</td><td style="text-align:center;font-weight:600">${r.days || ''}</td><td><span class="badge b-${(r.status || '').toLowerCase()}">${r.status || ''}</span></td><td><button class="pbtn" onclick="stPrint(${origIdx})"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:inline-block;vertical-align:middle"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button></td></tr>`;
      }).join('');
    }
  }
  renderStNotices();
}
function renderStNotices(){
  const tbody=document.getElementById('st-notice-tbody');
  const nodata=document.getElementById('st-notice-nodata');
  if(!tbody||!nodata)return;
  tbody.innerHTML='';
  if(!stNotices.length){nodata.style.display='block';return;}
  nodata.style.display='none';
  tbody.innerHTML=stNotices.map(n=>{
    const isLate=n.type==='Late Arrival';
    const badge=isLate?'b-pending':'b-rejected';
    return`<tr><td><span class="badge ${badge}" style="font-size:11px">${n.type}</span></td><td style="white-space:nowrap">${fmtDate(n.date)||n.date||'—'}</td><td style="white-space:nowrap">${fmtTimeVal(n.time)}</td><td style="color:var(--txt2)">${n.reason||'—'}</td></tr>`;
  }).join('');
}
function stPrint(i){fillPrintRecord(stHistory[i],stStaff);}

// ══════════════════ HR ══════════════════════════
let hrUser=null,hrToken=null,allReqs=[],hrFilter_='All';
async function hrLogin(){
  const user=document.getElementById('hr-user').value.trim(),pass=document.getElementById('hr-pass').value;
  if(!user||!pass){document.getElementById('hr-lerr').textContent=tx('hrLerr');gateSetError('hr-login');return;}
  const btn=document.getElementById('hr-lbtn'),sp=document.getElementById('hr-lsp');
  gateSetLoading('hr-login','hr-lbtn',true);sp.style.display='block';
  const _gmo=_gmoStart('hr-login',['Verifying Credentials','Connecting to Cloud Server','Loading Dashboard Data'],[1200,1200,1600]);
  try{
    let res;
    if(isMock()){res=(user==='admin'&&pass==='Admin2026')||(user==='hrmanager'&&pass==='HRPass2026')?{result:'success',displayName:user}:{result:'fail'};}
    else{res=await apiPost('hrLogin',{username:user,password:pass,fp:getFingerprint()});}
    if(res.result==='success'){
      hrUser=res.displayName||user;
      hrToken=res.token||null;
      if(res.hmacKey)setHmacKey(res.hmacKey);
      sessionStorage.setItem('hr_sess',JSON.stringify({user:hrUser,token:hrToken,hmacKey:res.hmacKey||''}));
      
      // Update text in waiting overlay and fetch all dashboard data before revealing dashboard
      if(_gmo.updateText)_gmo.updateText('Loading Dashboard Data');
      await hrLoadData(true);

      document.getElementById('hr-greet').textContent=tx('hrGreet')+hrUser;
      document.getElementById('hr-gsub').textContent=tx('hrGsub')+' — '+todayFmt();
      document.getElementById('hr-login').style.display='none';
      document.getElementById('hr-dash').style.display='block';
      const bBtn=document.getElementById('hr-back-btn');if(bBtn)bBtn.style.display='none';
      const lBtn=document.getElementById('hr-logout-btn');if(lBtn)lBtn.style.display='inline-flex';
      _gmo.cancel(true);
    }
    else{_gmo.cancel(false);document.getElementById('hr-lerr').textContent=res.message||(res.result==='locked'?(res.error||tx('hrLerr')):tx('hrLerr'));setTimeout(()=>gateSetError('hr-login'),210);}
  }catch(e){_gmo.cancel(false);document.getElementById('hr-lerr').textContent='Connection error. Please try again.';console.error('hrLogin error:',e);}finally{gateSetLoading('hr-login','hr-lbtn',false);sp.style.display='none';}
}
function hrLogout(){
  hrUser=null;hrToken=null;_hmacKey=null;allReqs=[];cacheClear();
  sessionStorage.removeItem('hr_sess');
  document.getElementById('hr-dash').style.display='none';
  document.getElementById('hr-login').style.display='block';
  const bBtn=document.getElementById('hr-back-btn');if(bBtn)bBtn.style.display='inline-flex';
  const lBtn=document.getElementById('hr-logout-btn');if(lBtn)lBtn.style.display='none';
  document.getElementById('hr-user').value='';
  document.getElementById('hr-pass').value='';
  document.getElementById('hr-lerr').textContent='';
}
// ── DATA CACHE ────────────────────────────────────────────────────
const CACHE_TTL = 3600000; // 1 hour
function cacheSet(key, val){try{sessionStorage.setItem(key,JSON.stringify({v:val,t:Date.now()}));}catch(e){}}
function cacheGet(key){try{const r=JSON.parse(sessionStorage.getItem(key)||'null');if(r&&Date.now()-r.t<CACHE_TTL)return r.v;}catch(e){}return null;}
function cacheClear(){['hr_reqs','hr_staff','hr_notices','hr_noticestats'].forEach(k=>sessionStorage.removeItem(k));}

async function hrLoadData(silent){
  const ld=document.getElementById('hr-loading');
  if(!silent&&ld)ld.style.display='flex';
  try{
    if(isMock()){
      allReqs=[];allStaffList=[];noticesList=[];noticeStats=[];
      await new Promise(r=>setTimeout(r,400));
    } else {
      // Restore from cache first for instant render
      const cReqs=cacheGet('hr_reqs'),cStaff=cacheGet('hr_staff'),
            cNl=cacheGet('hr_notices'),cNs=cacheGet('hr_noticestats');
      if(cReqs){allReqs=cReqs;}
      if(cStaff){allStaffList=cStaff;}
      if(cNl){noticesList=cNl;}
      if(cNs){noticeStats=cNs;}
      if(cReqs&&cStaff){
        hrRenderSummary();hrRenderReqs();hrRenderStaff();
        if(ld)ld.style.display='none';
      }
      // Single authenticated call — avoids token rotation conflict
      const res=await apiPost('getAllData',{token:hrToken||''});
      if(res.result==='unauthorized'){
        if(!silent){toast('Session expired — please log in again','bad');hrLogout();}
        return;
      }
      if(res.result==='success'){
        allReqs=res.requests||[];
        allStaffList=res.staff||[];
        noticesList=res.notices||[];
        noticeStats=res.stats||[];
        if (res.holidays && Array.isArray(res.holidays) && res.holidays.length > 0) {
          saveHolidaysCache(res.holidays);
        }
        cacheSet('hr_reqs',allReqs);
        cacheSet('hr_staff',allStaffList);
        cacheSet('hr_notices',noticesList);
        cacheSet('hr_noticestats',noticeStats);
      }
    }
    hrRenderSummary();hrRenderReqs();hrRenderStaff();
    if(typeof hrRenderHolidays==='function')hrRenderHolidays();
    anApplyFilters();
  }catch(e){if(!silent)toast('Error loading data','bad');}
  finally{if(ld)ld.style.display='none';}
}

// Background preload — called right after session restore, silently
function hrPreload(){
  if(hrToken&&hrUser)hrLoadData(true);
}
function hrRenderSummary(){const tot=allReqs.length,pend=allReqs.filter(r=>r.status==='Pending').length,appr=allReqs.filter(r=>r.status==='Approved').length,rej=allReqs.filter(r=>r.status==='Rejected').length;document.getElementById('hr-st').textContent=tot;document.getElementById('hr-sp').textContent=pend;document.getElementById('hr-sa').textContent=appr;document.getElementById('hr-sr').textContent=rej;}
function hrFilter(f){hrFilter_=f;document.querySelectorAll('.ftab').forEach(t=>t.classList.remove('on'));const map={'All':'hft-all','Pending':'hft-pend','Approved':'hft-appr','Rejected':'hft-rej'};document.getElementById(map[f]).classList.add('on');hrRenderReqs();}
const _hrSaving=new Set();
const _hrDeleting=new Set();
function hrRenderReqs(){
  const filtered=hrFilter_==='All'?allReqs:allReqs.filter(r=>r.status===hrFilter_);
  const tbody=document.getElementById('hr-tbody');
  document.getElementById('hr-nodata').style.display=filtered.length?'none':'block';
  tbody.innerHTML=filtered.map(r=>{
    const saving=_hrSaving.has(r.id);
    const deleting=_hrDeleting.has(r.id);
    const busy=saving||deleting;
    const canActMain=r.status==='Pending'&&!busy;
    const spin=`<svg style="animation:spin .7s linear infinite" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`;
    const delBtn=!busy?`<button class="abtn abtn-del" onclick="hrDeleteRequest('${r.id}','${(r.empName||r.empId).replace(/'/g,"\\'")}','${r.from}')">Delete</button>`:'';
    const actionCell=deleting
      ?`<span style="font-size:11px;color:var(--red);display:flex;align-items:center;gap:5px">${spin}Deleting…</span>`
      :saving
        ?`<span style="font-size:11px;color:var(--txt3);display:flex;align-items:center;gap:5px">${spin}Saving…</span>`
        :canActMain
          ?`<button class="abtn abtn-ok" onclick="openStatusModal('${r.id}','Approved')">${tx('hrApprove')}</button><button class="abtn abtn-bad" onclick="openStatusModal('${r.id}','Rejected')">${tx('hrReject')}</button>${delBtn}`
          :delBtn||'<span style="font-size:11px;color:var(--txt3)">—</span>';
    return`<tr id="hr-row-${r.id}" style="transition:background .2s,opacity .2s${busy?';opacity:.55':''}"><td style="font-size:10px;color:var(--txt3);font-family:monospace">${r.id||'—'}</td><td><div style="font-weight:500">${r.empName||r.empId}</div><div style="font-size:11px;color:var(--txt3)">${r.empId}</div></td><td>${r.type}</td><td>${fmtDate(r.from)}</td><td style="text-align:center;font-weight:600">${r.days}</td><td><span class="badge b-${(r.status||'').toLowerCase()}">${r.status}</span></td><td><div style="display:flex;gap:5px;align-items:center;flex-wrap:wrap">${actionCell}</div></td></tr>`;
  }).join('');
  // ── Deep link: scroll to and highlight the linked request ────────
  if(_deepReq){
    const target=document.getElementById('hr-row-'+_deepReq);
    if(target){
      target.style.background='rgba(192,39,45,.10)';
      target.style.outline='2px solid rgba(192,39,45,.4)';
      target.style.borderRadius='6px';
      setTimeout(()=>target.scrollIntoView({behavior:'smooth',block:'center'}),200);
      setTimeout(()=>{target.style.background='';target.style.outline='';},4000);
      _deepReq=''; // clear after use
    }
  }
}
async function hrUpdateStatus(reqId,ns,silent){
  silent=!!silent;
  const i=allReqs.findIndex(r=>r.id===reqId);
  if(i<0)return;
  const prevStatus=allReqs[i].status;
  // ── Optimistic update ─────────────────────────────────────────────
  allReqs[i].status=ns;
  _hrSaving.add(reqId);
  hrRenderSummary();hrRenderReqs();
  toast(ns==='Approved'?'Approved ✓':'Rejected ✕','ok2');
  // ── Background save ───────────────────────────────────────────────
  try{
    if(!isMock()){
      const res=await apiPost('updateStatus',{requestId:reqId,status:ns,hrUser,silent,token:hrToken||''});
      if(!res||res.result!=='success'){
        // Revert on failure
        allReqs[i].status=prevStatus;
        toast(res&&res.error?res.error:'Save failed — reverted.','bad');
      }
    }
  }catch(e){
    allReqs[i].status=prevStatus;
    toast('Connection error — reverted.','bad');
  }finally{
    _hrSaving.delete(reqId);
    hrRenderSummary();hrRenderReqs();
  }
}
// ── DELETE REQUEST ────────────────────────────────────────────────
let _hrDelTarget=null,_hrDelReauth=null;
function hrDeleteRequest(reqId,name,date){
  _hrDelTarget={type:'request',reqId,name,date};
  document.getElementById('del-req-label').textContent=(name||reqId)+' · '+fmtDate(date);
  document.getElementById('hr-del-modal').style.display='flex';
  resetDelSlider();
}
function closeDelModal(){
  document.getElementById('hr-del-modal').style.display='none';
  _hrDelTarget=null;_hrDelReauth=null;
  resetDelSlider();
}
// ── APPROVE/REJECT CONFIRM MODAL ────────────────────────────────────────
let _hrStatusPending=null;
function openStatusModal(reqId,ns){
  _hrStatusPending={reqId,ns};
  const isApprove=ns==='Approved';
  document.getElementById('hr-sm-icon').textContent=isApprove?'✓':'✕';
  document.getElementById('hr-sm-icon').style.background=isApprove?'rgba(34,197,94,.15)':'rgba(192,39,45,.12)';
  document.getElementById('hr-sm-icon').style.color=isApprove?'#16a34a':'var(--red)';
  document.getElementById('hr-sm-title').textContent=isApprove?'Confirm Approval':'Confirm Rejection';
  const req=allReqs.find(r=>r.id===reqId);
  document.getElementById('hr-sm-sub').textContent=req?(req.empName||req.empId)+' · '+(req.type||'')+'':'';
  const btn=document.getElementById('hr-sm-confirm-btn');
  btn.textContent=isApprove?'Approve':'Reject';
  btn.style.background=isApprove?'#16a34a':'var(--red)';
  // reset silent toggle
  const chk=document.getElementById('hr-silent-chk');
  if(chk)chk.checked=false;
  hrSilentToggleUI();
  document.getElementById('hr-status-modal').style.display='flex';
}
function closeStatusModal(){
  document.getElementById('hr-status-modal').style.display='none';
  _hrStatusPending=null;
}
function hrSilentToggleUI(){
  const chk=document.getElementById('hr-silent-chk');
  const on=chk&&chk.checked;
  const toggle=document.getElementById('hr-sm-toggle');
  const knob=document.getElementById('hr-sm-knob');
  const label=document.getElementById('hr-sm-silent-label');
  if(toggle)toggle.style.background=on?'#f59e0b':'var(--border)';
  if(knob)knob.style.left=on?'21px':'3px';
  if(label){label.style.borderColor=on?'#f59e0b':'var(--border)';label.style.background=on?'rgba(245,158,11,.08)':'var(--bg2)';}
}
function confirmHrStatus(){
  if(!_hrStatusPending)return;
  const {reqId,ns}=_hrStatusPending;
  const silent=document.getElementById('hr-silent-chk')?.checked||false;
  closeStatusModal();
  hrUpdateStatus(reqId,ns,silent);
}
function hrDeleteNotice(empId,name,noticeType,date,time){
  _hrDelTarget={type:'notice',empId,name,noticeType,date,time};
  document.getElementById('del-req-label').textContent=(name||empId)+' · '+noticeType+' · '+date;
  document.getElementById('hr-del-modal').style.display='flex';
  resetDelSlider();
}
// ── FE time helpers for local notice stats recalc after delete ────
const _WS_FE=8*60+30,_WE_FE=17*60+30;
function _parseTmFE(t){
  if(!t)return null;
  // HH:MM anywhere in the string (handles "17:00", "17:00:00", and GAS Date strings)
  const m=String(t).match(/(\d{1,2}):(\d{2})/);
  if(m)return parseInt(m[1])*60+parseInt(m[2]);
  // fallback: parse as Date object
  const d=new Date(t);
  return isNaN(d.getTime())?null:d.getHours()*60+d.getMinutes();
}
function _calcLateMinsFE(t){const m=_parseTmFE(t);return m?Math.max(0,m-_WS_FE):0;}
function _calcEarlyMinsFE(t){const m=_parseTmFE(t);return m?Math.max(0,_WE_FE-m):0;}
// Slide-to-confirm logic
let _delSliding=false,_delStartX=0,_delCurX=0;
function delSliderStart(e){
  _delSliding=true;
  _delStartX=e.touches?e.touches[0].clientX:e.clientX;
  document.addEventListener('mousemove',delSliderMove);
  document.addEventListener('mouseup',delSliderEnd);
  document.addEventListener('touchmove',delSliderMove,{passive:true});
  document.addEventListener('touchend',delSliderEnd);
}
function delSliderMove(e){
  if(!_delSliding)return;
  const track=document.getElementById('del-slider-track');
  const thumb=document.getElementById('del-slider-thumb');
  const fill=document.getElementById('del-slider-fill');
  const hint=document.getElementById('del-slider-hint');
  if(!track||!thumb)return;
  const trackW=track.offsetWidth;
  const thumbW=thumb.offsetWidth;
  const maxX=trackW-thumbW-8;
  const cx=e.touches?e.touches[0].clientX:e.clientX;
  const dx=Math.max(0,Math.min(maxX,cx-_delStartX));
  thumb.style.left=(4+dx)+'px';
  const pct=dx/maxX;
  fill.style.width=(dx+thumbW/2)+'px';
  fill.style.background=`rgba(192,39,45,${0.15+pct*0.7})`;
  if(hint)hint.style.opacity=1-pct;
  if(pct>=0.92)delSliderConfirm();
}
function delSliderEnd(){
  _delSliding=false;
  document.removeEventListener('mousemove',delSliderMove);
  document.removeEventListener('mouseup',delSliderEnd);
  document.removeEventListener('touchmove',delSliderMove);
  document.removeEventListener('touchend',delSliderEnd);
  // Snap back if not confirmed
  resetDelSlider();
}
function resetDelSlider(){
  const thumb=document.getElementById('del-slider-thumb');
  const fill=document.getElementById('del-slider-fill');
  const hint=document.getElementById('del-slider-hint');
  if(thumb)thumb.style.left='4px';
  if(fill){fill.style.width='0';fill.style.background='';}
  if(hint)hint.style.opacity='1';
  _delSliding=false;
}
async function delSliderConfirm(){
  _delSliding=false;
  document.removeEventListener('mousemove',delSliderMove);
  document.removeEventListener('mouseup',delSliderEnd);
  document.removeEventListener('touchmove',delSliderMove);
  document.removeEventListener('touchend',delSliderEnd);
  if(!_hrDelTarget)return;
  const target=_hrDelTarget;
  closeDelModal();
  // ── Notice delete branch ─────────────────────────────────────────
  if(target.type==='notice'){
    const idx=noticesList.findIndex(n=>n.empId===target.empId&&n.type===target.noticeType&&n.date===target.date&&n.time===target.time);
    if(idx>=0)noticesList.splice(idx,1);
    const sm={};
    noticesList.forEach(n=>{
      if(!sm[n.empId])sm[n.empId]={name:n.name,late:0,early:0,lateMinutes:0,earlyMinutes:0};
      if(n.type==='Late Arrival'){sm[n.empId].late++;sm[n.empId].lateMinutes+=_calcLateMinsFE(n.time);}
      else{sm[n.empId].early++;sm[n.empId].earlyMinutes+=_calcEarlyMinsFE(n.time);}
    });
    noticeStats=Object.entries(sm).map(([id,v])=>({empId:id,name:v.name,late:v.late,early:v.early,total:v.late+v.early,lateMinutes:v.lateMinutes,earlyMinutes:v.earlyMinutes,totalMinutes:v.lateMinutes+v.earlyMinutes})).sort((a,b)=>b.total-a.total);
    hrRenderAnalytics();
    toast('Notice deleted','ok2');
    try{
      if(!isMock()){
        const res=await apiPost('deleteNotice',{empId:target.empId,noticeType:target.noticeType,date:target.date,time:target.time,token:hrToken||''});
        if(!res||res.result!=='success')toast(res&&res.error?res.error:'Delete failed on server','bad');
      }
    }catch(e){toast('Connection error','bad');}
    return;
  }
  // ── Leave request delete ─────────────────────────────────────────
  const{reqId}=target;
  const i=allReqs.findIndex(r=>r.id===reqId);
  if(i<0)return;
  const removed=allReqs.splice(i,1)[0];
  _hrDeleting.add(reqId);
  hrRenderSummary();hrRenderReqs();
  toast('Request deleted','ok2');
  try{
    if(!isMock()){
      const res=await apiPost('deleteRequest',{requestId:reqId,token:hrToken||''});
      if(!res||res.result!=='success'){
        allReqs.splice(i,0,removed);
        toast(res&&res.error?res.error:'Delete failed — restored.','bad');
      }
    }
  }catch(e){
    allReqs.splice(i,0,removed);
    toast('Connection error — restored.','bad');
  }finally{
    _hrDeleting.delete(reqId);
    hrRenderSummary();hrRenderReqs();
  }
}

function hrRenderAnalytics(){
  const reqs=anFilterReqs();
  const noData=!allReqs.length&&!noticeStats.length;
  // ── Summary stats ────────────────────────────────────────────
  const totalDays=reqs.reduce((s,r)=>s+(Number(r.days)||0),0);
  const uniqueStaff=[...new Set(reqs.map(r=>r.empId))].length;
  const lateCount=noticesList.filter(n=>n.type==='Late Arrival').length;
  const earlyCount=noticesList.filter(n=>n.type==='Leave Early').length;
  document.getElementById('an-statrow').innerHTML=noData
    ?'<div style="padding:20px;color:var(--txt3)">No data yet.</div>'
    :`<div class="smbox"><div class="smnum">${totalDays}</div><div class="smlbl">Days Requested</div></div>`+
     `<div class="smbox sa"><div class="smnum">${uniqueStaff}</div><div class="smlbl">Staff</div></div>`+
     `<div class="smbox sp"><div class="smnum">${lateCount}</div><div class="smlbl">Late Arrivals</div></div>`+
     `<div class="smbox sr"><div class="smnum">${earlyCount}</div><div class="smlbl">Early Departures</div></div>`;

  // ── Leave by type ────────────────────────────────────────────
  const byType={};
  reqs.forEach(r=>{byType[r.type]=(byType[r.type]||0)+(Number(r.days)||0);});
  const typeEntries=Object.entries(byType).sort((a,b)=>b[1]-a[1]);
  const maxType=typeEntries.length?typeEntries[0][1]:1;
  document.getElementById('an-bytype').innerHTML=typeEntries.length?typeEntries.map(([t,d])=>
    `<div style="margin-bottom:8px"><div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:3px"><span>${t}</span><span style="font-weight:600">${d}d</span></div>`+
    `<div style="height:6px;background:var(--border);border-radius:3px"><div style="height:6px;background:var(--red);border-radius:3px;width:${Math.round(d/maxType*100)}%"></div></div></div>`
  ).join(''):'<div style="color:var(--txt3);font-size:13px">No requests for this period.</div>';

  // ── Leave by month ───────────────────────────────────────────
  const byMonth={};
  reqs.forEach(r=>{
    if(r.from){
      const d=new Date(r.from);if(isNaN(d))return;
      const k=d.getFullYear()+'-'+(String(d.getMonth()+1).padStart(2,'0'));
      byMonth[k]=(byMonth[k]||0)+(Number(r.days)||0);
    }
  });
  const monthEntries=Object.entries(byMonth).sort((a,b)=>a[0]<b[0]?-1:1).slice(-12);
  const maxMonth=monthEntries.length?Math.max(...monthEntries.map(e=>e[1])):1;
  const _mNames=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  document.getElementById('an-bymonth').innerHTML=monthEntries.length?
    `<div style="display:flex;align-items:flex-end;gap:4px;height:80px">`+
    monthEntries.map(([m,d])=>{
      const mName=_mNames[parseInt(m.slice(5))-1]||m.slice(5);
      return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:2px" title="${d} days total leave in ${mName}">`+
        `<div style="font-size:9px;color:var(--txt3)">${d}d</div>`+
        `<div style="width:100%;background:var(--red);border-radius:2px 2px 0 0;height:${Math.round(d/maxMonth*60)}px"></div>`+
        `<div style="font-size:8px;color:var(--txt3);writing-mode:vertical-rl;transform:rotate(180deg)">${mName}</div>`+
      `</div>`;
    }).join('')+`</div>`
  :'<div style="color:var(--txt3);font-size:13px">No data for this period.</div>';

  // ── Staff leave table ────────────────────────────────────────
  const staffMap={};
  allStaffList.forEach(s=>{staffMap[normalizeId(s.empId)]={name:s.name,position:s.position,annual:s.annualDays,used:s.usedDays,requests:0};});
  reqs.forEach(r=>{const k=normalizeId(r.empId);if(staffMap[k])staffMap[k].requests++;});
  let staffRows=Object.entries(staffMap).sort((a,b)=>anStaffSort==='name'?a[1].name.localeCompare(b[1].name):b[1].used-a[1].used);
  if(anFilter.staff)staffRows=staffRows.filter(([,s])=>s.name===anFilter.staff);
  document.getElementById('an-staffbody').innerHTML=staffRows.map(([id,s])=>{
    const rem=(s.annual||0)-(s.used||0);
    return `<tr><td style="font-weight:500">${s.name}</td><td style="color:var(--txt2)">${s.position}</td>`+
      `<td style="text-align:center">${s.annual}</td><td style="text-align:center;color:var(--warn)">${s.used}</td>`+
      `<td style="text-align:center;color:${rem>5?'var(--ok)':rem>0?'var(--warn)':'var(--red)'};font-weight:600">${rem}</td>`+
      `<td style="text-align:center">${s.requests}</td></tr>`;
  }).join('');

  // ── Notice stats table ───────────────────────────────────────
  const tbody=document.getElementById('an-noticebody');
  const empty=document.getElementById('an-noticeempty');
  if(!noticeStats.length){tbody.innerHTML='';empty.style.display='block';}
  else{empty.style.display='none';
  tbody.innerHTML=noticeStats.map(s=>{
    const totalMins=s.totalMinutes||0;
    const rawDays=totalMins/WORK_DAY_MINS;
    const rounded=Math.round(rawDays*10)/10;
    const daysText=rounded===0?'—':rounded===1?'1 day':rounded+' days';
    const daysColor=rounded>=1?'var(--red)':rounded>0?'var(--warn)':'var(--txt3)';
    const convertCell=`<td style="text-align:center"><span style="font-weight:600;font-size:13px;color:${daysColor}">${daysText}</span></td>`;
    const extraCol=(_timedMode?`<td style="text-align:center;color:var(--txt2);font-size:11px">${_fmtMins(totalMins)}</td>`:'')+convertCell;
    return`<tr><td style="font-weight:500">${s.name}</td>`+
    `<td style="text-align:center;color:var(--warn)">${s.late}</td>`+
    `<td style="text-align:center;color:var(--red)">${s.early}</td>`+
    `<td style="text-align:center;font-weight:600">${s.total}</td>`+
    extraCol+`</tr>`;
  }).join('');}
  // ── Individual notice records with delete ────────────────────────
  const rBody=document.getElementById('an-notice-records-body');
  const rEmpty=document.getElementById('an-notice-records-empty');
  if(rBody){
    if(!noticesList.length){rBody.innerHTML='';if(rEmpty)rEmpty.style.display='block';}
    else{
      if(rEmpty)rEmpty.style.display='none';
      rBody.innerHTML=noticesList.map(n=>{
        const isLate=n.type==='Late Arrival';
        const sd=String(n.date||'').replace(/'/g,"\\'");
        const st=String(n.time||'').replace(/'/g,"\\'");
        const se=String(n.empId||'').replace(/'/g,"\\'");
        const sn=String(n.name||'').replace(/'/g,"\\'");
        const sy=String(n.type||'').replace(/'/g,"\\'");
        return`<tr><td style="font-weight:500">${n.name||n.empId}</td>`+
          `<td><span class="badge ${isLate?'b-pending':'b-rejected'}" style="font-size:10px">${n.type}</span></td>`+
          `<td>${fmtDate(n.date)||n.date||'—'}</td><td>${fmtTimeVal(n.time)}</td>`+
          `<td style="font-size:12px;color:var(--txt2)">${n.reason||'—'}</td>`+
          `<td style="text-align:center"><button class="abtn abtn-del" style="font-size:11px;padding:4px 10px" onclick="hrDeleteNotice('${se}','${sn}','${sy}','${sd}','${st}')">Delete</button></td></tr>`;
      }).join('');
    }
  }
}

let _lateThreshold=2;
let _timedMode=false; // OFF by default — turn ON in Analytics tab
const WORK_DAY_MINS=480; // 8h work day (08:30–17:30 minus 1h lunch)

function _fmtMins(m){const h=Math.floor(m/60),mn=m%60;return h?`${h}h ${mn}m`:`${mn}m`;}

async function loadLateThreshold(){
  const el=document.getElementById('an-late-threshold');
  try{
    const [tRes,mRes]=await Promise.all([apiHR('getLateThreshold',{}),apiHR('getTimedMode',{})]);
    if(tRes&&tRes.threshold){_lateThreshold=tRes.threshold;if(el)el.value=tRes.threshold;}
    if(mRes){_timedMode=!!mRes.enabled;_applyTimedModeUI();}
  }catch(e){}
}
function _applyTimedModeUI(){
  const tog=document.getElementById('an-timed-toggle');
  const timeTh=document.getElementById('an-th-time');
  if(tog){tog.textContent=_timedMode?'ON':'OFF';tog.style.background=_timedMode?'var(--ok)':'var(--txt3)';}
  if(timeTh)timeTh.style.display=_timedMode?'':'none';
  hrRenderAnalytics();
}
async function toggleTimedMode(){
  _timedMode=!_timedMode;
  try{await apiHR('setTimedMode',{enabled:_timedMode});}catch(e){}
  _applyTimedModeUI();
  toast(_timedMode?'Time-based mode ON':'Count-based mode ON','ok2');
}
async function saveLateThreshold(){
  const el=document.getElementById('an-late-threshold');if(!el)return;
  const n=parseInt(el.value,10);if(isNaN(n)||n<1){toast('Enter a valid number','bad');return;}
  try{
    await apiHR('setLateThreshold',{threshold:n});
    _lateThreshold=n;toast('Threshold saved','ok2');hrRenderAnalytics();
  }catch(e){toast('Failed to save','bad');}
}
async function convertLatePage(empId,empName,stat){
  const staffInfo=allStaffList.find(s=>String(s.empId)===String(empId))||{};
  var days,confirmMsg;
  if(_timedMode){
    const totalMins=stat.totalMinutes||0;
    days=Math.floor(totalMins/WORK_DAY_MINS);
    confirmMsg=`Convert accumulated time for ${empName}?\n\nLate: ${_fmtMins(stat.lateMinutes||0)}\nEarly: ${_fmtMins(stat.earlyMinutes||0)}\nTotal: ${_fmtMins(totalMins)} → ${days} day(s) deducted`;
  }else{
    const lateCount=stat.late||0;
    days=Math.floor(lateCount/_lateThreshold);
    confirmMsg=`Convert ${lateCount} late arrivals → ${days} day(s) deducted from ${empName}?`;
  }
  if(days<=0){toast('Not enough accumulated time/count yet','bad');return;}
  if(!confirm(confirmMsg))return;
  try{
    const res=await apiHR('convertLateToLeave',{
      empId,empName,
      lateCount:stat.late||0,
      totalMinutes:stat.totalMinutes||0,
      lateMinutes:stat.lateMinutes||0,
      earlyMinutes:stat.earlyMinutes||0,
      gender:staffInfo.gender||'',position:staffInfo.position||'',location:staffInfo.location||'Phnom Penh'
    });
    if(res&&res.result==='success'){toast(`${days} day(s) deducted — Req ${res.requestId}`,'ok2');hrLoadData();}
    else{toast(res&&res.error||'Convert failed','bad');}
  }catch(e){toast('Error: '+e,'bad');}
}

let allStaffList=[];
let noticeStats=[],noticesList=[];
// ── ANALYTICS FILTER STATE ─────────────────────────────────────
let anFilter={period:'year',year:new Date().getFullYear(),month:'',staff:''};
let anStaffSort='used'; // 'used' = most leave on top, 'name' = alphabetical
function anSaveFilters(){cacheSet('hr_anfilter',anFilter);}
function anRestoreFilters(){const f=cacheGet('hr_anfilter');if(f)anFilter={...anFilter,...f};}
function anApplyFilters(){
  if(!document.getElementById('hr-tab-analytics'))return;
  anRestoreFilters();
  // Update UI to match state
  const pSel=document.getElementById('an-period');
  const ySel=document.getElementById('an-year');
  const mSel=document.getElementById('an-month');
  const sSel=document.getElementById('an-staff');
  if(pSel)pSel.value=anFilter.period;
  // Populate year dropdown
  if(ySel){
    const years=[...new Set(allReqs.map(r=>{const d=new Date(r.from);return isNaN(d)?null:d.getFullYear();}).filter(Boolean))].sort((a,b)=>b-a);
    const curY=new Date().getFullYear();
    if(!years.includes(curY))years.unshift(curY);
    ySel.innerHTML=years.map(y=>`<option value="${y}">${y}</option>`).join('');
    if(anFilter.year)ySel.value=anFilter.year;
  }
  // Populate month
  if(mSel&&anFilter.month)mSel.value=anFilter.month;
  // Populate staff
  if(sSel){
    const names=[...new Set(allReqs.map(r=>r.empName||r.empId).filter(Boolean))].sort();
    sSel.innerHTML='<option value="">All Staff</option>'+names.map(n=>`<option value="${n}">${n}</option>`).join('');
    if(anFilter.staff)sSel.value=anFilter.staff;
  }
  anShowHideControls();
  hrRenderAnalytics();
}
function anShowHideControls(){
  const p=anFilter.period;
  const yRow=document.getElementById('an-year-row');
  const mRow=document.getElementById('an-month-row');
  if(yRow)yRow.style.display=(p==='year'||p==='month')?'flex':'none';
  if(mRow)mRow.style.display=(p==='month')?'flex':'none';
}
function anChangePeriod(v){anFilter.period=v;anFilter.month='';anSaveFilters();anShowHideControls();hrRenderAnalytics();}
function anChangeYear(v){anFilter.year=parseInt(v);anSaveFilters();hrRenderAnalytics();}
function anChangeMonth(v){anFilter.month=v;anSaveFilters();hrRenderAnalytics();}
function anChangeStaff(v){anFilter.staff=v;anSaveFilters();hrRenderAnalytics();}
function anFilterReqs(){
  let reqs=allReqs;
  const p=anFilter.period;
  if(p==='year'||p==='month'){
    reqs=reqs.filter(r=>{
      if(!r.from)return false;
      const d=new Date(r.from);
      if(isNaN(d))return false;
      if(d.getFullYear()!==parseInt(anFilter.year))return false;
      if(p==='month'&&anFilter.month&&(d.getMonth()+1)!==parseInt(anFilter.month))return false;
      return true;
    });
  }
  if(anFilter.staff)reqs=reqs.filter(r=>(r.empName||r.empId)===anFilter.staff);
  return reqs;
}
async function hrLoadNotices(){
  // Data already loaded by hrLoadData — just render
  hrRenderAnalytics();
}
function hrRenderStaff(){
  const tbody=document.getElementById('hr-stbody');
  if(!tbody)return;
  if(!allStaffList.length){
    tbody.innerHTML='<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--txt3)">No staff data found.</td></tr>';
    return;
  }
  tbody.innerHTML=allStaffList.map(s=>{
    const rem=(s.annualDays||0)-(s.usedDays||0);
    return`<tr><td style="font-size:10px;color:var(--txt3);font-family:monospace">${s.empId}</td><td style="font-weight:500">${s.name}</td><td style="color:var(--txt2)">${s.position}</td><td style="text-align:center">${s.annualDays}</td><td style="text-align:center;color:var(--warn)">${s.usedDays}</td><td style="text-align:center;color:${rem>5?'var(--ok)':rem>0?'var(--warn)':'var(--red)'};font-weight:600">${rem}</td></tr>`;
  }).join('');
}
function hrTab(tab){sessionStorage.setItem('hr_tab',tab);
  ['req','staff','attendance','holidays','analytics','export','manual'].forEach(t=>{
    const el=document.getElementById('hr-tab-'+t);if(el)el.style.display=tab===t?'block':'none';
    const btn=document.getElementById('nt-'+t);if(btn)btn.classList.toggle('on',tab===t);
  });
  if(tab==='export')expInit();
  if(tab==='analytics'){hrLoadNotices();anApplyFilters();loadLateThreshold();}
  if(tab==='staff')hrRenderStaff();
  if(tab==='holidays')hrRenderHolidays();
  if(tab==='manual')hrManualInit();
}
// ══════════════════ EXPORT ══════════════════════
function expInit(){
  // Populate year dropdown from allReqs
  const years=[...new Set(allReqs.map(r=>{
    const d=r.from||r.dateFrom||'';
    return d?new Date(d).getFullYear():null;
  }).filter(Boolean))].sort((a,b)=>b-a);
  const yrSel=document.getElementById('exp-year');
  const curYr=yrSel.value;
  yrSel.innerHTML='<option value="">All Years</option>'+years.map(y=>`<option value="${y}"${y==curYr?'selected':''}>${y}</option>`).join('');
  // Populate staff dropdown
  const staffMap={};
  allReqs.forEach(r=>{if(r.empId)staffMap[r.empId]=r.empName||r.empId;});
  const stSel=document.getElementById('exp-staff');
  const curSt=stSel.value;
  stSel.innerHTML='<option value="">All Staff</option>'+Object.entries(staffMap).map(([id,name])=>`<option value="${id}"${id===curSt?'selected':''}>${name} (${id})</option>`).join('');
  expPreview();
}

function expFiltered(){
  const yr=document.getElementById('exp-year').value;
  const mo=document.getElementById('exp-month').value;
  const st=document.getElementById('exp-staff').value;
  return allReqs.filter(r=>{
    const d=new Date(r.from||r.dateFrom||'');
    if(yr&&d.getFullYear()!=yr)return false;
    if(mo&&(d.getMonth()+1)!=mo)return false;
    if(st&&r.empId!==st)return false;
    return true;
  });
}

function expPreview(){
  const data=expFiltered();
  const tbody=document.getElementById('exp-tbody');
  const nodata=document.getElementById('exp-nodata');
  tbody.innerHTML='';
  nodata.style.display=data.length?'none':'block';
  data.forEach(r=>{
    const tr=document.createElement('tr');
    tr.innerHTML=`<td style="font-size:10px;color:var(--txt3);font-family:monospace">${r.id||'—'}</td>
      <td style="font-weight:500">${r.empName||r.empId||'—'}</td>
      <td style="color:var(--txt2)">${r.position||'—'}</td>
      <td>${r.type||r.leaveType||'—'}</td>
      <td>${fmtDate(r.from||r.dateFrom)}</td>
      <td>${fmtDate(r.to||r.dateTo)}</td>
      <td style="text-align:center;font-weight:600">${r.days||r.workingDays||'—'}</td>
      <td style="color:var(--txt2);max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.reason||'—'}</td>
      <td><span class="badge b-${(r.status||'').toLowerCase()}">${r.status||'—'}</span></td>
      <td style="color:var(--txt3)">${r.submitted||r.submissionDate||'—'}</td>`;
    tbody.appendChild(tr);
  });
  const total=data.reduce((s,r)=>s+(Number(r.days||r.workingDays)||0),0);
  document.getElementById('exp-summary').textContent=
    data.length+' record'+(data.length===1?'':'s')+' · '+total+' day'+(total===1?'':'s')+' total';
}

function expNoticesFiltered(){
  const yr=document.getElementById('exp-year').value;
  const st=document.getElementById('exp-staff').value;
  return noticesList.filter(n=>{
    if(yr){const d=new Date(n.date);if(isNaN(d)||d.getFullYear()!=yr)return false;}
    if(st&&n.empId!==st)return false;
    return true;
  });
}
function expDownload(){
  const leaveData=expFiltered();
  const noticeData=expNoticesFiltered();
  if(!leaveData.length&&!noticeData.length){toast('No data to export','bad');return;}
  const yr=document.getElementById('exp-year').value||'All';
  const mo=document.getElementById('exp-month').value;
  const moName=mo?['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][mo-1]:'All';
  const st=document.getElementById('exp-staff').value||'All';
  const wb=XLSX.utils.book_new();
  // Sheet 1 — Leave Requests
  const leaveHeaders=['Req ID','Employee ID','Full Name','Position','Leave Type','From','To','Working Days','Reason','Status','Submitted','Location'];
  const leaveRows=leaveData.map(r=>[
    r.id||'',r.empId||'',r.empName||'',r.position||'',
    r.type||r.leaveType||'',
    fmtDate(r.from||r.dateFrom),fmtDate(r.to||r.dateTo),
    r.days||r.workingDays||'',r.reason||'',r.status||'',
    r.submitted||r.submissionDate||'',r.submittedFrom||'Phnom Penh'
  ]);
  const ws1=XLSX.utils.aoa_to_sheet([leaveHeaders,...leaveRows]);
  XLSX.utils.book_append_sheet(wb,ws1,'Leave Requests');
  // Sheet 2 — Late & Early Notices
  const noticeHeaders=['Employee ID','Full Name','Type','Date','Time','Return Time','Reason'];
  const noticeRows=noticeData.map(n=>[
    n.empId||'',n.name||'',n.type||'',n.date||'',n.time||'',n.returnTime||'',n.reason||''
  ]);
  const ws2=XLSX.utils.aoa_to_sheet([noticeHeaders,...noticeRows]);
  XLSX.utils.book_append_sheet(wb,ws2,'Late & Early Notices');
  XLSX.writeFile(wb,`LocktonIBS_Leave_${yr}_${moName}_${st}.xlsx`,{bookType:'xlsx',compression:true});
  toast('XLSX downloaded','ok2');
}

// ══════════════════ RE-AUTH ══════════════════════════════════
let _reauthResolve=null;
function requireReauth(msg){
  return new Promise(resolve=>{
    _reauthResolve=resolve;
    document.getElementById('reauth-msg').textContent=msg||'Re-enter your password to continue.';
    document.getElementById('reauth-pass').value='';
    document.getElementById('reauth-err').textContent='';
    const m=document.getElementById('reauth-modal');
    m.style.display='flex';
    setTimeout(()=>document.getElementById('reauth-pass').focus(),50);
  });
}
function cancelReauth(){
  document.getElementById('reauth-modal').style.display='none';
  if(_reauthResolve){_reauthResolve(null);_reauthResolve=null;}
}
function submitReauth(){
  const pass=document.getElementById('reauth-pass').value.trim();
  if(!pass){document.getElementById('reauth-err').textContent='Please enter your password.';return;}
  document.getElementById('reauth-modal').style.display='none';
  if(_reauthResolve){_reauthResolve(pass);_reauthResolve=null;}
}

// ══════════════════ SYNC / REFRESH ══════════════════════════════
function toggleAnStaffSort(){
  anStaffSort=anStaffSort==='used'?'name':'used';
  const btn=document.getElementById('an-sort-btn');
  if(btn)btn.textContent=anStaffSort==='used'?'Sort: Most Leave ↓':'Sort: Name A–Z ↑';
  hrRenderSummary();
}
async function syncNow(){
  const btn=document.getElementById('sync-btn');
  if(btn)btn.classList.add('spinning');
  toast('Syncing...','');
  try{
    _appInitData=null;
    await loadStaffCache();
    await loadHomeLeaveBoard();
    if(hrUser){hrLoadData();}
    if(stStaff){stRefreshAll();}
    toast('Up to date','ok2');
  }catch(e){
    toast('Sync error','bad');
  }finally{
    if(btn)btn.classList.remove('spinning');
  }
}
async function stRefreshHistory(){
  try{
    const res=isMock()?mockHist(stStaff.empId):await apiPost('getHistory',{empId:stStaff.empId,fullName:stStaff.name});
    if(res.result==='success'){stHistory=res.history||[];renderStDash();}
  }catch(e){}
}

// ══════════════════ LATE / EARLY NOTICE ════════════════════════
document.querySelectorAll('input[name=noticetype]').forEach(r=>{
  r.addEventListener('click',()=>{
    const lbl=document.getElementById('nt-time-lbl');
    if(lbl)lbl.textContent=r.value==='late'?'Arrival Time':'Departure Time';
  });
});

async function submitNotice(){
  const name=document.getElementById('nt-name').value.trim();
  const empid=document.getElementById('nt-empid').value.trim();
  const time=ntGetTime('nt-time');
  const returnTime=ntGetTime('nt-return');
  const reason=document.getElementById('nt-reason').value.trim();
  const type=document.querySelector('input[name=noticetype]:checked').value;
  const fb=document.getElementById('nt-fb');
  const missing=[];
  if(!name)missing.push('Full Name');
  if(!empid)missing.push('Employee ID');
  if(!time)missing.push(type==='late'?'Arrival Time':'Departure Time');
  if(!reason)missing.push('Reason');
  if(missing.length){fb.textContent='Please fill in: '+missing.join(', ');fb.className='idfb err';return;}
  fb.textContent='';
  const btn=document.getElementById('nt-btn'),sp=document.getElementById('nt-sp');
  btn.disabled=true;sp.style.display='block';
  try{
    const payload={
      noticeType:type,name,empId:empid,time,returnTime:returnTime||'—',reason,
      noticeDate:new Date().toLocaleDateString('en-GB')
    };
    const res=await apiPost('sendNotice',payload);
    if(res.result==='success'||isMock()){
      toast('Notice sent!','ok2');
      document.getElementById('nt-name').value='';
      document.getElementById('nt-empid').value='';
      ['nt-time-hh','nt-time-mm','nt-return-hh','nt-return-mm'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='';});
      ['nt-time-am','nt-return-am'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.add('on');});
      ['nt-time-pm','nt-return-pm'].forEach(id=>{const e=document.getElementById(id);if(e)e.classList.remove('on');});
      document.getElementById('nt-reason').value='';
      setTimeout(()=>goTo('home'),1200);
    } else {
      fb.textContent='Failed to send. Please try again.';fb.className='idfb err';
    }
  }catch(e){fb.textContent='Error sending notice.';fb.className='idfb err';}
  finally{btn.disabled=false;sp.style.display='none';}
}

// ══════════════════ NOTICE (LATE/EARLY) ══════════════════════
let ntStaff=null;
let _ntCurrentType=null; // 'late' | 'early'

// ── iOS Drum Picker ───────────────────────────────────────────
const DRUM_IH=42; // item height px
const DRUM_PAD=DRUM_IH*2; // 2-item padding spacer at top/bottom

function _ntBuildDrumCol(col,items){
  const pad=`<div style="height:${DRUM_PAD}px"></div>`;
  col.innerHTML=pad+items.map((it,i)=>`<div class="drum-item" data-v="${it.v}" data-i="${i}">${it.label}</div>`).join('')+pad;
  col.addEventListener('scroll',()=>_ntDrumHighlight(col),{passive:true});
  _ntDrumHighlight(col);
}
function _ntDrumHighlight(col){
  const idx=Math.round(col.scrollTop/DRUM_IH);
  col.querySelectorAll('.drum-item').forEach((el,i)=>el.classList.toggle('drum-sel',i===idx));
  // Sync manual inputs on HH/MM columns
  if(col.id==='drum-hh'||col.id==='drum-mm'||col.id==='drum-ap'){
    const v=_ntDrumGet(col);
    if(col.id==='drum-hh'){const e=document.getElementById('nt-m-hh');if(e)e.value=v;}
    if(col.id==='drum-mm'){const e=document.getElementById('nt-m-mm');if(e)e.value=v;}
    if(col.id==='drum-ap'){
      document.getElementById('nt-m-am')?.classList.toggle('on',v==='AM');
      document.getElementById('nt-m-pm')?.classList.toggle('on',v==='PM');
    }
  }
}
function _ntDrumGet(col){
  const idx=Math.round(col.scrollTop/DRUM_IH);
  return col.querySelectorAll('.drum-item')[idx]?.dataset.v||'';
}
function _ntDrumSet(col,val){
  const items=col.querySelectorAll('.drum-item');
  const idx=Array.from(items).findIndex(x=>x.dataset.v===val);
  if(idx>=0){col.scrollTop=idx*DRUM_IH;}
}
function ntInitDrum(){
  const hhCol=document.getElementById('drum-hh');
  const mmCol=document.getElementById('drum-mm');
  const apCol=document.getElementById('drum-ap');
  _ntBuildDrumCol(hhCol,Array.from({length:12},(_,i)=>{const v=String(i+1).padStart(2,'0');return{v,label:v};}));
  _ntBuildDrumCol(mmCol,Array.from({length:60},(_,i)=>{const v=String(i).padStart(2,'0');return{v,label:v};}));
  _ntBuildDrumCol(apCol,[{v:'AM',label:'AM'},{v:'PM',label:'PM'}]);
  // Auto-set to current time with auto AM/PM
  const now=new Date();
  const h=now.getHours(),m=now.getMinutes();
  const isAM=h<12;
  const dispH=h%12||12;
  setTimeout(()=>{
    _ntDrumSet(hhCol,String(dispH).padStart(2,'0'));
    _ntDrumSet(mmCol,String(m).padStart(2,'0'));
    _ntDrumSet(apCol,isAM?'AM':'PM');
    _ntDrumHighlight(hhCol);_ntDrumHighlight(mmCol);_ntDrumHighlight(apCol);
    // Sync manual fields
    const mhh=document.getElementById('nt-m-hh');
    const mmm=document.getElementById('nt-m-mm');
    if(mhh)mhh.value=String(dispH).padStart(2,'0');
    if(mmm)mmm.value=String(m).padStart(2,'0');
    document.getElementById('nt-m-am')?.classList.toggle('on',isAM);
    document.getElementById('nt-m-pm')?.classList.toggle('on',!isAM);
  },50);
}
function ntGetDrumTime(){
  const hhCol=document.getElementById('drum-hh');
  const mmCol=document.getElementById('drum-mm');
  const apCol=document.getElementById('drum-ap');
  const hh=_ntDrumGet(hhCol)||document.getElementById('nt-m-hh')?.value.trim()||'';
  const mm=_ntDrumGet(mmCol)||document.getElementById('nt-m-mm')?.value.trim()||'';
  const ap=_ntDrumGet(apCol)||(document.getElementById('nt-m-am')?.classList.contains('on')?'AM':'PM');
  if(!hh||!mm)return '';
  return String(parseInt(hh,10)).padStart(2,'0')+':'+String(parseInt(mm,10)).padStart(2,'0')+' '+ap;
}
function ntManualToScroll(){
  const hhCol=document.getElementById('drum-hh');
  const mmCol=document.getElementById('drum-mm');
  const hh=(document.getElementById('nt-m-hh')?.value||'').trim().padStart(2,'0');
  const mm=(document.getElementById('nt-m-mm')?.value||'').trim().padStart(2,'0');
  const hv=parseInt(hh,10),mv=parseInt(mm,10);
  if(!isNaN(hv)&&hv>=1&&hv<=12)_ntDrumSet(hhCol,String(hv).padStart(2,'0'));
  if(!isNaN(mv)&&mv>=0&&mv<=59)_ntDrumSet(mmCol,String(mv).padStart(2,'0'));
}
function ntManualAmPm(val){
  const apCol=document.getElementById('drum-ap');
  _ntDrumSet(apCol,val);
  document.getElementById('nt-m-am')?.classList.toggle('on',val==='AM');
  document.getElementById('nt-m-pm')?.classList.toggle('on',val==='PM');
}
function ntOpenPicker(type){
  _ntCurrentType=type;
  // Set time label based on type
  const lbl=document.getElementById('nt-fs-time-lbl');
  if(lbl)lbl.textContent=type==='late'?'Arrives at':'Leaving at';
  // Populate staff info in form
  const fsName=document.getElementById('nt-fs-name');
  const fsId=document.getElementById('nt-fs-id');
  if(fsName&&ntStaff)fsName.textContent=ntStaff.name;
  if(fsId&&ntStaff)fsId.textContent=ntStaff.empId;
  // Pre-set current time
  const now=new Date();
  const h=now.getHours(),m=now.getMinutes();
  const isAM=h<12;
  const dispH=h%12||12;
  const hhEl=document.getElementById('nt-fs-hh');
  const mmEl=document.getElementById('nt-fs-mm');
  if(hhEl){ hhEl.value=String(dispH).padStart(2,'0'); hhEl.textContent=String(dispH).padStart(2,'0'); }
  if(mmEl){ mmEl.value=String(m).padStart(2,'0'); mmEl.textContent=String(m).padStart(2,'0'); }
  ntFsAmPm(isAM?'AM':'PM');
  // Clear reason
  const reason=document.getElementById('nt-fs-reason');
  if(reason)reason.value='';
  // Transition to form screen
  document.getElementById('nt-type-select').style.display='none';
  document.getElementById('nt-form-screen').style.display='block';
}
function ntClosePicker(){
  // kept for compatibility; new flow uses ntBackToTypeSelect()
  document.getElementById('nt-form-screen').style.display='none';
  document.getElementById('nt-type-select').style.display='none';
  document.getElementById('nt-card-late')?.classList.remove('nt-card-active');
  document.getElementById('nt-card-early')?.classList.remove('nt-card-active');
}
function ntTBInput(el,min,max,nextId){
  el.value=el.value.replace(/\D/g,'');
  if(el.value.length===2){
    let v=parseInt(el.value,10);
    if(v<min)el.value=String(min).padStart(2,'0');
    else if(v>max)el.value=String(max).padStart(2,'0');
    if(nextId){const n=document.getElementById(nextId);if(n){n.focus();n.select();}}
  }
}
function ntTBKey(e,prevId,nextId){
  if(e.key==='ArrowUp'||e.key==='ArrowDown'){
    e.preventDefault();
    const el=e.target;
    const isHH=el.id.endsWith('-hh');
    const min=isHH?1:0,max=isHH?12:59;
    let v=parseInt(el.value||'0',10);
    v=e.key==='ArrowUp'?Math.min(max,v+1):Math.max(min,v-1);
    el.value=String(v).padStart(2,'0');
  }
  if(e.key==='Backspace'&&e.target.value===''&&prevId){
    const p=document.getElementById(prevId);if(p){p.focus();p.select();}
  }
}
function ntSetAmPm(prefix,val){
  const am=document.getElementById(prefix+'-am');
  const pm=document.getElementById(prefix+'-pm');
  if(am&&pm){am.classList.toggle('on',val==='AM');pm.classList.toggle('on',val==='PM');}
}
function ntGetTime(prefix){
  const hh=document.getElementById(prefix+'-hh');
  const mm=document.getElementById(prefix+'-mm');
  const amBtn=document.getElementById(prefix+'-am');
  if(!hh||!mm)return '';
  const h=hh.value.trim(),m=mm.value.trim();
  if(!h||!m)return '';
  const hNum=parseInt(h,10),mNum=parseInt(m,10);
  if(isNaN(hNum)||isNaN(mNum))return '';
  const ampm=amBtn&&amBtn.classList.contains('on')?'AM':'PM';
  return String(hNum).padStart(2,'0')+':'+String(mNum).padStart(2,'0')+' '+ampm;
}
function ntReset(){
  ntStaff=null;_ntCurrentType=null;
  const ntGate = document.getElementById('nt-gate');
  const ntType = document.getElementById('nt-type-select');
  const ntForm = document.getElementById('nt-form-screen');
  const ntSuccess = document.getElementById('nt-success');
  if (ntGate) ntGate.style.display='block';
  if (ntType) ntType.style.display='none';
  if (ntForm) ntForm.style.display='none';
  if (ntSuccess) ntSuccess.style.display='none';
  const _nni=document.getElementById('nt-name-input');
  if(_nni){
    const saved = getSavedUserDeviceMemory();
    if(saved){
      _nni.value = (saved.name || '') + ' (' + saved.empId + ')';
      _nni.dataset.selectedStaff = JSON.stringify(saved);
    } else {
      _nni.value='';
      delete _nni.dataset.selectedStaff;
    }
  }
  updateStaffGateActions('nt-name-input');
  const fb = document.getElementById('nt-idfb');
  if (fb) fb.textContent='';
  document.getElementById('nt-card-late')?.classList.remove('nt-card-active');
  document.getElementById('nt-card-early')?.classList.remove('nt-card-active');
}
function ntBackToGate(){
  document.getElementById('nt-type-select').style.display='none';
  document.getElementById('nt-form-screen').style.display='none';
  document.getElementById('nt-gate').style.display='block';
}
function ntBackToTypeSelect(){
  _ntCurrentType=null;
  document.getElementById('nt-form-screen').style.display='none';
  document.getElementById('nt-type-select').style.display='block';
  document.getElementById('nt-card-late')?.classList.remove('nt-card-active');
  document.getElementById('nt-card-early')?.classList.remove('nt-card-active');
}
function ntFsAmPm(val){
  document.getElementById('nt-fs-am')?.classList.toggle('on',val==='AM');
  document.getElementById('nt-fs-pm')?.classList.toggle('on',val==='PM');
}
// ── Notice Time Input (Keyboard, Numpad & Touchscreen) ────────────────
function ntTimeInput(field, el) {
  let val = el.value.replace(/\D/g, '');
  if (val.length > 2) val = val.slice(0, 2);
  el.value = val;
  el.textContent = val;
  if (field === 'hh') {
    const num = parseInt(val, 10);
    if (val.length === 2 || (num >= 2 && num <= 9)) {
      const mmEl = document.getElementById('nt-fs-mm');
      if (mmEl) { mmEl.focus(); mmEl.select(); }
    }
  }
}

function ntTimeBlur(field, el) {
  let val = el.value.replace(/\D/g, '');
  if (!val) {
    el.value = field === 'hh' ? '08' : '00';
    el.textContent = el.value;
    return;
  }
  let num = parseInt(val, 10);
  if (field === 'hh') {
    if (isNaN(num) || num < 1) num = 1;
    if (num > 12) num = 12;
  } else {
    if (isNaN(num) || num < 0) num = 0;
    if (num > 59) num = 59;
  }
  el.value = String(num).padStart(2, '0');
  el.textContent = el.value;
}

function ntTimeKey(e, field, el) {
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    let val = parseInt(el.value, 10);
    if (isNaN(val)) val = field === 'hh' ? 8 : 0;
    if (e.key === 'ArrowUp') {
      val = field === 'hh' ? (val >= 12 ? 1 : val + 1) : (val >= 59 ? 0 : val + 1);
    } else {
      val = field === 'hh' ? (val <= 1 ? 12 : val - 1) : (val <= 0 ? 59 : val - 1);
    }
    el.value = String(val).padStart(2, '0');
    el.textContent = el.value;
    el.select();
  } else if (e.key === 'Backspace' && el.value === '' && field === 'mm') {
    const hhEl = document.getElementById('nt-fs-hh');
    if (hhEl) { hhEl.focus(); hhEl.select(); }
  } else if (e.key === 'a' || e.key === 'A') {
    e.preventDefault();
    ntFsAmPm('AM');
  } else if (e.key === 'p' || e.key === 'P') {
    e.preventDefault();
    ntFsAmPm('PM');
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (field === 'hh') {
      const mmEl = document.getElementById('nt-fs-mm');
      if (mmEl) { mmEl.focus(); mmEl.select(); }
    } else {
      const rsnEl = document.getElementById('nt-fs-reason');
      if (rsnEl) rsnEl.focus();
    }
  }
}

// ── Numpad ────────────────────────────────────────────────────
let _ntNumpadField=null;
let _ntNumpadValue='';
function ntNumpadOpen(field){
  _ntNumpadField=field;
  _ntNumpadValue='';
  const lbl=document.getElementById('nt-numpad-label');
  if(lbl)lbl.textContent=field==='hh'?'Hour':'Minute';
  const disp=document.getElementById('nt-numpad-display');
  if(disp)disp.textContent='--';
  const overlay=document.getElementById('nt-numpad-overlay');
  if(overlay){overlay.style.display='flex';overlay.style.alignItems='flex-end';overlay.style.justifyContent='center';}
}
function ntNumpadKey(digit){
  if(_ntNumpadValue.length>=2)return;
  _ntNumpadValue+=digit;
  const disp=document.getElementById('nt-numpad-display');
  if(disp)disp.textContent=_ntNumpadValue.length===1?'0'+_ntNumpadValue:_ntNumpadValue;
}
function ntNumpadBackspace(){
  _ntNumpadValue=_ntNumpadValue.slice(0,-1);
  const disp=document.getElementById('nt-numpad-display');
  if(disp)disp.textContent=_ntNumpadValue?(_ntNumpadValue.length===1?'0'+_ntNumpadValue:_ntNumpadValue):'--';
}
function ntNumpadClear(){
  _ntNumpadValue='';
  const disp=document.getElementById('nt-numpad-display');
  if(disp)disp.textContent='--';
}
function ntNumpadConfirm(){
  if(!_ntNumpadValue){ntNumpadClose();return;}
  const v=parseInt(_ntNumpadValue,10);
  if(_ntNumpadField==='hh'){
    if(v<1||v>12){toast('Hour must be 1–12','bad');return;}
    const el=document.getElementById('nt-fs-hh');
    if(el){el.value=String(v).padStart(2,'0');el.textContent=el.value;}
  } else {
    if(v<0||v>59){toast('Minute must be 0–59','bad');return;}
    const el=document.getElementById('nt-fs-mm');
    if(el){el.value=String(v).padStart(2,'0');el.textContent=el.value;}
  }
  ntNumpadClose();
}
function ntNumpadClose(){
  const overlay=document.getElementById('nt-numpad-overlay');
  if(overlay)overlay.style.display='none';
  _ntNumpadField=null;_ntNumpadValue='';
}
async function ntVerify(){
  const inputEl = document.getElementById('nt-name-input');
  const rawInput = inputEl ? inputEl.value.trim() : '';
  const fb = document.getElementById('nt-idfb');
  if (!rawInput) { fb.textContent = 'Please select or enter your Full Name.'; fb.className = 'idfb err'; gateSetError('nt-gate'); return; }

  let targetStaff = null;
  if (inputEl.dataset.selectedStaff) {
    try { targetStaff = JSON.parse(inputEl.dataset.selectedStaff); } catch (e) {}
  }
  if (!targetStaff) {
    const staffList = await loadStaffCache();
    const match = rawInput.match(/\(([^)]+)\)$/);
    const targetId = match ? match[1].trim() : '';
    const cleanName = rawInput.replace(/\([^)]+\)$/, '').trim().toLowerCase();
    targetStaff = staffList.find(s => {
      const idMatch = targetId && (s.empId === targetId || s.empId.replace(/^0+/, '') === targetId.replace(/^0+/, ''));
      const nameMatch = (s.name || '').toLowerCase() === cleanName || (s.nameKh || '').toLowerCase() === cleanName;
      return idMatch || nameMatch;
    });
  }

  if (!targetStaff) {
    fb.textContent = 'Staff name not found. Please select from the dropdown.'; fb.className = 'idfb err'; gateSetError('nt-gate'); return;
  }

  // Instant transition! No API call needed since we have staff data from cache.
  ntStaff = targetStaff;
  saveUserDeviceMemory(ntStaff);
  document.getElementById('nt-gate').style.display = 'none';
  document.getElementById('nt-type-select').style.display = 'block';
}
async function ntSubmit(){
  const hhEl=document.getElementById('nt-fs-hh');
  const mmEl=document.getElementById('nt-fs-mm');
  const hh=(hhEl?(hhEl.value||hhEl.textContent||''):'').trim();
  const mm=(mmEl?(mmEl.value||mmEl.textContent||''):'').trim();
  const isAM=document.getElementById('nt-fs-am')?.classList.contains('on');
  const ap=isAM?'AM':'PM';
  const time=(hh&&mm&&hh!=='--'&&mm!=='--')?`${hh}:${mm} ${ap}`:'';
  const reason=document.getElementById('nt-fs-reason').value.trim();
  if(!time){toast('Please select a time','bad');return;}
  if(!reason){toast('Please enter a reason','bad');return;}
  const btn=document.getElementById('nt-submit-btn'),sp=document.getElementById('nt-submit-sp');
  btn.disabled=true;sp.style.display='block';
  try{
    if(!isMock()){
      const res=await apiPost('sendNotice',{
        noticeType:_ntCurrentType,
        name:ntStaff.name,empId:ntStaff.empId,
        time,returnTime:'—',reason,
        noticeDate:new Date().toLocaleDateString('en-GB')
      });
      if(res.result!=='success')throw new Error('failed');
    }
    document.getElementById('nt-form-screen').style.display='none';
    document.getElementById('nt-success').style.display='flex';
  }catch(e){toast('Failed to send. Try again.','bad');}finally{btn.disabled=false;sp.style.display='none';}
}

// ══════════════════ SYNC/REFRESH ══════════════════════════════
function syncRefresh(){
  const icon=document.getElementById('sync-icon');
  if(icon)icon.style.animation='spin .7s linear infinite';
  setTimeout(()=>{
    if(icon)icon.style.animation='';
    toast('Synced','ok2');
  },1200);
  // Force reload data if HR is logged in
  if(hrUser&&hrToken){hrLoadData();}
}

// ══════════════════ ATTENDANCE ══════════════════════════════════
const WORK_START_MINS  = 8*60+30;  // 08:30
const EARLY_THRESH_MINS= 8*60+20;  // 08:20 — 10 min early threshold
const WORK_END_MINS    = 17*60+30; // 17:30

function _attnToMins(t){
  if(!t)return null;
  const p=String(t).trim().split(':');
  if(p.length<2)return null;
  const h=parseInt(p[0]),m=parseInt(p[1]);
  return(isNaN(h)||isNaN(m))?null:h*60+m;
}
function attnArrivalStatus(checkIn){
  const m=_attnToMins(checkIn);
  if(m===null)return'Absent';
  if(m<EARLY_THRESH_MINS)return'Early';
  if(m<=WORK_START_MINS)return'On Time';
  return'Late';
}
function attnDepartureStatus(checkOut){
  const m=_attnToMins(checkOut);
  if(m===null)return'No Record';
  return m<WORK_END_MINS?'Leave Early':'Normal';
}

// ── Template download ────────────────────────────────────────────
function attnDownloadTemplate(){
  const wb=XLSX.utils.book_new();
  const headers=['Employee ID','Full Name','Date','Check In','Check Out','Note'];
  const ws=XLSX.utils.aoa_to_sheet([headers]);
  ws['!cols']=[{wch:14},{wch:22},{wch:14},{wch:14},{wch:14},{wch:28}];
  XLSX.utils.book_append_sheet(wb,ws,'Attendance');
  XLSX.writeFile(wb,'Attendance_Template.xlsx',{bookType:'xlsx',compression:true});
  toast('Template downloaded','ok2');
}

// ── Upload & parse ───────────────────────────────────────────────
let _attnRecords=[];
function attnHandleUpload(input){
  const file=input.files[0];
  if(!file)return;
  const reader=new FileReader();
  reader.onload=function(e){
    try{
      const wb=XLSX.read(e.target.result,{type:'array'});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const rows=XLSX.utils.sheet_to_json(ws,{header:1,defval:''});
      if(rows.length<2){toast('File is empty or invalid','bad');return;}
      const hdr=rows[0].map(h=>String(h).trim().toLowerCase());
      const iId  =hdr.findIndex(h=>h.includes('employee')||h==='id');
      const iName=hdr.findIndex(h=>h.includes('name'));
      const iDate=hdr.findIndex(h=>h.includes('date'));
      const iIn  =hdr.findIndex(h=>h.includes('check in'));
      const iOut =hdr.findIndex(h=>h.includes('check out'));
      const iNote=hdr.findIndex(h=>h.includes('note'));
      if(iId<0||iDate<0){toast('Invalid file — missing Employee ID or Date column','bad');return;}
      const records=[];
      for(let i=1;i<rows.length;i++){
        const r=rows[i];
        const empId=String(r[iId]||'').trim();
        let date=String(r[iDate]||'').trim();
        if(!empId||empId.startsWith('[')||!date||date.startsWith('['))continue;
        // Normalise: if YYYY-MM-DD convert to DD-MM-YYYY for display
        if(/^\d{4}-\d{2}-\d{2}$/.test(date)){const p=date.split('-');date=p[2]+'-'+p[1]+'-'+p[0];}
        // Also handle Excel serial date numbers
        if(/^\d{5}$/.test(date)){const d=new Date(Math.round((Number(date)-25569)*86400*1000));date=String(d.getDate()).padStart(2,'0')+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+d.getFullYear();}
        const checkIn =String(iIn >=0?r[iIn] ||'':'').trim();
        const checkOut=String(iOut>=0?r[iOut]||'':'').trim();
        records.push({
          empId,
          name:String(iName>=0?r[iName]||'':'').trim(),
          date,
          checkIn,
          checkOut,
          arrivalStatus  :attnArrivalStatus(checkIn),
          departureStatus:attnDepartureStatus(checkOut),
          note:String(iNote>=0?r[iNote]||'':'').trim()
        });
      }
      if(!records.length){toast('No valid data rows found','bad');return;}
      _attnRecords=records;
      attnRenderTable();
      document.getElementById('attn-preview-section').style.display='block';
      toast(records.length+' records loaded — review then click Import','ok2');
    }catch(ex){toast('Failed to read file: '+ex.message,'bad');}
  };
  reader.readAsArrayBuffer(file);
  input.value='';
}

// ── Render preview table ─────────────────────────────────────────
const _ATTN_ARR_BADGE={
  'Early'      :'<span class="attn-badge attn-early">Early</span>',
  'On Time'    :'<span class="attn-badge attn-ontime">On Time</span>',
  'Late'       :'<span class="attn-badge attn-late">Late</span>',
  'Absent'     :'<span class="attn-badge attn-absent">Absent</span>'
};
const _ATTN_DEP_BADGE={
  'Normal'     :'<span class="attn-badge attn-normal">Normal</span>',
  'Leave Early':'<span class="attn-badge attn-leavearly">Leave Early</span>',
  'No Record'  :'<span class="attn-badge attn-norecord">No Record</span>'
};
function attnRenderTable(){
  const tbody =document.getElementById('attn-tbody');
  const nodata=document.getElementById('attn-nodata');
  if(!_attnRecords.length){tbody.innerHTML='';nodata.style.display='block';return;}
  nodata.style.display='none';
  tbody.innerHTML=_attnRecords.map(r=>`<tr>
    <td style="white-space:nowrap">${r.date}</td>
    <td><div style="font-weight:500">${r.name||'—'}</div><div style="font-size:11px;color:var(--txt3)">${r.empId}</div></td>
    <td style="text-align:center">${r.checkIn||'—'}</td>
    <td>${_ATTN_ARR_BADGE[r.arrivalStatus]||r.arrivalStatus}</td>
    <td style="text-align:center">${r.checkOut||'—'}</td>
    <td>${_ATTN_DEP_BADGE[r.departureStatus]||r.departureStatus}</td>
    <td style="font-size:12px;color:var(--txt3)">${r.note||'—'}</td>
  </tr>`).join('');
}

// ── Import to Google Sheets ──────────────────────────────────────
async function attnImport(){
  if(!_attnRecords.length){toast('No records to import','bad');return;}
  const btn=document.getElementById('attn-import-btn');
  btn.disabled=true;btn.innerHTML='Importing…';
  try{
    const res=await apiPost('importAttendance',{records:_attnRecords,token:hrToken||''});
    if(res.result==='success'){
      toast(res.imported+' records saved to Google Sheets','ok2');
      _attnRecords=[];
      attnRenderTable();
      document.getElementById('attn-preview-section').style.display='none';
    }else{
      toast('Import failed: '+(res.error||'Unknown error'),'bad');
    }
  }catch(e){toast('Connection error','bad');}
  finally{
    btn.disabled=false;
    btn.innerHTML='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Import to Google Sheets';
  }
}

// ── MANUAL ENTRY ─────────────────────────────────────────────────
let _manualStaff=null;
function hrManualInit(){
  _manualStaff=null;
  ['me-result','me-type-sel','me-form-leave','me-form-notice'].forEach(id=>{const el=document.getElementById(id);if(el)el.style.display='none';});
  const eid=document.getElementById('me-empid');if(eid)eid.value='';
}
function meShowSection(section){
  document.getElementById('me-form-leave').style.display=section==='leave'?'block':'none';
  document.getElementById('me-form-notice').style.display=section==='notice'?'block':'none';
  // highlight active button
  const bl=document.getElementById('me-btn-leave'),bn=document.getElementById('me-btn-notice');
  if(bl){bl.style.background=section==='leave'?'var(--red)':'var(--surface2)';bl.style.color=section==='leave'?'#fff':'var(--txt2)';bl.style.borderColor=section==='leave'?'var(--red)':'var(--border)';}
  if(bn){bn.style.background=section==='notice'?'var(--red)':'var(--surface2)';bn.style.color=section==='notice'?'#fff':'var(--txt2)';bn.style.borderColor=section==='notice'?'var(--red)':'var(--border)';}
}
function meToggleReturn(){
  const type=document.getElementById('me-ntype').value;
  const lbl=document.getElementById('me-ntime-lbl');
  const retRow=document.getElementById('me-return-row');
  if(lbl)lbl.textContent=type==='late'?'Arrival Time':'Departure Time';
  if(retRow)retRow.style.display=type==='late'?'block':'none';
}
async function hrManualLookup(){
  const eid=document.getElementById('me-empid').value.trim();
  if(!eid){toast('Enter Employee ID','bad');return;}
  const res=await apiHR('getStaffList',{});
  if(!res||!res.staff){toast('Failed to load staff','bad');return;}
  const s=res.staff.find(x=>String(x.empId).trim()===eid);
  if(!s){toast('Employee not found','bad');return;}
  _manualStaff=s;
  document.getElementById('me-name').textContent=s.name;
  document.getElementById('me-pos').textContent=s.position;
  document.getElementById('me-result').style.display='block';
  document.getElementById('me-type-sel').style.display='block';
  // reset forms
  document.getElementById('me-form-leave').style.display='none';
  document.getElementById('me-form-notice').style.display='none';
  // reset leave form fields
  ['me-from','me-to','me-reason'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
  document.getElementById('me-days').value='1';
  // reset notice form fields
  document.getElementById('me-ntime').value='';
  const _mnret=document.getElementById('me-nreturn');if(_mnret)_mnret.value='';
  document.getElementById('me-nreason').value='';
  const _mndt=document.getElementById('me-ndate');if(_mndt)_mndt.value='';
}
function meCalcDays(){
  const f=document.getElementById('me-from').value,t=document.getElementById('me-to').value;
  if(!f||!t)return;
  const d1=new Date(f),d2=new Date(t);if(isNaN(d1)||isNaN(d2)||d2<d1)return;
  let days=0,cur=new Date(d1);
  while(cur<=d2){const dow=cur.getDay();if(dow!==0&&dow!==6)days++;cur.setDate(cur.getDate()+1);}
  const el=document.getElementById('me-days');if(el)el.value=days;
}
async function hrManualSubmit(){
  if(!_manualStaff){toast('No staff selected','bad');return;}
  const ltype=document.getElementById('me-ltype').value;
  if(!ltype){toast('Select a leave type','bad');return;}
  const dateFrom=document.getElementById('me-from').value;
  if(!dateFrom){toast('Select a start date','bad');return;}
  const dateTo=document.getElementById('me-to').value||dateFrom;
  const days=parseFloat(document.getElementById('me-days').value)||1;
  const reason=document.getElementById('me-reason').value.trim();
  const btn=document.getElementById('me-submit-btn');
  if(btn){btn.disabled=true;btn.textContent='Saving...';}
  try{
    const res=await apiHR('manualEntry',{
      employeeId:_manualStaff.empId,name:_manualStaff.name,gender:_manualStaff.gender||'',
      position:_manualStaff.position,leaveType:ltype,dateFrom,dateTo,
      workingDays:days,reason:reason||'Manual entry by HR',location:_manualStaff.location||'Phnom Penh'
    });
    if(res&&res.result==='success'){
      toast('Leave saved (silent)','ok2');
      document.getElementById('me-ltype').value='';
      ['me-from','me-to','me-reason'].forEach(id=>{const el=document.getElementById(id);if(el)el.value='';});
      document.getElementById('me-days').value='1';
      hrLoadData();
    }else{toast(res&&res.error?res.error:'Save failed','bad');}
  }catch(e){toast('Error: '+e,'bad');}
  finally{if(btn){btn.disabled=false;btn.textContent='Save Leave (Silent)';}}
}
async function hrManualNoticeSubmit(){
  if(!_manualStaff){toast('No staff selected','bad');return;}
  const noticeType=document.getElementById('me-ntype').value;
  const date=document.getElementById('me-ndate').value;
  if(!date){toast('Select a date','bad');return;}
  const time=document.getElementById('me-ntime').value;
  if(!time){toast('Enter a time','bad');return;}
  const returnTime=document.getElementById('me-nreturn')?document.getElementById('me-nreturn').value:'';
  const reason=document.getElementById('me-nreason').value.trim();
  const btn=document.getElementById('me-notice-btn');
  if(btn){btn.disabled=true;btn.textContent='Saving...';}
  try{
    const res=await apiHR('manualNotice',{
      empId:_manualStaff.empId,name:_manualStaff.name,
      noticeType,noticeDate:date,time,returnTime,reason:reason||'Manual entry by HR'
    });
    if(res&&res.result==='success'){
      toast('Notice saved (silent)','ok2');
      document.getElementById('me-ntime').value='';
      if(document.getElementById('me-nreturn'))document.getElementById('me-nreturn').value='';
      document.getElementById('me-nreason').value='';
      hrLoadData();
    }else{toast(res&&res.error?res.error:'Save failed','bad');}
  }catch(e){toast('Error: '+e,'bad');}
  finally{if(btn){btn.disabled=false;btn.textContent='Save Notice (Silent)';}}
}

async function wipeTestUser(){
  if(!confirm('Wipe ALL data for test user johnwich / KMEOW007?\n\nThis deletes all their requests, notices, and attendance records, and resets their leave balance to 0.\n\nThis cannot be undone.'))return;
  const btn=document.getElementById('wipe-test-btn');
  if(btn){btn.disabled=true;btn.textContent='Wiping...';}
  try{
    const res=await apiHR('wipeTestUser');
    if(res&&res.result==='success'){
      const d=res.deleted||{};
      toast(`Wiped: ${d.requests||0} requests · ${d.notices||0} notices · ${d.attendance||0} attendance`,'ok2');
      hrLoadData();
    }else{toast('Wipe failed','bad');}
  }catch(e){toast('Error: '+e,'bad');}
  finally{if(btn){btn.disabled=false;btn.textContent='Wipe All Test Data';}}
}

function getTodayLocalISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseToISO(val) {
  if (!val) return '';
  if (val instanceof Date) {
    if (isNaN(val.getTime())) return '';
    return `${val.getFullYear()}-${String(val.getMonth()+1).padStart(2,'0')}-${String(val.getDate()).padStart(2,'0')}`;
  }
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  const dmy = s.match(/^(\d{1,2})[-\s/]([A-Za-z]{3,9})[-\s/](\d{4})/);
  if (dmy) {
    const day = dmy[1].padStart(2, '0');
    const mNames = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};
    const m = mNames[dmy[2].slice(0,3).toLowerCase()] || '01';
    return `${dmy[3]}-${m}-${day}`;
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    return `${parsed.getFullYear()}-${String(parsed.getMonth()+1).padStart(2,'0')}-${String(parsed.getDate()).padStart(2,'0')}`;
  }
  return s;
}

// ── HOME LEAVE BOARD ─────────────────────────────────────────────────
async function loadHomeLeaveBoard(){
  const el = document.getElementById('home-leave-list');
  if (!el) return;

  if (!_appInitData) {
    try {
      await loadStaffCache();
    } catch(e) {}
  }

  try {
    const allLeaves = (_appInitData && _appInitData.history) ? _appInitData.history : [];
    const staffList = (_appInitData && _appInitData.staffList) ? _appInitData.staffList : [];
    const today = getTodayLocalISO();

    const upcoming = allLeaves.filter(l => {
      const st = (l.status || '').trim().toLowerCase();
      if (st === 'rejected' || st === 'cancelled') return false;
      const toISO = parseToISO(l.to || l.dateTo);
      const fromISO = parseToISO(l.from || l.dateFrom);
      const effTo = toISO || fromISO;
      return effTo && effTo >= today;
    }).map(l => {
      const fromISO = parseToISO(l.from || l.dateFrom);
      const toISO = parseToISO(l.to || l.dateTo) || fromISO;
      let name = l.empName || l.name;
      if (!name && l.empId) {
        const staff = staffList.find(s => String(s.empId).toUpperCase() === String(l.empId).toUpperCase());
        if (staff) name = (LANG === 'kh' ? (staff.nameKh || staff.name) : staff.name);
      }
      const isToday = (fromISO <= today && toISO >= today);
      return {
        ...l,
        fromISO: fromISO || l.from,
        toISO: toISO || l.to,
        isToday,
        displayName: name || l.empId || 'Staff'
      };
    }).sort((a, b) => {
      if (a.isToday && !b.isToday) return -1;
      if (!a.isToday && b.isToday) return 1;
      return (a.fromISO || '').localeCompare(b.fromISO || '');
    });

    if (!upcoming.length) {
      el.innerHTML = '<div style="color:var(--txt3);font-size:13px;text-align:center;padding:24px 20px">No one is on leave today or in the future.</div>';
      return;
    }
    
    el.innerHTML = upcoming.map(l => {
      const st = (l.status || '').trim().toLowerCase();
      const isPending = (st === 'pending');
      const dot = isPending ? 'var(--warn)' : 'var(--ok)';
      const statusBadge = isPending 
        ? '<span style="font-size:10px;font-weight:600;color:var(--warn);background:rgba(234,179,8,0.12);padding:2px 7px;border-radius:4px;border:1px solid rgba(234,179,8,0.25)">Pending Approval</span>'
        : '<span style="font-size:10px;font-weight:600;color:var(--ok);background:rgba(34,197,94,0.12);padding:2px 7px;border-radius:4px;border:1px solid rgba(34,197,94,0.25)">Approved</span>';
      
      const timingTag = l.isToday
        ? '<span style="font-size:10.5px;font-weight:700;color:#fff;background:var(--red);padding:2px 6px;border-radius:4px;text-transform:uppercase;letter-spacing:0.04em">On Leave Today</span>'
        : '<span style="font-size:10.5px;font-weight:600;color:var(--txt2);background:var(--surface2);border:1px solid var(--border);padding:2px 6px;border-radius:4px">Upcoming</span>';

      const datesStr = fmtDate(l.fromISO || l.from) + ((l.toISO && l.toISO !== l.fromISO) ? ' – ' + fmtDate(l.toISO) : '');
      const daysNum = parseFloat(l.days || l.workingDays) || 0;
      const daysStr = daysNum > 0 ? ` (${daysNum} day${daysNum > 1 ? 's' : ''})` : '';
      const lType = l.leaveType || l.type || 'Leave';

      return `<div style="display:flex;align-items:center;justify-content:space-between;padding:12px 18px;border-bottom:1px solid var(--border);gap:12px;flex-wrap:wrap;background:var(--surface);transition:background 0.15s">` +
        `<div style="display:flex;align-items:center;gap:12px;min-width:200px">` +
        `<div style="width:9px;height:9px;border-radius:50%;background:${dot};flex-shrink:0;box-shadow:0 0 0 3px rgba(0,0,0,0.04)"></div>` +
        `<div>` +
        `<div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">` +
        `<span style="font-weight:700;font-size:13.5px;color:var(--txt)">${l.displayName}</span>` +
        timingTag +
        statusBadge +
        `</div>` +
        `<div style="font-size:11.5px;color:var(--txt3);margin-top:2px">${lType} · ID: ${l.empId || '—'}</div>` +
        `</div>` +
        `</div>` +
        `<div style="text-align:right;flex-shrink:0">` +
        `<div style="font-size:12.5px;font-weight:600;color:var(--txt)">${datesStr}</div>` +
        `<div style="font-size:11px;color:var(--txt3);margin-top:1px">${daysStr ? daysStr.trim() : ''}</div>` +
        `</div></div>`;
    }).join('');
  } catch(e) {
    console.error('Home leave board error:', e);
    el.innerHTML = '<div style="color:var(--txt3);font-size:13px;text-align:center;padding:24px 20px">Could not load leave records.</div>';
  }
}
document.addEventListener('DOMContentLoaded', async function(){
  const splash = document.getElementById('app-splash');
  const status = document.getElementById('splash-status');

  function dismissSplash() {
    if (window._splashMsgInterval) {
      clearTimeout(window._splashMsgInterval);
      clearInterval(window._splashMsgInterval);
    }
    const sp = document.getElementById('app-splash');
    if (sp) {
      sp.classList.add('splash-done');
      setTimeout(function(){ if (sp && sp.parentNode) sp.parentNode.removeChild(sp); }, 400);
    }
  }

  // Guaranteed fallback dismiss
  setTimeout(dismissSplash, 2800);

  try {
    if (status) status.textContent = 'Loading staff data...';
    await loadStaffCache();
    await loadHomeLeaveBoard();
    if (status) status.textContent = 'Ready';
  } catch (e) {
    if (status) status.textContent = 'Ready';
  }

  if (window._triggerSplashFastForward) window._triggerSplashFastForward();
  else window._splashFastForward = true;

  setTimeout(dismissSplash, 800);
});

// ── BUILT-IN POPUP DATE CALENDAR WITH WEEKEND BLACKOUT ───────────────────
let _calYear = new Date().getFullYear();
let _calMonth = new Date().getMonth();
let _calActiveTarget = 'from'; // 'from' or 'to'

function openCalModal(target) {
  _calActiveTarget = target || 'from';
  const modal = document.getElementById('cal-modal');
  
  const currentVal = getIsoDateVal(_calActiveTarget === 'from' ? 'rf-from' : 'rf-to') || getIsoDateVal('rf-from');
  if (currentVal && /^\d{4}-\d{2}-\d{2}$/.test(currentVal)) {
    const d = new Date(currentVal + 'T00:00:00');
    if (!isNaN(d.getTime())) {
      _calYear = d.getFullYear();
      _calMonth = d.getMonth();
    }
  } else {
    const now = new Date();
    _calYear = now.getFullYear();
    _calMonth = now.getMonth();
  }

  if (modal) {
    modal.style.display = 'flex';
  }
  renderBuiltInCalendar();
}

function closeCalModal() {
  const modal = document.getElementById('cal-modal');
  if (modal) modal.style.display = 'none';
}

function confirmCalModal() {
  closeCalModal();
  if (typeof autoSetTo === 'function') autoSetTo();
  if (typeof calcDays === 'function') calcDays();
  if (typeof clearFieldErr === 'function') clearFieldErr();
  if (typeof tourNotifyAction === 'function') tourNotifyAction('date');
}

function setCalTarget(target) {
  _calActiveTarget = target || 'from';
  const currentVal = getIsoDateVal(_calActiveTarget === 'from' ? 'rf-from' : 'rf-to');
  if (currentVal && /^\d{4}-\d{2}-\d{2}$/.test(currentVal)) {
    const d = new Date(currentVal + 'T00:00:00');
    if (!isNaN(d.getTime())) {
      _calYear = d.getFullYear();
      _calMonth = d.getMonth();
    }
  }
  renderBuiltInCalendar();
}

function initBuiltInCalendar() {
  renderBuiltInCalendar();
}

function calNavMonth(delta) {
  _calMonth += delta;
  if (_calMonth > 11) {
    _calMonth = 0;
    _calYear++;
  } else if (_calMonth < 0) {
    _calMonth = 11;
    _calYear--;
  }
  renderBuiltInCalendar();
}

function calGoToday() {
  const now = new Date();
  _calYear = now.getFullYear();
  _calMonth = now.getMonth();
  renderBuiltInCalendar();
}

function calClearSelection() {
  const fromEl = document.getElementById('rf-from');
  const toEl = document.getElementById('rf-to');
  if (fromEl) {
    fromEl.value = '';
    fromEl.dataset.iso = '';
  }
  if (toEl) {
    toEl.value = '';
    toEl.dataset.iso = '';
  }
  _calActiveTarget = 'from';
  if (typeof autoSetTo === 'function') autoSetTo();
  if (typeof calcDays === 'function') calcDays();
  if (typeof clearFieldErr === 'function') clearFieldErr();
  renderBuiltInCalendar();
}

function renderBuiltInCalendar() {
  const container = document.getElementById('built-in-calendar');
  if (!container) return;

  const monthNamesEN = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const monthNamesKH = ["មករា", "កុម្ភៈ", "មីនា", "មេសា", "ឧសភា", "មិថុនា", "កក្កដា", "សីហា", "កញ្ញា", "តុលា", "វិច្ឆិកា", "ធ្នូ"];
  
  const monthTitle = (LANG === 'kh' ? monthNamesKH[_calMonth] : monthNamesEN[_calMonth]) + ' ' + _calYear;

  const fromVal = getIsoDateVal('rf-from');
  const toVal = getIsoDateVal('rf-to');

  const firstDate = new Date(_calYear, _calMonth, 1);
  const lastDate = new Date(_calYear, _calMonth + 1, 0).getDate();
  const prevLastDate = new Date(_calYear, _calMonth, 0).getDate();

  let firstDayIdx = (firstDate.getDay() + 6) % 7; // Monday = 0, Sunday = 6

  const fromDisp = fromVal ? fmtDate(fromVal) : (LANG === 'kh' ? 'មិនទាន់រើស' : 'Not Set');
  const toDisp = toVal ? fmtDate(toVal) : (LANG === 'kh' ? 'មិនទាន់រើស' : 'Not Set');

  let html = `
    <div class="cal-target-tabs">
      <button type="button" class="cal-tab-btn ${_calActiveTarget === 'from' ? 'active' : ''}" onclick="setCalTarget('from')">
        <span class="cal-tab-label">${LANG === 'kh' ? 'ចាប់ផ្តើម (From)' : 'Start Date (From)'}</span>
        <span class="cal-tab-val">${fromDisp}</span>
      </button>
      <div class="cal-tab-arrow">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="5" y1="12" x2="19" y2="12"></line>
          <polyline points="12 5 19 12 12 19"></polyline>
        </svg>
      </div>
      <button type="button" class="cal-tab-btn ${_calActiveTarget === 'to' ? 'active' : ''}" onclick="setCalTarget('to')">
        <span class="cal-tab-label">${LANG === 'kh' ? 'បញ្ចប់ (To)' : 'End Date (To)'}</span>
        <span class="cal-tab-val">${toDisp}</span>
      </button>
    </div>

    <div class="cal-header-bar">
      <div class="cal-title-wrap">
        <button type="button" class="cal-nav-btn" onclick="calNavMonth(-1)" aria-label="Previous Month">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          <span>Prev</span>
        </button>
        <span class="cal-month-title">${monthTitle}</span>
        <button type="button" class="cal-nav-btn" onclick="calNavMonth(1)" aria-label="Next Month">
          <span>Next</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
        <button type="button" class="cal-nav-btn" onclick="calGoToday()">${LANG === 'kh' ? 'ថ្ងៃនេះ' : 'Today'}</button>
        <button type="button" class="cal-nav-btn" onclick="calClearSelection()" style="color:var(--err,#dc2626);font-weight:600">${LANG === 'kh' ? 'សម្អាត' : 'Clear'}</button>
      </div>
      <div class="cal-legend">
        <span class="cal-leg-item"><span class="cal-leg-dot leg-work"></span>${LANG === 'kh' ? 'ថ្ងៃធ្វើការ' : 'Workday'}</span>
        <span class="cal-leg-item"><span class="cal-leg-dot leg-wknd"></span>${LANG === 'kh' ? 'ចុងសប្តាហ៍' : 'Weekend'}</span>
        <span class="cal-leg-item"><span class="cal-leg-dot leg-hol"></span>${LANG === 'kh' ? 'ថ្ងៃបុណ្យ' : 'Holiday'}</span>
        <span class="cal-leg-item"><span class="cal-leg-dot leg-sel"></span>${LANG === 'kh' ? 'បានជ្រើស' : 'Selected'}</span>
      </div>
    </div>

    <div class="cal-grid-header">
      <div class="cal-hdr-day">${LANG === 'kh' ? 'ច័ន្ទ' : 'Mon'}</div>
      <div class="cal-hdr-day">${LANG === 'kh' ? 'អង្គារ' : 'Tue'}</div>
      <div class="cal-hdr-day">${LANG === 'kh' ? 'ពុធ' : 'Wed'}</div>
      <div class="cal-hdr-day">${LANG === 'kh' ? 'ព្រហ' : 'Thu'}</div>
      <div class="cal-hdr-day">${LANG === 'kh' ? 'សុក្រ' : 'Fri'}</div>
      <div class="cal-hdr-day cal-hdr-wknd">${LANG === 'kh' ? 'សៅរ៍' : 'Sat'}<br><span style="font-size:8px;opacity:0.9">OFF</span></div>
      <div class="cal-hdr-day cal-hdr-wknd">${LANG === 'kh' ? 'អាទិត្យ' : 'Sun'}<br><span style="font-size:8px;opacity:0.9">OFF</span></div>
    </div>

    <div class="cal-grid-days">
  `;

  // Previous month trailing days
  for (let i = firstDayIdx - 1; i >= 0; i--) {
    const dayNum = prevLastDate - i;
    html += `<div class="cal-cell cal-off-month">${dayNum}</div>`;
  }

  // Current month days
  for (let day = 1; day <= lastDate; day++) {
    const dateObj = new Date(_calYear, _calMonth, day);
    const yyyy = _calYear;
    const mm = String(_calMonth + 1).padStart(2, '0');
    const dd = String(day).padStart(2, '0');
    const isoDate = `${yyyy}-${mm}-${dd}`;

    const dayOfWeek = dateObj.getDay(); // 0 = Sun, 6 = Sat
    const isWknd = (dayOfWeek === 0 || dayOfWeek === 6);
    const hol = getHolidayObj(isoDate);
    const isHol = !!hol;

    let classes = ['cal-cell'];
    if (isWknd) classes.push('cal-day-wknd');
    if (isHol) classes.push('cal-day-hol');

    if (fromVal && isoDate === fromVal) {
      classes.push('cal-day-start');
    } else if (toVal && isoDate === toVal) {
      classes.push('cal-day-end');
    } else if (fromVal && toVal && isoDate > fromVal && isoDate < toVal) {
      classes.push('cal-day-in-range');
      if (isWknd) classes.push('cal-day-wknd-in-range');
      if (isHol) classes.push('cal-day-hol-in-range');
    }

    let badge = '';
    if (isWknd) {
      badge = `<span class="cal-wknd-badge">OFF</span>`;
    } else if (isHol) {
      const holTitle = (hol.name || 'Holiday').replace(/"/g, '&quot;');
      badge = `<span class="cal-hol-badge" title="${holTitle}">HOL</span>`;
    }

    const clickAttr = `onclick="calSelectDate('${isoDate}', ${isWknd}, ${isHol})"`;

    html += `<div class="${classes.join(' ')}" ${clickAttr}>
      <span>${day}</span>
      ${badge}
    </div>`;
  }

  // Next month leading days (Fixed 42 cells = 6 rows for 100% height stability)
  const totalCells = firstDayIdx + lastDate;
  const remainingCells = 42 - totalCells;
  for (let i = 1; i <= remainingCells; i++) {
    html += `<div class="cal-cell cal-off-month">${i}</div>`;
  }

  html += `</div>`;

  // Reserved Summary Bar below calendar (Maintains fixed height to prevent shape shifting)
  if (fromVal && toVal && fromVal <= toVal) {
    const wd = workDays(fromVal, toVal);
    const weCount = weekendDays(fromVal, toVal);
    const holCount = holidayDays(fromVal, toVal);
    const rangeText = fmtDate(fromVal) + (fromVal !== toVal ? (' → ' + fmtDate(toVal)) : '');
    
    const skipItems = [];
    if (weCount > 0) skipItems.push(`${weCount} weekend ${weCount === 1 ? 'day' : 'days'}`);
    if (holCount > 0) skipItems.push(`${holCount} holiday ${holCount === 1 ? 'day' : 'days'}`);
    const skipText = skipItems.length > 0 ? ` (${skipItems.join(' & ')} blacked out / skipped)` : '';
    
    html += `
      <div class="cal-summary-bar">
        <div class="cal-sum-left">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" style="color:#16a34a;flex-shrink:0">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span><strong>${rangeText}</strong></span>
        </div>
        <span class="cal-sum-badge">${wd} Working ${wd === 1 ? 'Day' : 'Days'}${skipText}</span>
      </div>
    `;
  } else {
    html += `
      <div class="cal-summary-bar cal-summary-empty">
        <div class="cal-sum-left" style="color:var(--txt3)">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="opacity:0.5;flex-shrink:0">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          <span>${LANG === 'kh' ? 'ជ្រើសរើសថ្ងៃនៅលើប្រតិទិន...' : 'Select date(s) on calendar to calculate duration...'}</span>
        </div>
        <span class="cal-sum-badge cal-sum-badge-empty" style="opacity:0.6;background:var(--bg2);color:var(--txt3)">-- ${LANG === 'kh' ? 'ថ្ងៃធ្វើការ' : 'Working Days'}</span>
      </div>
    `;
  }

  container.innerHTML = html;
}

function calSelectDate(isoDate, isWknd, isHol) {
  if (isWknd) {
    toast(LANG === 'kh' ? 'ថ្ងៃសៅរ៍ និងថ្ងៃអាទិត្យ ជាថ្ងៃចុងសប្តាហ៍ដែលត្រូវបានរំលងដោយស្វ័យប្រវត្តិ។' : 'Saturday & Sunday are non-working weekend days (blacked out).', '');
    return;
  }
  if (isHol) {
    const hol = getHolidayObj(isoDate);
    const name = hol ? (LANG === 'kh' && hol.nameKh ? hol.nameKh : hol.name) : 'Official Holiday';
    toast(LANG === 'kh' ? `ថ្ងៃនេះជាថ្ងៃឈប់សម្រាកបុណ្យ (${name}) ដែលត្រូវបានរំលង។` : `This date is an official public holiday (${name}) and is blacked out.`, '');
    return;
  }

  const fromEl = document.getElementById('rf-from');
  const toEl = document.getElementById('rf-to');
  if (!fromEl || !toEl) return;

  if (_calActiveTarget === 'from') {
    fromEl.value = isoDate;
    fromEl.dataset.iso = isoDate;
    if (!toEl.value || toEl.value < isoDate) {
      toEl.value = isoDate;
      toEl.dataset.iso = isoDate;
    }
    _calActiveTarget = 'to';
  } else {
    if (fromEl.value && isoDate < fromEl.value) {
      fromEl.value = isoDate;
      fromEl.dataset.iso = isoDate;
      toEl.value = isoDate;
      toEl.dataset.iso = isoDate;
    } else {
      toEl.value = isoDate;
      toEl.dataset.iso = isoDate;
    }
  }

  if (typeof autoSetTo === 'function') autoSetTo();
  if (typeof calcDays === 'function') calcDays();
  if (typeof clearFieldErr === 'function') clearFieldErr();

  renderBuiltInCalendar();
}

// ══════════════════ HR HOLIDAYS MANAGEMENT ══════════════════
let _importedHolidaysPending = [];

function hrGetCambodianHolidaysForYear(year) {
  const y = String(year || (new Date()).getFullYear());
  return [
    { date: `${y}-01-01`, dateISO: `${y}-01-01`, name: 'International New Year', nameKh: 'ទិវាចូលឆ្នាំសកល', type: 'Public Holiday' },
    { date: `${y}-01-07`, dateISO: `${y}-01-07`, name: 'Victory over Genocide Day', nameKh: 'ទិវាជ័យជម្នះលើរបបប្រល័យពូជសាសន៍', type: 'Public Holiday' },
    { date: `${y}-03-08`, dateISO: `${y}-03-08`, name: "International Women's Day", nameKh: 'ទិវានារីអន្តរជាតិ', type: 'Public Holiday' },
    { date: `${y}-04-14`, dateISO: `${y}-04-14`, name: 'Khmer New Year (Day 1)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ ថ្ងៃទី១', type: 'Public Holiday' },
    { date: `${y}-04-15`, dateISO: `${y}-04-15`, name: 'Khmer New Year (Day 2)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ ថ្ងៃទី២', type: 'Public Holiday' },
    { date: `${y}-04-16`, dateISO: `${y}-04-16`, name: 'Khmer New Year (Day 3)', nameKh: 'ពិធីបុណ្យចូលឆ្នាំថ្មីប្រពៃណីជាតិ ថ្ងៃទី៣', type: 'Public Holiday' },
    { date: `${y}-05-01`, dateISO: `${y}-05-01`, name: 'International Labor Day', nameKh: 'ទិវាពលកម្មអន្តរជាតិ', type: 'Public Holiday' },
    { date: `${y}-05-14`, dateISO: `${y}-05-14`, name: "King Sihamoni's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម ព្រះមហាក្សត្រ', type: 'Public Holiday' },
    { date: `${y}-06-18`, dateISO: `${y}-06-18`, name: "Queen Mother's Birthday", nameKh: 'ព្រះរាជពិធីបុណ្យចម្រើនព្រះជន្ម សម្តេចម៉ែ', type: 'Public Holiday' },
    { date: `${y}-09-24`, dateISO: `${y}-09-24`, name: 'Constitutional Day', nameKh: 'ទិវាប្រកាសរដ្ឋធម្មនុញ្ញ', type: 'Public Holiday' },
    { date: `${y}-10-29`, dateISO: `${y}-10-29`, name: "King's Coronation Day", nameKh: 'ព្រះរាជពិធីគ្រងព្រះបរមរាជសម្បត្តិ', type: 'Public Holiday' },
    { date: `${y}-11-09`, dateISO: `${y}-11-09`, name: 'National Independence Day', nameKh: 'ទិវាបុណ្យឯករាជ្យជាតិ', type: 'Public Holiday' }
  ];
}

function hrPopulateHolidayYearDropdown(preferredYear) {
  const yrSel = document.getElementById('hol-filter-year');
  if (!yrSel) return;

  const currentYr = (new Date()).getFullYear();
  const existingYears = new Set();

  (_holidaysList || []).forEach(h => {
    const y = parseInt((h.date || h.dateISO || '').slice(0, 4), 10);
    if (!isNaN(y)) existingYears.add(y);
  });

  for (let y = currentYr - 2; y <= currentYr + 8; y++) {
    existingYears.add(y);
  }

  const sortedYears = Array.from(existingYears).sort((a, b) => a - b);
  const activeVal = (preferredYear !== undefined && preferredYear !== null) ? preferredYear : (yrSel.value || String(currentYr));

  let html = '<option value="">All Years</option>';
  sortedYears.forEach(y => {
    const strY = String(y);
    const sel = (strY === activeVal) ? ' selected' : '';
    html += `<option value="${strY}"${sel}>${strY}</option>`;
  });

  yrSel.innerHTML = html;
}

function hrRenderHolidays() {
  const filterEl = document.getElementById('hol-filter-year');
  const tbody = document.getElementById('hol-tbody');
  const nodata = document.getElementById('hol-nodata');
  const badge = document.getElementById('hol-count-badge');
  if (!tbody) return;

  if (filterEl && (filterEl.options.length <= 1 || !filterEl.value)) {
    const defaultYr = String((new Date()).getFullYear());
    hrPopulateHolidayYearDropdown(filterEl.value || defaultYr);
  }

  const filterYear = filterEl ? filterEl.value : '';

  const list = (_holidaysList || []).filter(h => {
    if (!filterYear) return true;
    const y = (h.date || h.dateISO || '').slice(0, 4);
    return y === filterYear;
  }).sort((a, b) => (a.date || a.dateISO || '').localeCompare(b.date || b.dateISO || ''));

  if (badge) {
    badge.textContent = `${list.length} ${list.length === 1 ? 'Holiday' : 'Holidays'}${filterYear ? ' (' + filterYear + ')' : ''}`;
  }

  if (list.length === 0) {
    tbody.innerHTML = '';
    if (nodata) nodata.style.display = 'block';
    return;
  }
  if (nodata) nodata.style.display = 'none';

  const todayIso = (new Date()).toISOString().slice(0, 10);
  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  tbody.innerHTML = list.map(h => {
    const iso = h.date || h.dateISO || '';
    const dt = new Date(iso + 'T00:00:00');
    const dayOfWeek = !isNaN(dt.getTime()) ? dayNamesEn[dt.getDay()] : '—';
    const isPast = iso < todayIso;
    const isToday = iso === todayIso;
    const statusBadge = isToday
      ? `<span class="badge b-pending" style="font-size:10px;padding:2px 7px;background:rgba(234,179,8,.15);color:#ca8a04;border:1px solid rgba(234,179,8,.3)">Today</span>`
      : isPast
      ? `<span class="badge" style="font-size:10px;padding:2px 7px;background:var(--surface2);color:var(--txt3)">Past</span>`
      : `<span class="badge b-approved" style="font-size:10px;padding:2px 7px">Upcoming</span>`;

    return `
      <tr>
        <td style="font-family:monospace;font-weight:600;color:var(--txt);font-size:12.5px">${fmtDate(iso)}</td>
        <td style="color:var(--txt2);font-size:12px">${dayOfWeek}</td>
        <td style="font-weight:600;color:var(--txt)">${h.name || '—'}</td>
        <td style="color:var(--txt2);font-family:inherit">${h.nameKh || h.nameKhmer || '—'}</td>
        <td><span class="badge" style="background:rgba(59,130,246,.1);color:#2563eb;border:1px solid rgba(59,130,246,.2);font-size:11px">${h.type || 'Public Holiday'}</span></td>
        <td style="text-align:center">${statusBadge}</td>
        <td style="text-align:center">
          <button type="button" class="btn btn-sm btn-r" onclick="hrDeleteHoliday('${iso}', '${(h.name || '').replace(/'/g, "\\'")}')" style="padding:4px 8px;font-size:11px;display:inline-flex;align-items:center;gap:4px" title="Remove Holiday">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
            <span>Delete</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function hrAddHoliday() {
  const dateEl = document.getElementById('hol-in-date');
  const nameEl = document.getElementById('hol-in-name');
  const nameKhEl = document.getElementById('hol-in-namekh');
  const typeEl = document.getElementById('hol-in-type');
  const btn = document.getElementById('hol-add-btn');

  if (!dateEl || !nameEl) return;
  const date = dateEl.value;
  const name = nameEl.value.trim();
  const nameKh = nameKhEl ? nameKhEl.value.trim() : '';
  const type = typeEl ? typeEl.value : 'Public Holiday';

  if (!date || !name) {
    toast(LANG === 'kh' ? 'សូមជ្រើសរើសថ្ងៃ និងបញ្ចូលឈ្មោះបុណ្យ' : 'Please select date and enter holiday name.', 'bad');
    return;
  }

  const existingIdx = _holidaysList.findIndex(h => (h.date === date || h.dateISO === date));
  const newHol = { date: date, dateISO: date, name: name, nameKh: nameKh, type: type };

  if (existingIdx >= 0) {
    _holidaysList[existingIdx] = newHol;
  } else {
    _holidaysList.push(newHol);
  }
  _holidaysList.sort((a, b) => (a.date || a.dateISO).localeCompare(b.date || b.dateISO));
  saveHolidaysCache(_holidaysList);
  
  const yr = date.slice(0, 4);
  if (yr) hrPopulateHolidayYearDropdown(yr);
  
  hrRenderHolidays();
  if (typeof renderBuiltInCalendar === 'function') renderBuiltInCalendar();

  nameEl.value = '';
  if (nameKhEl) nameKhEl.value = '';

  const syncStatus = document.getElementById('hol-sync-status');
  if (syncStatus) {
    syncStatus.textContent = 'Syncing to Google Sheet...';
    syncStatus.style.background = 'rgba(234,179,8,.15)';
    syncStatus.style.color = '#ca8a04';
  }

  if (btn) btn.disabled = true;

  try {
    const res = await apiHR('addHoliday', {
      date: date,
      name: name,
      nameKh: nameKh,
      type: type
    });
    if (res && res.result === 'success' && Array.isArray(res.holidays)) {
      saveHolidaysCache(res.holidays);
      hrRenderHolidays();
      if (typeof renderBuiltInCalendar === 'function') renderBuiltInCalendar();
    }
    toast(LANG === 'kh' ? 'បានរក្សាទុកថ្ងៃបុណ្យជោគជ័យ' : `Holiday "${name}" saved and synced to Google Sheets!`, 'good');
    if (syncStatus) {
      syncStatus.textContent = 'Synced with Sheets';
      syncStatus.style.background = 'rgba(22,163,74,.1)';
      syncStatus.style.color = 'var(--ok)';
    }
  } catch (e) {
    console.error('Error adding holiday:', e);
    toast('Holiday saved locally, will sync on next refresh.', '');
  } finally {
    if (btn) btn.disabled = false;
  }
}

async function hrDeleteHoliday(date, name) {
  if (!confirm(`Are you sure you want to delete holiday: ${name} (${date})?`)) return;

  _holidaysList = _holidaysList.filter(h => (h.date !== date && h.dateISO !== date));
  saveHolidaysCache(_holidaysList);
  hrRenderHolidays();
  if (typeof renderBuiltInCalendar === 'function') renderBuiltInCalendar();

  try {
    const res = await apiHR('deleteHoliday', { date: date, name: name });
    if (res && res.result === 'success' && Array.isArray(res.holidays)) {
      saveHolidaysCache(res.holidays);
      hrRenderHolidays();
    }
    toast(LANG === 'kh' ? 'បានលុបថ្ងៃបុណ្យជោគជ័យ' : `Deleted holiday ${name} from Google Sheets.`, 'good');
  } catch (e) {
    console.error('Error deleting holiday:', e);
    toast('Deleted locally.', '');
  }
}

async function hrResetDefaultHolidays() {
  const filterEl = document.getElementById('hol-filter-year');
  const targetYear = (filterEl && filterEl.value) ? filterEl.value : String((new Date()).getFullYear());

  if (!confirm(`This will load official Cambodian public holidays defaults for Year ${targetYear} into your list and sync to Google Sheets. Continue?`)) return;

  const yearHols = hrGetCambodianHolidaysForYear(targetYear);

  try {
    const res = await apiHR('importHolidays', {
      holidays: JSON.stringify(yearHols),
      mode: 'replace_year',
      year: targetYear
    });
    if (res && res.result === 'success' && Array.isArray(res.holidays)) {
      saveHolidaysCache(res.holidays);
      hrRenderHolidays();
      if (typeof renderBuiltInCalendar === 'function') renderBuiltInCalendar();
      toast(`Official Cambodian holidays for ${targetYear} loaded & synced to Google Sheets!`, 'good');
    }
  } catch (e) {
    console.error('Error resetting holidays:', e);
    toast('Could not sync default holidays to server.', 'bad');
  }
}

async function hrSyncHolidaysFromSheet() {
  const syncStatus = document.getElementById('hol-sync-status');
  if (syncStatus) syncStatus.textContent = 'Fetching from Sheet...';
  try {
    const res = await apiHR('getHolidays', {});
    if (res && res.result === 'success' && Array.isArray(res.holidays)) {
      saveHolidaysCache(res.holidays);
      hrPopulateHolidayYearDropdown();
      hrRenderHolidays();
      if (typeof renderBuiltInCalendar === 'function') renderBuiltInCalendar();
      toast('Holidays synchronized from Google Sheets!', 'good');
    }
  } catch (e) {
    console.error('Error syncing holidays:', e);
    toast('Could not sync holidays from server.', 'bad');
  } finally {
    if (syncStatus) {
      syncStatus.textContent = 'Synced with Sheets';
      syncStatus.style.background = 'rgba(22,163,74,.1)';
      syncStatus.style.color = 'var(--ok)';
    }
  }
}

// ── Export Template Logic ──
function hrOpenHolidayExportModal() {
  const modal = document.getElementById('hr-hol-export-modal');
  if (!modal) return;

  const curYear = (new Date()).getFullYear();
  const filterEl = document.getElementById('hol-filter-year');
  const activeYear = (filterEl && filterEl.value) ? filterEl.value : String(curYear);

  const sel = document.getElementById('hol-exp-year-select');
  if (sel) {
    const years = new Set();
    (_holidaysList || []).forEach(h => {
      const y = parseInt((h.date || h.dateISO || '').slice(0, 4), 10);
      if (!isNaN(y)) years.add(y);
    });
    for (let y = curYear - 1; y <= curYear + 10; y++) years.add(y);
    const sorted = Array.from(years).sort((a, b) => a - b);
    sel.innerHTML = sorted.map(y => `<option value="${y}"${String(y) === activeYear ? ' selected' : ''}>${y}</option>`).join('');
  }

  modal.style.display = 'flex';
}

function hrCloseHolidayExportModal() {
  const modal = document.getElementById('hr-hol-export-modal');
  if (modal) modal.style.display = 'none';
}

function hrDownloadHolidayTemplate() {
  const yearSel = document.getElementById('hol-exp-year-select');
  const targetYear = yearSel ? yearSel.value : String((new Date()).getFullYear());
  const typeRad = document.querySelector('input[name="hol-exp-type"]:checked');
  const expType = typeRad ? typeRad.value : 'standard';

  let rows = [];
  if (expType === 'blank') {
    rows = [
      { date: `${targetYear}-01-01`, name: 'Sample Holiday (English)', nameKh: 'ឈ្មោះបុណ្យជាភាសាខ្មែរ', type: 'Public Holiday' },
      { date: `${targetYear}-04-14`, name: 'Company Anniversary', nameKh: 'ទិវាបុណ្យក្រុមហ៊ុន', type: 'Company Holiday' }
    ];
  } else if (expType === 'current') {
    rows = (_holidaysList || []).filter(h => {
      const y = (h.date || h.dateISO || '').slice(0, 4);
      return y === targetYear;
    });
    if (rows.length === 0) {
      rows = hrGetCambodianHolidaysForYear(targetYear);
    }
  } else {
    rows = hrGetCambodianHolidaysForYear(targetYear);
  }

  let csvContent = '\uFEFFDate,Holiday Name (English),Holiday Name (Khmer),Type\r\n';
  rows.forEach(r => {
    const d = r.date || r.dateISO || '';
    const n = `"${(r.name || '').replace(/"/g, '""')}"`;
    const nKh = `"${(r.nameKh || r.nameKhmer || '').replace(/"/g, '""')}"`;
    const t = `"${(r.type || 'Public Holiday').replace(/"/g, '""')}"`;
    csvContent += `${d},${n},${nKh},${t}\r\n`;
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `Holiday_Template_${targetYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  hrCloseHolidayExportModal();
  toast(LANG === 'kh' ? `បានទាញយក Template ថ្ងៃបុណ្យឆ្នាំ ${targetYear}` : `Holiday template for year ${targetYear} downloaded successfully!`, 'good');
}

// ── Import & Translate Logic ──
function hrOpenHolidayImportModal() {
  const modal = document.getElementById('hr-hol-import-modal');
  if (!modal) return;

  _importedHolidaysPending = [];
  const fileIn = document.getElementById('hol-imp-file');
  if (fileIn) fileIn.value = '';
  const pasteArea = document.getElementById('hol-imp-paste');
  if (pasteArea) pasteArea.value = '';
  const previewCard = document.getElementById('hol-imp-preview-card');
  if (previewCard) previewCard.style.display = 'none';
  const saveBtn = document.getElementById('hol-imp-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="15" x2="12" y2="15"></line></svg>
      <span>Upload & Save to Sheet</span>
    `;
  }
  const summaryEl = document.getElementById('hol-imp-summary');
  if (summaryEl) summaryEl.innerHTML = '';

  modal.style.display = 'flex';
}

function hrCloseHolidayImportModal() {
  const modal = document.getElementById('hr-hol-import-modal');
  if (modal) modal.style.display = 'none';
  _importedHolidaysPending = [];
}

function hrNormalizeDateToISO(raw) {
  if (!raw) return '';
  let s = String(raw).trim();
  const khmerDigits = ['០','១','២','៣','៤','៥','៦','៧','៨','៩'];
  khmerDigits.forEach((kd, idx) => {
    s = s.split(kd).join(String(idx));
  });

  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(s)) {
    const p = s.split('-');
    return `${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`;
  }
  if (/^\d{4}[\/\.]\d{1,2}[\/\.]\d{1,2}$/.test(s)) {
    const p = s.split(/[\/\.]/);
    return `${p[0]}-${p[1].padStart(2, '0')}-${p[2].padStart(2, '0')}`;
  }
  const dmyMatch = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }
  const textMatch = s.match(/^(\d{1,2})[-\s/]([A-Za-z]{3,9})[-\s/](\d{4})/);
  if (textMatch) {
    const d = textMatch[1].padStart(2, '0');
    const mNames = {jan:'01',feb:'02',mar:'03',apr:'04',may:'05',jun:'06',jul:'07',aug:'08',sep:'09',oct:'10',nov:'11',dec:'12'};
    const mKey = textMatch[2].toLowerCase().slice(0, 3);
    const m = mNames[mKey] || '01';
    const y = textMatch[3];
    return `${y}-${m}-${d}`;
  }
  const dt = new Date(s);
  if (!isNaN(dt.getTime()) && dt.getFullYear() > 2000 && dt.getFullYear() < 2100) {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, '0');
    const d = String(dt.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return '';
}

function hrParseCSVLines(text) {
  const lines = [];
  let curLine = [];
  let curVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    const nextCh = text[i + 1];

    if (inQuotes) {
      if (ch === '"') {
        if (nextCh === '"') {
          curVal += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        curVal += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',' || ch === '\t' || ch === ';') {
        curLine.push(curVal.trim());
        curVal = '';
      } else if (ch === '\r') {
        // Skip
      } else if (ch === '\n') {
        curLine.push(curVal.trim());
        if (curLine.some(c => c.length > 0)) {
          lines.push(curLine);
        }
        curLine = [];
        curVal = '';
      } else {
        curVal += ch;
      }
    }
  }

  if (curVal.length > 0 || curLine.length > 0) {
    curLine.push(curVal.trim());
    if (curLine.some(c => c.length > 0)) {
      lines.push(curLine);
    }
  }

  return lines;
}

function hrProcessHolidayImportText(rawText) {
  if (!rawText || !rawText.trim()) {
    toast('No holiday content provided.', 'bad');
    return;
  }

  const rawLines = hrParseCSVLines(rawText.replace(/^\uFEFF/, ''));
  if (rawLines.length === 0) {
    toast('File appears to be empty.', 'bad');
    return;
  }

  let startIdx = 0;
  let dateCol = 0, nameCol = 1, nameKhCol = 2, typeCol = 3;
  const firstRow = rawLines[0].map(c => c.toLowerCase().replace(/[^a-z0-9]/g, ''));

  const hasHeader = firstRow.some(c => ['date', 'holiday', 'name', 'day', 'title', 'khmer'].includes(c));
  if (hasHeader) {
    startIdx = 1;
    firstRow.forEach((c, idx) => {
      if (['date', 'holidaydate', 'day'].includes(c)) dateCol = idx;
      else if (['holidayname', 'name', 'holiday', 'title', 'event', 'english'].includes(c)) nameCol = idx;
      else if (['holidaynamekhmer', 'namekhmer', 'namekh', 'khmer', 'khmername'].includes(c)) nameKhCol = idx;
      else if (['type', 'category', 'holidaytype'].includes(c)) typeCol = idx;
    });
  }

  const parsed = [];
  const invalidRows = [];
  const yearsFound = new Set();
  const dayNamesEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  for (let r = startIdx; r < rawLines.length; r++) {
    const row = rawLines[r];
    if (!row || row.length === 0 || row.every(c => !c)) continue;

    const rawDate = row[dateCol] || row[0] || '';
    const isoDate = hrNormalizeDateToISO(rawDate);
    const name = row[nameCol] || (dateCol !== 1 ? row[1] : '') || 'Public Holiday';
    const nameKh = row[nameKhCol] || (row.length > 2 ? row[2] : '') || '';
    let type = row[typeCol] || 'Public Holiday';
    if (!type || type.length < 2) type = 'Public Holiday';

    if (isoDate) {
      const dt = new Date(isoDate + 'T00:00:00');
      const dayName = !isNaN(dt.getTime()) ? dayNamesEn[dt.getDay()] : '—';
      const year = isoDate.slice(0, 4);
      yearsFound.add(year);

      parsed.push({
        date: isoDate,
        dateISO: isoDate,
        dayOfWeek: dayName,
        name: name,
        nameKh: nameKh,
        type: type,
        year: year
      });
    } else {
      invalidRows.push(`Row ${r + 1}: Could not parse date "${rawDate}"`);
    }
  }

  if (parsed.length === 0) {
    toast('No valid holiday dates could be extracted. Please check format (YYYY-MM-DD or DD/MM/YYYY).', 'bad');
    return;
  }

  const uniqueMap = new Map();
  parsed.forEach(p => uniqueMap.set(p.date, p));
  _importedHolidaysPending = Array.from(uniqueMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  hrRenderHolidayImportPreview(yearsFound, invalidRows);
}

function hrRenderHolidayImportPreview(yearsFound, invalidRows) {
  const previewCard = document.getElementById('hol-imp-preview-card');
  const tbody = document.getElementById('hol-imp-tbody');
  const summaryEl = document.getElementById('hol-imp-summary');
  const saveBtn = document.getElementById('hol-imp-save-btn');
  const stratSel = document.getElementById('hol-imp-strat-select');
  if (!previewCard || !tbody) return;

  previewCard.style.display = 'block';

  const yearsArr = Array.from(yearsFound).sort();
  const primaryYear = yearsArr[0] || (new Date()).getFullYear();

  if (stratSel) {
    if (yearsArr.length === 1) {
      stratSel.innerHTML = `
        <option value="replace_year">Replace all holidays for Year ${primaryYear} (Recommended - preserves other years)</option>
        <option value="merge">Merge & Upsert into Sheet (Updates matching dates, adds new)</option>
        <option value="replace_all">Replace entire Holidays Sheet</option>
      `;
    } else {
      stratSel.innerHTML = `
        <option value="replace_year">Replace holidays for detected years (${yearsArr.join(', ')})</option>
        <option value="merge">Merge & Upsert into Sheet (Updates matching dates, adds new)</option>
        <option value="replace_all">Replace entire Holidays Sheet</option>
      `;
    }
  }

  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;font-size:12px;color:var(--txt)">
        <span class="badge b-approved" style="padding:4px 9px;font-size:11.5px;font-weight:600">
          ${_importedHolidaysPending.length} Holidays Translated
        </span>
        <span class="badge" style="background:rgba(59,130,246,.1);color:#2563eb;border:1px solid rgba(59,130,246,.2);padding:4px 9px;font-size:11.5px">
          Year(s): ${yearsArr.join(', ')}
        </span>
        ${invalidRows && invalidRows.length > 0 ? `<span class="badge b-rejected" style="padding:4px 9px;font-size:11.5px">${invalidRows.length} Skipped</span>` : ''}
      </div>
    `;
  }

  tbody.innerHTML = _importedHolidaysPending.map((h, idx) => `
    <tr>
      <td style="font-family:monospace;font-weight:600;font-size:12px;color:var(--txt)">${h.date}</td>
      <td style="color:var(--txt2);font-size:11.5px">${h.dayOfWeek}</td>
      <td style="font-weight:600;color:var(--txt);font-size:12px">${h.name}</td>
      <td style="color:var(--txt2);font-size:12px">${h.nameKh || '—'}</td>
      <td><span class="badge" style="font-size:10.5px;padding:2px 6px;background:rgba(59,130,246,.1);color:#2563eb">${h.type}</span></td>
      <td style="text-align:center">
        <button type="button" class="btn btn-sm btn-r" onclick="hrRemovePendingHoliday(${idx})" style="padding:2px 6px;font-size:10px" title="Remove from list">
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </td>
    </tr>
  `).join('');

  if (saveBtn) {
    saveBtn.disabled = false;
  }
}

function hrRemovePendingHoliday(index) {
  if (index >= 0 && index < _importedHolidaysPending.length) {
    _importedHolidaysPending.splice(index, 1);
    const years = new Set(_importedHolidaysPending.map(h => h.year));
    hrRenderHolidayImportPreview(years, []);
    if (_importedHolidaysPending.length === 0) {
      const previewCard = document.getElementById('hol-imp-preview-card');
      if (previewCard) previewCard.style.display = 'none';
      const saveBtn = document.getElementById('hol-imp-save-btn');
      if (saveBtn) saveBtn.disabled = true;
    }
  }
}

function hrHandleHolidayFileUpload(e) {
  const file = e.target.files && e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    const content = evt.target.result;
    hrProcessHolidayImportText(content);
  };
  reader.readAsText(file, 'UTF-8');
}

function hrHandleHolidayPasteProcess() {
  const pasteArea = document.getElementById('hol-imp-paste');
  if (!pasteArea || !pasteArea.value.trim()) {
    toast('Please paste holiday text/table from Excel or Google Sheets first.', 'bad');
    return;
  }
  hrProcessHolidayImportText(pasteArea.value);
}

async function hrSubmitHolidayImport() {
  if (!_importedHolidaysPending || _importedHolidaysPending.length === 0) {
    toast('No holidays ready to upload.', 'bad');
    return;
  }

  const stratSel = document.getElementById('hol-imp-strat-select');
  const mode = stratSel ? stratSel.value : 'replace_year';
  const years = Array.from(new Set(_importedHolidaysPending.map(h => h.year)));
  const targetYear = years.length === 1 ? years[0] : '';

  const saveBtn = document.getElementById('hol-imp-save-btn');
  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `
      <span class="loader" style="width:14px;height:14px;border:2px solid #fff;border-top-color:transparent;border-radius:50%;display:inline-block;animation:spin .6s linear infinite"></span>
      <span>Translating & Saving to Sheet...</span>
    `;
  }

  try {
    const res = await apiHR('importHolidays', {
      holidays: JSON.stringify(_importedHolidaysPending),
      mode: mode,
      year: targetYear
    });

    if (res && res.result === 'success' && Array.isArray(res.holidays)) {
      saveHolidaysCache(res.holidays);
      
      if (targetYear) {
        hrPopulateHolidayYearDropdown(targetYear);
        const filterEl = document.getElementById('hol-filter-year');
        if (filterEl) filterEl.value = targetYear;
      }
      
      hrRenderHolidays();
      if (typeof renderBuiltInCalendar === 'function') renderBuiltInCalendar();
      
      hrCloseHolidayImportModal();
      toast(LANG === 'kh' ? `បានបញ្ចូលថ្ងៃបុណ្យចំនួន ${_importedHolidaysPending.length} ទៅក្នុង Google Sheet ជោគជ័យ!` : `Successfully imported ${_importedHolidaysPending.length} holidays to Google Sheets for whole year use!`, 'good');
    } else {
      throw new Error((res && res.message) || 'Import failed on server');
    }
  } catch (err) {
    console.error('Holiday import error:', err);
    toast('Could not save holidays to server: ' + err.message, 'bad');
  } finally {
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="15" x2="12" y2="15"></line></svg>
        <span>Upload & Save to Sheet</span>
      `;
    }
  }
}

// ══════════════════ KEYBOARD & VIEWPORT ADAPTATION ENGINE ══════════════════

// 1. Date Input Helpers (Keyboard & Touchscreen Numpad)
function getIsoDateVal(id) {
  const el = typeof id === 'string' ? document.getElementById(id) : id;
  if (!el) return '';
  const val = (el.value || el.dataset.iso || '').trim();
  if (!val) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
  // Convert DD/MM/YYYY or DD-MM-YYYY if typed in alternate format
  const dmyMatch = val.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const d = dmyMatch[1].padStart(2, '0');
    const m = dmyMatch[2].padStart(2, '0');
    const y = dmyMatch[3];
    return `${y}-${m}-${d}`;
  }
  return val;
}

function handleDateKeyInput(target, el) {
  let val = el.value.trim();
  // Auto-format clean YYYY-MM-DD as user types pure digits (e.g. 20260815 -> 2026-08-15)
  const digits = val.replace(/\D/g, '');
  if (digits.length === 8 && !val.includes('-') && !val.includes('/')) {
    val = `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6, 8)}`;
    el.value = val;
  }
  
  const iso = getIsoDateVal(el);
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    el.dataset.iso = iso;
    if (target === 'from') {
      const toEl = document.getElementById('rf-to');
      if (toEl && (!toEl.value || toEl.value < iso)) {
        toEl.value = iso;
        toEl.dataset.iso = iso;
      }
    }
    if (typeof calcDays === 'function') calcDays();
    if (typeof clearFieldErr === 'function') clearFieldErr();
  }
}

function formatDateOnBlur(target, el) {
  const iso = getIsoDateVal(el);
  if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    el.value = iso;
    el.dataset.iso = iso;
    if (target === 'from') {
      const toEl = document.getElementById('rf-to');
      if (toEl && (!toEl.value || toEl.value < iso)) {
        toEl.value = iso;
        toEl.dataset.iso = iso;
      }
    }
    if (typeof autoSetTo === 'function') autoSetTo();
    if (typeof calcDays === 'function') calcDays();
  }
}

function autoSetTo() {
  const fromVal = getIsoDateVal('rf-from');
  const toEl = document.getElementById('rf-to');
  if (!toEl) return;
  const toVal = getIsoDateVal('rf-to');
  if (fromVal && (!toVal || toVal < fromVal)) {
    toEl.value = fromVal;
    toEl.dataset.iso = fromVal;
  }
}

function validateToDate() {
  const fromVal = getIsoDateVal('rf-from');
  const toVal = getIsoDateVal('rf-to');
  const toEl = document.getElementById('rf-to');
  if (fromVal && toVal && toVal < fromVal && toEl) {
    toEl.value = fromVal;
    toEl.dataset.iso = fromVal;
  }
}

// 2. Staff Search Keyboard Navigation (ArrowUp/ArrowDown/Enter/Escape)
function handleStaffKeyNav(e, inputId, listId, verifyFn) {
  const listEl = document.getElementById(listId);
  if (!listEl || listEl.style.display === 'none') {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (typeof verifyFn === 'function') verifyFn();
    }
    return;
  }
  const items = Array.from(listEl.querySelectorAll('.staff-dd-item'));
  if (!items.length) return;
  
  let currentIdx = items.findIndex(el => el.classList.contains('active-dd'));
  
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (currentIdx >= 0) items[currentIdx].classList.remove('active-dd');
    currentIdx = (currentIdx + 1) % items.length;
    items[currentIdx].classList.add('active-dd');
    items[currentIdx].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (currentIdx >= 0) items[currentIdx].classList.remove('active-dd');
    currentIdx = (currentIdx - 1 + items.length) % items.length;
    items[currentIdx].classList.add('active-dd');
    items[currentIdx].scrollIntoView({ block: 'nearest' });
  } else if (e.key === 'Enter') {
    e.preventDefault();
    if (currentIdx >= 0 && items[currentIdx]) {
      items[currentIdx].click();
    } else if (items.length > 0) {
      items[0].click();
    }
    if (typeof verifyFn === 'function') {
      setTimeout(() => verifyFn(), 50);
    }
  } else if (e.key === 'Escape') {
    listEl.style.display = 'none';
  }
}

// Attach keyboard navigation to staff gate inputs
document.addEventListener('DOMContentLoaded', () => {
  const rInput = document.getElementById('r-name-input');
  if (rInput) rInput.addEventListener('keydown', (e) => handleStaffKeyNav(e, 'r-name-input', 'r-list', rVerify));
  
  const ntInput = document.getElementById('nt-name-input');
  if (ntInput) ntInput.addEventListener('keydown', (e) => handleStaffKeyNav(e, 'nt-name-input', 'nt-list', ntVerify));
  
  const stInput = document.getElementById('st-name-input');
  if (stInput) stInput.addEventListener('keydown', (e) => handleStaffKeyNav(e, 'st-name-input', 'st-list', stVerify));
});

// 3. Virtual Keyboard Visibility & Auto-Scroll (No Block on Smartphone/Tablet)
if (window.visualViewport) {
  const handleViewportChange = () => {
    const vh = window.visualViewport.height;
    const wh = window.innerHeight;
    const diff = wh - vh;
    if (diff > 120) {
      document.body.classList.add('keyboard-open');
      document.documentElement.style.setProperty('--kb-height', `${diff}px`);
      const activeEl = document.activeElement;
      if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.tagName === 'SELECT')) {
        setTimeout(() => {
          activeEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
        }, 80);
      }
    } else {
      document.body.classList.remove('keyboard-open');
      document.documentElement.style.setProperty('--kb-height', '0px');
    }
  };
  window.visualViewport.addEventListener('resize', handleViewportChange);
  window.visualViewport.addEventListener('scroll', handleViewportChange);
}

// Auto-scroll input into view on touch/focus so keyboard never blocks info
window.addEventListener('focusin', (e) => {
  const target = e.target;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
    setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
    }, 150);
  }
}, true);

// 4. Calendar Modal Keyboard Navigation (Laptop/PC & Built-in Keyboards)
document.addEventListener('keydown', (e) => {
  const calModal = document.getElementById('cal-modal');
  if (!calModal || calModal.style.display === 'none') return;
  
  if (e.key === 'Escape') {
    e.preventDefault();
    closeCalModal();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    calNavMonth(-1);
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    calNavMonth(1);
  } else if (e.key === 'Enter') {
    e.preventDefault();
    confirmCalModal();
  }
});

// ═══════════════════════════════════════════════════════
// GUIDED INTERACTIVE SPOTLIGHT TOUR ENGINE (BORDERLESS & SILENT)
// ═══════════════════════════════════════════════════════
const TOUR_STEPS = [
  { targetId: 'rsc-dates' },
  { targetId: 'rsc-type' },
  { targetId: 'rsc-reason' }
];

let _currentTourStep = 0;
let _tourActive = false;
let _tourAdvancingTimeout = null;

function startGuidedTour(force = false) {
  const reqForm = document.getElementById('req-form');
  const reqView = document.getElementById('v-request');
  if (!reqForm || reqForm.style.display === 'none' || !reqView || !reqView.classList.contains('active')) {
    return;
  }
  
  const overlay = document.getElementById('guided-tour-overlay');
  if (!overlay) return;

  const prevBtn = document.getElementById('r-prev-btn');
  if (prevBtn) prevBtn.classList.remove('btn-continue-glowing');

  _tourActive = true;
  _currentTourStep = 0;

  overlay.style.display = 'block';
  
  requestAnimationFrame(() => {
    overlay.classList.add('active');
    renderTourStep(0);
  });

  _attachTourInteractiveListeners();
  window.addEventListener('resize', _tourOnResize);
  window.addEventListener('scroll', _tourOnResize, true);
  document.addEventListener('keydown', _tourOnKeyDown);
}

function _attachTourInteractiveListeners() {
  const fromEl = document.getElementById('rf-from');
  const toEl = document.getElementById('rf-to');
  if (fromEl) fromEl.addEventListener('change', () => tourNotifyAction('date'), { passive: true });
  if (toEl) toEl.addEventListener('change', () => tourNotifyAction('date'), { passive: true });

  const rsnEl = document.getElementById('rf-rsn');
  if (rsnEl) {
    rsnEl.addEventListener('input', () => {
      if (_tourActive) {
        closeGuidedTour(true);
      }
    });
    rsnEl.addEventListener('keydown', (e) => {
      if (_tourActive && e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        closeGuidedTour(true);
      }
    });
  }
}

function renderTourStep(idx) {
  if (!_tourActive || idx < 0 || idx >= TOUR_STEPS.length) return;
  _currentTourStep = idx;
  const step = TOUR_STEPS[idx];

  // Remove active target class from all cards
  document.querySelectorAll('.req-section-card').forEach(c => c.classList.remove('tour-active-target'));

  const target = document.getElementById(step.targetId);
  if (!target) return;

  // Elevate active card above dark backdrop so user can interact with it directly
  target.classList.add('tour-active-target');
  target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });

  const rect = target.getBoundingClientRect();
  const pad = 4;
  const x = Math.max(0, rect.left - pad);
  const y = Math.max(0, rect.top - pad);
  const w = rect.width + pad * 2;
  const h = rect.height + pad * 2;

  // Update SVG Mask Cutout (smooth, seamless rectangular cutout without borders)
  const cutout = document.getElementById('tour-cutout');
  if (cutout) {
    cutout.setAttribute('x', x);
    cutout.setAttribute('y', y);
    cutout.setAttribute('width', w);
    cutout.setAttribute('height', h);
    cutout.setAttribute('rx', '14');
    cutout.setAttribute('ry', '14');
  }

  // Auto-focus interactive field if in step 2 (Reason)
  if (idx === 2) {
    setTimeout(() => {
      const rsn = document.getElementById('rf-rsn');
      if (rsn) rsn.focus();
    }, 200);
  }
}

function tourNotifyAction(actionType) {
  if (!_tourActive) return;

  if (actionType === 'date' && _currentTourStep === 0) {
    if (_tourAdvancingTimeout) clearTimeout(_tourAdvancingTimeout);
    _tourAdvancingTimeout = setTimeout(() => {
      if (_tourActive && _currentTourStep === 0) {
        nextTourStep();
      }
    }, 450);
  } else if (actionType === 'type' && _currentTourStep === 1) {
    if (_tourAdvancingTimeout) clearTimeout(_tourAdvancingTimeout);
    _tourAdvancingTimeout = setTimeout(() => {
      if (_tourActive && _currentTourStep === 1) {
        nextTourStep();
      }
    }, 380);
  } else if (actionType === 'reason') {
    closeGuidedTour(true);
  }
}

function nextTourStep() {
  if (!_tourActive) return;
  if (_currentTourStep < TOUR_STEPS.length - 1) {
    renderTourStep(_currentTourStep + 1);
  } else {
    closeGuidedTour(true);
  }
}

function prevTourStep() {
  if (!_tourActive) return;
  if (_currentTourStep > 0) {
    renderTourStep(_currentTourStep - 1);
  }
}

function closeGuidedTour(completed = false) {
  if (_tourAdvancingTimeout) clearTimeout(_tourAdvancingTimeout);

  document.querySelectorAll('.req-section-card').forEach(c => c.classList.remove('tour-active-target'));

  const overlay = document.getElementById('guided-tour-overlay');
  if (overlay) {
    overlay.classList.remove('active');
    setTimeout(() => {
      overlay.style.display = 'none';
    }, 350);
  }
  _tourActive = false;
  window.removeEventListener('resize', _tourOnResize);
  window.removeEventListener('scroll', _tourOnResize, true);
  document.removeEventListener('keydown', _tourOnKeyDown);

  // When all steps are done or completed, add continuous glowing motion to the Continue button
  const continueBtn = document.getElementById('r-prev-btn');
  if (continueBtn) {
    continueBtn.classList.add('btn-continue-glowing');
    setTimeout(() => {
      continueBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }, 250);
  }
}

function _tourOnResize() {
  if (_tourActive) {
    renderTourStep(_currentTourStep);
  }
}

function _tourOnKeyDown(e) {
  if (!_tourActive) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeGuidedTour();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    nextTourStep();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    prevTourStep();
  }
}
