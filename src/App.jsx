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

      // inject scripts (both src and inline)
      const scripts = Array.from(doc.querySelectorAll('script'))
      for (const s of scripts) {
        const el = document.createElement('script')
        if (s.src) {
          el.src = s.src
        } else {
          el.textContent = s.textContent
        }
        el.setAttribute('data-injected', 'gold-accounting-script')
        document.body.appendChild(el)
        injectedNodes.push(el)
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
