'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [totalLinks, setTotalLinks] = useState(0)
  const [lastUrl, setLastUrl] = useState('') // ดักสแปมลิงก์เดิม
  const [errorMsg, setErrorMsg] = useState('')

  // 1. ดึงจำนวนผู้ใช้งานทั้งหมดจาก Supabase มาโชว์ที่ Footer
  const fetchTotalCount = async () => {
    const { count, error } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
    if (!error) setTotalLinks(count || 0)
  }

  useEffect(() => {
    fetchTotalCount()
  }, [])

  // 2. ฟังก์ชันตรวจสอบว่าสิ่งที่กรอกคือ URL จริงๆ (ป้องกันพวกพิมพ์ตัวเดียว)
  const isValidUrl = (string: string) => {
    try {
      const pattern = new RegExp('^(https?:\\/\\/)?'+ 
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ 
        '((\\d{1,3}\\.){3}\\d{1,3}))'+ 
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ 
        '(\\?[;&a-z\\d%_.~+=-]*)?'+ 
        '(\\#[-a-z\\d_]*)?$','i');
      return !!pattern.test(string);
    } catch (e) {
      return false;
    }
  }

  // 3. ฟังก์ชันเจน "ขีดนรก" ความยาว 300 - 2,000 ตัวอักษร
  const generateAnnoyingPath = () => {
    const trollChars = ['-', '_', '=', 'l', 'I', 'i', '|', '⎯', '⏤', '─', '⎓', '˗', '﹉', '﹍', '﹏']
    const length = Math.floor(Math.random() * 1700) + 300 
    let res = ''
    for (let i = 0; i < length; i++) {
      res += trollChars[Math.floor(Math.random() * trollChars.length)]
    }
    return res
  }

  const handleGenerate = async () => {
    setErrorMsg('')
    if (!url) return
    
    // ตรวจสอบความถูกต้องของลิงก์
    if (!isValidUrl(url)) {
      setErrorMsg('Invalid URL format--')
      return
    }

    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`
    }

    // ดักสแปม: ถ้าลิงก์ใหม่ เหมือนกับลิงก์ล่าสุดที่เพิ่งเจนไป
    if (finalUrl === lastUrl) {
       setErrorMsg('You just fixed this link--')
       return
    }

    setLoading(true)
    const slug = generateAnnoyingPath()
    
    try {
      const { error } = await supabase.from('links').insert([{ 
        slug: slug, 
        original_url: finalUrl 
      }])
      
      if (error) throw error
      
      setResult(`${window.location.origin}/${slug}`)
      setLastUrl(finalUrl) // บันทึกไว้ว่าเพิ่งเจนลิงก์นี้ไป
      fetchTotalCount() // อัปเดตตัวเลขทันที
    } catch (err) {
      console.error(err)
      setErrorMsg('Error--Retry')
    } finally {
      setLoading(false)
      setCopied(false)
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(result).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-6 font-sans">
      <div className="w-full max-w-[450px] flex flex-col items-center">
        
        {/* Header Section */}
        <div className="text-center mb-16 select-none animate-pulse">
          <h1 className="text-6xl font-light text-[#76a771] tracking-tighter font-mono">
            (-_-)<span className="text-slate-200">.</span>li
          </h1>
          <p className="text-[10px] text-slate-300 mt-2 uppercase tracking-[0.8em]">
            Extra Long Edition--
          </p>
        </div>

        {/* Input Section */}
        <div className="w-full space-y-4">
          <div className="flex items-center w-full border border-slate-200 rounded-md bg-slate-50/50 focus-within:border-[#76a771] transition-all overflow-hidden shadow-sm">
            <input 
              type="text" 
              value={url} 
              onChange={(e) => {
                setUrl(e.target.value)
                setErrorMsg('') // พิมพ์ใหม่ให้ Error หายไป
              }} 
              placeholder="Paste long URL here--"
              className="flex-grow px-5 py-4 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-300 font-bold"
            />
            <button 
              onClick={handleGenerate} 
              disabled={loading || !url}
              className="px-8 py-4 bg-[#76a771] hover:bg-[#659161] text-white transition-all disabled:opacity-30 font-black text-xs tracking-widest"
            >
              {loading ? '...' : 'FIX--'}
            </button>
          </div>
          
          {/* Error Message Display */}
          {errorMsg && (
            <p className="text-[10px] text-red-500 font-mono text-center animate-bounce">
              {errorMsg}
            </p>
          )}

          {/* Result Display */}
          {result && (
            <div className="flex flex-col w-full border border-[#76a771]/20 rounded-md bg-white overflow-hidden animate-in zoom-in-95 duration-500 shadow-xl">
              <div className="p-5 max-h-[150px] overflow-y-auto scrollbar-hide">
                <p className="text-[10px] font-mono text-[#5a8a55] break-all leading-relaxed tracking-tighter">
                  {result}
                </p>
              </div>
              <button 
                onClick={handleCopy} 
                className="w-full py-4 bg-[#76a771] text-white font-black text-xs hover:bg-[#659161] transition-all uppercase tracking-[0.3em]"
              >
                {copied ? 'Copied--!' : 'Copy Long Link'}
              </button>
            </div>
          )}
        </div>

        {/* Footer with Real-time Counter */}
        <footer className="fixed bottom-8 text-center space-y-2 opacity-30 hover:opacity-100 transition-opacity duration-1000">
          <p className="text-[9px] font-mono tracking-widest text-[#76a771] font-bold">
            {totalLinks.toLocaleString()} LINKS FIXED
          </p>
          {/* <p className="text-[7px] font-mono tracking-[1em] text-slate-400">
            T
          </p> */}
        </footer>

      </div>
    </main>
  )
}
