import {authenticatedUser,backendConfigured,database} from '@/lib/supabase-server';
import {products} from '../../catalog';
export const dynamic='force-dynamic';
export const runtime='nodejs';
const json=(body:unknown,status=200)=>Response.json(body,{status,headers:{'Cache-Control':'private, no-store','Vary':'Authorization'}});
const text=(v:unknown,n:number):v is string=>typeof v==='string'&&v.trim().length>0&&v.length<=n;
const uuid=(v:unknown):v is string=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
const unavailable='會員服務尚未啟用，請稍後再試。';
export async function GET(req:Request){
  if(!backendConfigured())return json({configured:false,user:null,profile:null,orders:[],reviews:[],notice:unavailable});
  try{
    const user=await authenticatedUser(req);
    if(req.headers.has('authorization')&&!user)return json({error:'登入已過期，請重新登入。'},401);
    const db=database();
    const reviews=await db.from('hoa_reviews').select('id,name,product,rating,content,created').order('created',{ascending:false}).limit(100);
    if(reviews.error)throw reviews.error;
    let orders:unknown[]=[],profile=null;
    if(user){
      const [orderResult,profileResult]=await Promise.all([
        db.from('hoa_orders').select('*').eq('user_id',user.id).order('created',{ascending:false}).limit(100),
        db.from('hoa_members').select('name,phone,address').eq('id',user.id).maybeSingle()
      ]);
      if(orderResult.error||profileResult.error)throw orderResult.error||profileResult.error;
      orders=orderResult.data||[];profile=profileResult.data;
    }
    return json({configured:true,user:user?{name:user.user_metadata?.name||user.email,email:user.email}:null,profile,orders,reviews:reviews.data||[]});
  }catch(error){console.error('Store read failed');return json({error:'資料暫時無法載入，請稍後重試。'},503)}
}
export async function POST(req:Request){
  if(req.headers.get('origin')!==new URL(req.url).origin)return json({error:'請從本站提交。'},403);
  if(!backendConfigured())return json({error:unavailable},503);
  try{
    const user=await authenticatedUser(req);
    if(!user)return json({error:'請先登入會員。'},401);
    const raw=await req.text();if(Buffer.byteLength(raw,'utf8')>16000)return json({error:'內容過長。'},413);
    let b:any;try{b=JSON.parse(raw)}catch{return json({error:'無效資料。'},400)}
    if(!b||typeof b!=='object'||Array.isArray(b))return json({error:'無效資料。'},400);
    const db=database();
    if(b.action==='profile'){
      if(!text(b.name,60)||!text(b.phone,30)||!text(b.address,400))return json({error:'請完整填寫姓名、電話與地址。'},400);
      const {error}=await db.from('hoa_members').upsert({id:user.id,name:b.name.trim(),phone:b.phone.trim(),address:b.address.trim()},{onConflict:'id'});
      if(error)throw error;return json({ok:true});
    }
    if(b.action==='review'){
      if(!text(b.name,40)||!text(b.content,1000)||!['all',...products.map(p=>p.id)].includes(b.product)||!Number.isInteger(b.rating)||b.rating<1||b.rating>5)return json({error:'請填寫暱稱、評分與 1–1000 字留言。'},400);
      const id=crypto.randomUUID();
      const {error}=await db.from('hoa_reviews').insert({id,user_id:user.id,name:b.name.trim(),product:b.product,rating:b.rating,content:b.content.trim()});
      if(error)throw error;return json({ok:true,id});
    }
    if(b.action==='order'){
      if(!text(b.name,60)||!text(b.phone,30)||!text(b.address,400)||!Array.isArray(b.items)||!b.items.length||b.items.length>3||!['MoMo','ZaloPay','VNPAY','銀行轉帳','貨到付款'].includes(b.payment)||!['GHN','GHTK','Viettel Post'].includes(b.carrier))return json({error:'訂購資料不完整。'},400);
      if(!uuid(b.requestId))return json({error:'請重新提交。'},400);
      let total=0;const seen=new Set<string>();const items=[];
      for(const item of b.items){
        const product=products.find(p=>p.id===item?.id);
        if(!product||seen.has(item.id)||!Number.isInteger(item.quantity)||item.quantity<1||item.quantity>99)return json({error:'商品數量不正確。'},400);
        seen.add(item.id);total+=product.price*item.quantity;
        items.push({id:product.id,name:product.name,quantity:item.quantity,price:product.price});
      }
      const {error}=await db.from('hoa_orders').insert({id:b.requestId,user_id:user.id,items:JSON.stringify(items),total,name:b.name.trim(),phone:b.phone.trim(),address:b.address.trim(),payment:b.payment,carrier:b.carrier,status:'測試訂單 · 未付款 · 未叫件'});
      if(error?.code==='23505'){
        const previous=await db.from('hoa_orders').select('id').eq('id',b.requestId).eq('user_id',user.id).maybeSingle();
        if(previous.error)throw previous.error;
        if(previous.data)return json({ok:true,id:previous.data.id});
        return json({error:'請重新提交。'},409);
      }
      if(error)throw error;
      return json({ok:true,id:b.requestId});
    }
    return json({error:'不支援的操作。'},400);
  }catch(error){console.error('Store write failed');return json({error:'儲存未完成，資料仍保留在表單，請稍後重試。'},503)}
}
