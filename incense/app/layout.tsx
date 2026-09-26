import type { Metadata } from 'next';
import {cookies} from 'next/headers';
import {LanguageProvider} from './i18n';
import './globals.css';
export async function generateMetadata():Promise<Metadata>{const vi=(await cookies()).get('hoa-language')?.value==='vi';return {title:vi?'Hoa | Một làn hương, trọn tấm lòng.':'Hoa｜一縷香，一份心意',description:vi?'Khám phá hương lễ Phật, nghề làm hương và chọn hương cho cuộc sống hằng ngày.':'探索寺廟用香與製香工藝，挑選屬於日常的香氣。',icons:{icon:'/favicon.svg'}};}
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){const locale=(await cookies()).get('hoa-language')?.value==='vi'?'vi':'zh-Hant';return <html lang={locale}><body><LanguageProvider initialLocale={locale}>{children}</LanguageProvider></body></html>}
