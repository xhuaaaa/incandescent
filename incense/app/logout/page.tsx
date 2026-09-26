'use client';
import {useState} from 'react';
import Frame from '../frame';
import {useLanguage} from '../i18n';
import {browserAuth} from '@/lib/supabase-browser';
export default function LogoutPage(){const {t}=useLanguage();const [busy,setBusy]=useState(false),[error,setError]=useState(false);async function logout(){setBusy(true);setError(false);try{const auth=browserAuth();if(auth){const {error}=await auth.auth.signOut({scope:'local'});if(error)throw error;}window.location.assign('/');}catch{setError(true);setBusy(false)}}return <Frame title={t('登出')} kicker="HOA MEMBERS"><button className="primary" onClick={logout} disabled={busy}>{t(busy?'處理中…':'確認登出')}</button>{error&&<p role="alert">{t('無法連線，請重新整理。')}</p>}</Frame>}
