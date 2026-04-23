'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase' // ถ้าแดงให้ใช้ '../lib/supabase'

export default function RedirectPage({ params }: { params: { slug: string } }) {
  const [msg, setMsg] = useState("กำลังประมวลผลลิงก์ที่มีความยาวพิเศษ...")
  const slug = decodeURIComponent(params.slug)

  useEffect(() => {
    const fetchOriginalUrl = async () => {
      // ไปหาใน DB ว่าไอ้ slug ยาวๆ นี้คือลิงก์อะไร
      const { data, error } = await supabase
        .from('links')
        .select('original_url')
        .eq('slug', slug)
        .single()

      if (data) {
        // แกล้งรอให้หงุดหงิดเล่นๆ ตามสไตล์เรา
        setTimeout(() => setMsg("ตรวจสอบความปลอดภัยเสร็จสิ้น (มั้งนะ)..."), 2000)
        setTimeout(() => setMsg("กำลังเตรียมพาคุณไปยังจุดหมาย..."), 4000)
        setTimeout(() => {
          window.location.href = data.original_url
        }, 6000)
      } else {
        setMsg("ขออภัย! ไม่พบลิงก์นี้ในระบบ หรือมันอาจจะยาวเกินไปจนเราทำหาย")
      }
    }
    fetchOriginalUrl()
  }, [slug])

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white p-10 text-center font-sans">
      <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-6"></div>
      <h2 className="text-lg font-semibold text-slate-700 animate-pulse">{msg}</h2>
      <div className="mt-8 p-4 bg-slate-50 rounded-xl max-w-md border border-slate-100">
        <p className="text-[9px] font-mono text-slate-300 break-all leading-tight">{slug}</p>
      </div>
    </div>
  )
}