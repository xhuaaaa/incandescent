'use client';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
let client:SupabaseClient|null=null;
export function browserAuth(){
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if(!url||!key)return null;
  if(!client)client=createClient(url,key);
  return client;
}
export async function storeRequest(init:RequestInit={}){
  const auth=browserAuth();
  const headers=new Headers(init.headers);
  if(auth){const {data,error}=await auth.auth.getSession();if(error)throw error;if(data.session)headers.set('Authorization',`Bearer ${data.session.access_token}`);}
  return fetch('/api/store',{...init,headers,cache:'no-store'});
}
