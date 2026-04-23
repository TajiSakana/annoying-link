'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [url, setUrl] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)
  const [copied, setCopied] = useState(false)
  const [totalLinks, setTotalLinks] = useState(0)
  const [lastUrl, setLastUrl] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const fetchTotalCount = async () => {
    const { count, error } = await supabase
      .from('links')
      .select('*', { count: 'exact', head: true })
    if (!error) setTotalLinks(count || 0)
  }

  useEffect(() => {
    fetchTotalCount()
  }, [])

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
    if (!isValidUrl(url)) {
      setErrorMsg('Invalid URL format--')
      return
    }

    let finalUrl = url.trim()
    if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
      finalUrl = `https://${finalUrl}`
    }

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
      setLastUrl(finalUrl) 
      fetchTotalCount()
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
    <main className="flex min-h-screen flex-col items-center justify-center bg-white p-4 md:p-6 font-sans">
      <div className="w-full max-w-[480px] flex flex-col items-center">
        
        {/* Header: ปรับขนาดฟอนต์ให้เล็กลงนิดหน่อยบนมือถือ */}
        <div className="text-center mb-10 md:mb-16 select-none">
          <h1 className="text-5xl md:text-6xl font-light text-[#76a771] tracking-tighter font-mono animate-pulse">
            (-_-)<span className="text-slate-200">.</span>li
          </h1>
          <p className="text-[9px] md:text-[10px] text-slate-300 mt-2 uppercase tracking-[0.5em] md:tracking-[0.8em]">
            Extra Long Edition--
          </p>
        </div>

        <div className="w-full space-y-4">
          {/* Input: เพิ่มความสูงและ Padding ให้กดง่ายบนมือถือ */}
          <div className="flex flex-col sm:flex-row items-center w-full border border-slate-200 rounded-lg bg-slate-50/50 focus-within:border-[#76a771] transition-all overflow-hidden shadow-sm">
            <input 
              type="text" 
              value={url} 
              onChange={(e) => {
                setUrl(e.target.value)
                setErrorMsg('')
              }} 
              placeholder="Paste long URL here--"
              className="w-full px-5 py-4 bg-transparent outline-none text-base md:text-sm text-slate-900 placeholder:text-slate-300 font-bold"
            />
            <button 
              onClick={handleGenerate} 
              disabled={loading || !url}
              className="w-full sm:w-auto px-10 py-4 bg-[#76a771] hover:bg-[#659161] text-white transition-all disabled:opacity-30 font-black text-xs tracking-widest active:scale-95"
            >
              {loading ? '...' : 'FIX--'}
            </button>
          </div>
          
          {errorMsg && (
            <p className="text-[10px] text-red-500 font-mono text-center animate-bounce">
              {errorMsg}
            </p>
          )}

          {/* Result Section: ปรับปรุงการเลื่อนดูลิงก์บนจอสัมผัส */}
          {result && (
            <div className="flex flex-col w-full border border-[#76a771]/20 rounded-lg bg-white overflow-hidden animate-in zoom-in-95 duration-500 shadow-xl">
              <div className="p-5 max-h-[120px] md:max-h-[150px] overflow-y-auto touch-pan-y scrollbar-hide">
                <p className="text-[10px] font-mono text-[#5a8a55] break-all leading-relaxed tracking-tighter">
                  {result}
                </p>
              </div>
              <button 
                onClick={handleCopy} 
                className="w-full py-5 bg-[#76a771] text-white font-black text-xs hover:bg-[#659161] active:bg-[#5a8a55] transition-all uppercase tracking-[0.2em]"
              >
                {copied ? 'Copied to Clipboard!' : 'Copy Long Link'}
              </button>
            </div>
          )}
        </div>

        {/* Footer: ตัวนับแบบ Pulse สะดุดตา */}
        <footer className="mt-12 text-center space-y-4 opacity-50 hover:opacity-100 transition-opacity duration-700">
          <div className="px-6 py-2 border-y border-[#76a771]/10">
            <p className="text-lg md:text-xl font-mono tracking-widest text-[#76a771] font-bold animate-pulse">
              {totalLinks.toLocaleString()} LINKS FIXED
            </p>
          </div>
          <p className="text-[8px] font-mono tracking-[0.5em] text-slate-400 uppercase">
            Thatthap TJ
          </p>
        </footer>

      </div>
    </main>
  )
}
