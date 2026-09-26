'use client';
import {useEffect,useState} from 'react';
import Frame from '../frame';
import {useLanguage} from '../i18n';
import {browserAuth} from '@/lib/supabase-browser';
import {Tabs,TabsList,TabsTrigger} from '@/components/ui/tabs';
export default function LoginPage(){
 const {t}=useLanguage();const [mode,setMode]=useState('signin'),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState<boolean|null>(null),[returnTo,setReturnTo]=useState('/account');
 useEffect(()=>{const auth=browserAuth();setReady(Boolean(auth));const target=new URLSearchParams(window.location.search).get('returnTo');if(target&&['/shop','/account','/community'].includes(target))setReturnTo(target);},[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();const auth=browserAuth();if(!auth)return;setBusy(true);setMessage('');
  const form=new FormData(e.currentTarget),email=String(form.get('email')||''),password=String(form.get('password')||'');
  try{
   if(mode==='signup'){
    const {data,error}=await auth.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+'/login',data:{name:String(form.get('name')||'')}}});
    if(error){setMessage('註冊未完成，請確認資料或稍後重試。');return;}
    if(data.session)window.location.assign(returnTo);else setMessage('請到信箱開啟確認信，再回來登入。');
   }else{
    const {error}=await auth.auth.signInWithPassword({email,password});
    if(error){setMessage('登入失敗，請確認信箱、密碼及信箱驗證狀態。');return;}
    window.location.assign(returnTo);
   }
  }catch{setMessage('無法連線，請重新整理。')}finally{setBusy(false)}
 }
 return <Frame title={t('會員登入')} kicker="HOA MEMBERS"><div className="panel" style={{maxWidth:560,margin:'0 auto'}}>
  {ready===null?<p>{t('正在載入會員資料…')}</p>:!ready?<p role="status">{t('會員服務尚未啟用，請稍後再試。')}</p>:<>
   <Tabs value={mode} onValueChange={value=>{setMode(value);setMessage('')}}><TabsList><TabsTrigger value="signin">{t('登入')}</TabsTrigger><TabsTrigger value="signup">{t('註冊會員')}</TabsTrigger></TabsList></Tabs>
   <form onSubmit={submit}>
    {mode==='signup'&&<><label htmlFor="auth-name">{t('姓名')}</label><input id="auth-name" name="name" required maxLength={60} autoComplete="name"/></>}
    <label htmlFor="auth-email">{t('電子郵件')}</label><input id="auth-email" name="email" type="email" required maxLength={254} autoComplete="email"/>
    <label htmlFor="auth-password">{t('密碼（至少 8 個字元）')}</label><input id="auth-password" name="password" type="password" required minLength={8} maxLength={128} autoComplete={mode==='signup'?'new-password':'current-password'}/>
    <p className="muted">{t('使用電子郵件建立會員，保存資料與測試訂單。')}</p>
    <button className="primary" disabled={busy}>{t(busy?'處理中…':mode==='signup'?'註冊會員':'登入')}</button>
   </form>
  </>}
  <p role="status">{t(message)}</p>
 </div></Frame>;
}
