import Layout from '@/components/Layout'
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MonitorPlay, Smartphone, Monitor } from 'lucide-react'

export default function VisualEditor({ user }: { user: any }) {
  const [url, setUrl] = useState('')
  const [activeUrl, setActiveUrl] = useState('')
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const iframeRef = useRef<HTMLIFrameElement>(null)

  const handleLoad = (e: React.FormEvent) => {
    e.preventDefault()
    if (!url) return
    
    // Ensure URL has protocol
    let parsedUrl = url
    if (!/^https?:\/\//i.test(url)) {
      parsedUrl = 'http://' + url
    }
    setActiveUrl(parsedUrl)
  }

  // Handle messages from the iframe (the client SDK)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // In a real implementation, you would verify origin here
      // if (event.origin !== new URL(activeUrl).origin) return;

      if (event.data?.type === 'VISUAL_EDITOR_UPDATE') {
        console.log('Received update from iframe:', event.data.payload)
        // Here you would typically open an edit panel or save directly via API
        // For example: setEditingElement(event.data.payload)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [activeUrl])

  return (
    <Layout user={user} title='Visual Editor'>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        {/* Editor Toolbar */}
        <div className="flex items-center gap-4 p-4 border-b bg-card">
          <form onSubmit={handleLoad} className="flex-1 flex items-center gap-2 max-w-2xl">
            <Input 
              value={url} 
              onChange={e => setUrl(e.target.value)}
              placeholder="Enter your live site URL (e.g. http://localhost:3001/about)"
              className="flex-1 font-mono text-sm"
            />
            <Button type="submit" size="sm" className="gap-2">
              <MonitorPlay className="w-4 h-4" />
              Load Site
            </Button>
          </form>

          <div className="flex-1 flex justify-end items-center gap-2">
             <div className="flex bg-muted p-1 rounded-md border">
               <Button 
                 variant={viewMode === 'desktop' ? 'secondary' : 'ghost'} 
                 size="sm" 
                 onClick={() => setViewMode('desktop')}
                 className="h-7 px-2"
               >
                 <Monitor className="w-4 h-4" />
               </Button>
               <Button 
                 variant={viewMode === 'mobile' ? 'secondary' : 'ghost'} 
                 size="sm" 
                 onClick={() => setViewMode('mobile')}
                 className="h-7 px-2"
               >
                 <Smartphone className="w-4 h-4" />
               </Button>
             </div>
          </div>
        </div>

        {/* Editor Workspace */}
        <div className="flex-1 bg-muted/30 p-4 flex items-center justify-center overflow-hidden">
           {activeUrl ? (
             <div className={`transition-all duration-300 border bg-background shadow-xl rounded-md overflow-hidden ${viewMode === 'desktop' ? 'w-full h-full' : 'w-[375px] h-[812px]'}`}>
               <iframe 
                 ref={iframeRef}
                 src={activeUrl}
                 className="w-full h-full border-0"
                 title="Visual Editor Live Preview"
                 sandbox="allow-same-origin allow-scripts allow-forms allow-popups"
               />
             </div>
           ) : (
             <div className="text-center text-muted-foreground flex flex-col items-center gap-4 max-w-md">
               <div className="p-4 bg-primary/10 rounded-full text-primary">
                  <MonitorPlay className="w-8 h-8" />
               </div>
               <h3 className="text-lg font-semibold text-foreground">Welcome to the Visual Editor</h3>
               <p className="text-sm">
                 Enter your live website URL in the top bar to begin visually editing your React or Next.js application. 
                 <br/><br/>
                 Note: Your live site must have the Visual Editor SDK installed and allow iframing (X-Frame-Options) from this CMS dashboard.
               </p>
             </div>
           )}
        </div>
      </div>
    </Layout>
  )
}
