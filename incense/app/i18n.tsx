'use client';
import {createContext,useCallback,useContext,useEffect,useMemo,useState} from 'react';
import translations from './vi.json';
export type Locale='zh-Hant'|'vi';
type LanguageContextValue={locale:Locale;setLocale:(locale:Locale)=>void;t:(text:string)=>string};
const LanguageContext=createContext<LanguageContextValue|null>(null);
const vi:Record<string,string>=translations;
export function LanguageProvider({children,initialLocale}:{children:React.ReactNode;initialLocale:Locale}){
  const [locale,setLocaleState]=useState<Locale>(initialLocale);
  const setLocale=useCallback((next:Locale)=>{
    setLocaleState(next);
    document.cookie=`hoa-language=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol==='https:'?'; Secure':''}`;
    try{localStorage.setItem('hoa-language',next)}catch{/* Cookies still retain the preference when storage is unavailable. */}
  },[]);
  useEffect(()=>{
    const onStorage=(event:StorageEvent)=>{if(event.key==='hoa-language'&&(event.newValue==='vi'||event.newValue==='zh-Hant'))setLocaleState(event.newValue)};
    window.addEventListener('storage',onStorage);
    return()=>window.removeEventListener('storage',onStorage);
  },[]);
  useEffect(()=>{
    document.documentElement.lang=locale;
    document.title=locale==='vi'?'Hoa | Một làn hương, trọn tấm lòng.':'Hoa｜一縷香，一份心意';
    const description=document.querySelector('meta[name="description"]');
    description?.setAttribute('content',locale==='vi'?'Khám phá hương lễ Phật, nghề làm hương và chọn hương cho cuộc sống hằng ngày.':'探索寺廟用香與製香工藝，挑選屬於日常的香氣。');
  },[locale]);
  const t=useCallback((text:string)=>locale==='vi'?(vi[text]??text):text,[locale]);
  const value=useMemo(()=>({locale,setLocale,t}),[locale,setLocale,t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export function useLanguage(){const value=useContext(LanguageContext);if(!value)throw new Error('LanguageProvider is required');return value;}
export function LanguageSwitcher(){const {locale,setLocale}=useLanguage();return <div className="language-switch" role="group" aria-label={locale==='vi'?'Ngôn ngữ':'語言'}><button type="button" lang="zh-Hant" aria-pressed={locale==='zh-Hant'} onClick={()=>setLocale('zh-Hant')}>繁體中文</button><button type="button" lang="vi" aria-pressed={locale==='vi'} onClick={()=>setLocale('vi')}>Tiếng Việt</button></div>;}
