'use client';
import { useLanguage, LanguageSwitcher } from './i18n';
import { Footer } from './site';
export default function Frame({children,title,kicker}:{children:React.ReactNode,title:string,kicker:string}){const {t}=useLanguage();return <><header><a href="/" className="brand">Hoa <small>INCENSE</small></a><nav><a href="/about">{t("關於 Hoa")}</a><a href="/craft">{t("製香工藝")}</a><a href="/shop">{t("香品訂購")}</a><a href="/community">{t("香友留聲")}</a></nav><div className="navicons"><LanguageSwitcher/><a href="/account">{t("會員中心")}</a></div></header><main className="page"><div className="eyebrow">{kicker}</div><h1 className="pageTitle">{t(title)}</h1>{children}</main><Footer/></>}
