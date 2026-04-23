'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  const generateAnnoyingPath = () => {
    // รวมมิตรตระกูล "ขีด" แบบจัดเต็ม
    const trollChars = [
      '-', '_', '=', 'l', 'I', 'i', '|', 
      '⎯', '⏤', '─', '⎓', '˗', '﹉', '﹍', '﹏'
    ]
    
    // สุ่มความยาวแบบสะใจ (300 - 600 ตัวอักษร)
    const length = Math.floor(Math.random() * 300) + 300 
    let res = ''
    for (let i = 0; i < length; i++) {
      res += trollChars[Math.floor(Math.random() * trollChars.length)]
    }
    return res
  }

  const handleGenerate = async () => {
    if (!url) return
    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`
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
    } catch (err) {
      console.error(err)
      setResult('Error--Retry')
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
        
        {/* Logo: (-_-).li */}
        <div className="text-center mb-16 select-none animate-pulse">
          <h1 className="text-6xl font-light text-[#76a771] tracking-tighter font-mono">
            (-_-)<span className="text-slate-200">.</span>li
          </h1>
          <p className="text-[10px] text-slate-300 mt-2 uppercase tracking-[0.8em]">
            Extra Long Edition--
          </p>
        </div>

        <div className="w-full space-y-4">
          {/* ช่อง Input: เน้น Contrast (ตัวเข้ม / พาดหัวจาง) */}
          <div className="flex items-center w-full border border-slate-200 rounded-md bg-slate-50/50 focus-within:border-[#76a771] transition-all overflow-hidden shadow-sm">
            <input 
              type="text" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="Paste long URL here--"
              className="flex-grow px-5 py-4 bg-transparent outline-none text-sm text-slate-900 placeholder:text-slate-300 font-semibold"
            />
            <button 
              onClick={handleGenerate} 
              disabled={loading || !url}
              className="px-8 py-4 bg-[#76a771] hover:bg-[#659161] text-white transition-all disabled:opacity-30 font-black text-xs tracking-widest"
            >
              {loading ? '...' : 'FIX--'}
            </button>
          </div>

          {/* ผลลัพธ์: ลิงก์นรกแบบยาวเหยียด */}
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

        <footer className="fixed bottom-8 opacity-20 hover:opacity-100 transition-opacity duration-1000">
          <p className="text-[7px] font-mono tracking-[1em] text-slate-400">
            SUT EDUCATIONAL TECH | ON THE EARTH
          </p>
        </footer>

      </div>
    </main>
  )
}