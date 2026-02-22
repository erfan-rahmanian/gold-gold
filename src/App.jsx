import React, { useEffect, useRef } from 'react'

export default function App() {
  const containerRef = useRef(null)

  useEffect(() => {
    let injectedNodes = []

    async function loadAndInject() {
      const res = await fetch('/gold-accounting.html')
      const html = await res.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(html, 'text/html')

      // inject styles from the source head
      const headStyles = Array.from(doc.head.querySelectorAll('style'))
      headStyles.forEach(s => {
        const clone = document.createElement('style')
        clone.textContent = s.textContent
        clone.setAttribute('data-injected', 'gold-accounting-style')
        document.head.appendChild(clone)
        injectedNodes.push(clone)
      })

      // set body HTML
      if (containerRef.current) {
        containerRef.current.innerHTML = doc.body.innerHTML
      }

      // inject scripts in order, waiting for external scripts to load
      const scripts = Array.from(doc.querySelectorAll('script'))
      for (const s of scripts) {
        // skip if script has no content and no src
        if (!s.src && !s.textContent) continue
        if (s.src) {
          // external script: append and wait for load
          await new Promise((resolve, reject) => {
            const ext = document.createElement('script')
            ext.src = s.src
            ext.async = false
            ext.setAttribute('data-injected', 'gold-accounting-script')
            ext.onload = () => { injectedNodes.push(ext); resolve() }
            ext.onerror = (e) => { injectedNodes.push(ext); console.error('Failed to load', s.src, e); resolve() }
            document.body.appendChild(ext)
          })
        } else {
          // inline script: execute immediately after previous externals
          const inl = document.createElement('script')
          inl.textContent = s.textContent
          inl.setAttribute('data-injected', 'gold-accounting-script')
          document.body.appendChild(inl)
          injectedNodes.push(inl)
        }
      }
    }

    loadAndInject().catch(err => console.error(err))

    return () => {
      // cleanup injected nodes on unmount
      injectedNodes.forEach(n => n.remove())
      if (containerRef.current) containerRef.current.innerHTML = ''
    }
  }, [])

  return <div ref={containerRef}></div>
}
