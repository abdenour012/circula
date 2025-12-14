import type { PropsWithChildren } from 'react'

export function PhoneFrame({ children }: PropsWithChildren) {
  return (
    <div className="h-screen bg-white text-black flex items-center justify-center p-6 overflow-hidden">
      <div className="relative w-full max-w-md anim-fade-in">
        {/* Black iPhone frame - using CSS to create realistic black iPhone */}
        <div className="relative">
          {/* Outer bezel - black iPhone color */}
          <div className="absolute -inset-4 rounded-[3.5rem] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.4),0_0_0_8px_rgba(0,0,0,0.1)]" />
          
          {/* Inner bezel shadow */}
          <div className="absolute -inset-2 rounded-[3rem] bg-black/80" />
          
          {/* Screen area */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-black border-4 border-black/30 shadow-[inset_0_0_20px_rgba(0,0,0,0.3)]">
            {/* Screen content */}
            <div className="relative bg-gradient-to-b from-white via-white to-zinc-50 h-[800px] overflow-y-auto">
              {/* Dynamic Island / Notch */}
              <div className="absolute left-1/2 top-3 -translate-x-1/2 z-10">
                <div className="h-7 w-32 rounded-full bg-black shadow-[0_0_10px_rgba(0,0,0,0.5)]" />
              </div>
              
              {/* Content padding */}
              <div className="pt-10 pb-8 px-1">
                {children}
              </div>
            </div>
          </div>
          
          {/* Home indicator (iPhone style) */}
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 rounded-full bg-black/30" />
        </div>
      </div>
    </div>
  )
}
