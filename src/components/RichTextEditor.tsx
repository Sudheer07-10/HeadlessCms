import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import { useEffect, useState, useRef } from 'react'
import MediaPicker from './MediaPicker'
import { Button } from '@/components/ui/button'
import { ImageIcon } from 'lucide-react'
import { useTheme } from 'next-themes'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const RichTextEditor = ({ value, onChange, placeholder }: RichTextEditorProps) => {
  const [initialContent, setInitialContent] = useState<'loading' | 'loaded'>('loading')
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false)
  const isInternalChange = useRef(false)
  const { resolvedTheme } = useTheme()

  const editor = useCreateBlockNote()

  useEffect(() => {
    async function loadHTML() {
      if (value) {
        const blocks = await editor.tryParseHTMLToBlocks(value)
        editor.replaceBlocks(editor.document, blocks)
      }
      setInitialContent('loaded')
    }
    
    if (initialContent === 'loading') {
      loadHTML()
    }
  }, [value, editor, initialContent])

  const addImage = (url: string, filename?: string, alt?: string | null) => {
    if (url) {
      let defaultAlt = alt ? alt.trim() : ''
      if (!defaultAlt && filename) {
        defaultAlt = filename.substring(0, filename.lastIndexOf('.')).replace(/[-_]/g, ' ').trim()
      }

      editor.insertBlocks(
        [
          {
            type: 'image',
            props: {
              url: url,
              alt: defaultAlt,
            },
          },
        ],
        editor.getTextCursorPosition().block,
        'after'
      )
    }
  }

  if (initialContent === 'loading') {
    return <div className="p-4 border rounded-md">Loading editor...</div>
  }

  return (
    <div className="relative rounded-md border bg-card focus-within:ring-1 focus-within:ring-ring">
      <div className="sticky top-0 z-10 flex items-center gap-1 border-b bg-card/95 p-1 shrink-0 backdrop-blur-sm rounded-t-md">
         <Button 
           variant="ghost" 
           size="sm" 
           onClick={() => setIsMediaPickerOpen(true)}
           title="Insert Media"
         >
           <ImageIcon className="h-4 w-4 mr-2" />
           Insert Media
         </Button>
      </div>

      <div className="p-4 max-h-[600px] overflow-y-auto">
        <BlockNoteView 
          editor={editor} 
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          onChange={async () => {
            isInternalChange.current = true
            const html = await editor.blocksToHTMLLossy(editor.document)
            onChange(html)
          }}
        />
      </div>

      <MediaPicker
        open={isMediaPickerOpen}
        onOpenChange={setIsMediaPickerOpen}
        onSelect={addImage}
      />
    </div>
  )
}

export default RichTextEditor
