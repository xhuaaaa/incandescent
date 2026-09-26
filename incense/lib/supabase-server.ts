import 'server-only';
import {createClient} from '@supabase/supabase-js';
export function backendConfigured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY&&process.env.SUPABASE_SERVICE_ROLE_KEY);}
const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false}};
export function database(){
  if(!backendConfigured())throw new Error('Backend is not configured');
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.SUPABASE_SERVICE_ROLE_KEY!,options);
}
export async function authenticatedUser(req:Request){
  const value=req.headers.get('authorization');
  if(!value?.startsWith('Bearer ')||value.length>12000)return null;
  const client=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,options);
  const {data,error}=await client.auth.getUser(value.slice(7));
  return error?null:data.user;
}
