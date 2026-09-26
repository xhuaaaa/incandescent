'use client';
import {useLanguage} from '@/app/i18n';
import {Select,SelectTrigger,SelectValue,SelectContent,SelectItem} from '@/components/ui/select';
export function Choice({value,onChange,options}:{value:string,onChange:(s:string)=>void,options:string[]}){const {t}=useLanguage();return <Select value={value} onValueChange={onChange}><SelectTrigger className="w-full"><SelectValue>{t(value)}</SelectValue></SelectTrigger><SelectContent>{options.map(o=><SelectItem key={o} value={o}>{t(o)}</SelectItem>)}</SelectContent></Select>}
