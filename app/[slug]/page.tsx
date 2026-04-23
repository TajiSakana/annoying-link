'use client'
import { useEffect, use } from 'react'
import { supabase } from '@/lib/supabase'

export default function RedirectPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params)
  const slug = decodeURIComponent(resolvedParams.slug)

  useEffect(() => {
    const fetchAndRedirect = async () => {
      const { data } = await supabase
        .from('links')
        .select('original_url')
        .eq('slug', slug)
        .single()

      if (data) {
        let targetUrl = data.original_url;
        
        // เติม https:// ถ้าไม่มีเหมือนเดิม เพื่อความชัวร์
        if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
          targetUrl = `https://${targetUrl}`;
        }
        
        // วาปไปเลย ไม่ต้องรอ!
        window.location.href = targetUrl;
      } else {
        alert("ไม่พบลิงก์นี้ในระบบครับ");
      }
    }
    fetchAndRedirect()
  }, [slug])

  return (
    // โชว์หน้าว่างๆ หรือ loading แป๊บเดียวระหว่างรอ DB ตอบกลับ
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
    </div>
  )
}