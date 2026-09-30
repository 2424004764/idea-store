export default function Toast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-8 z-[80] flex justify-center px-4">
      <div className="toast-in rounded-full bg-zinc-900/90 px-4 py-2 text-[13px] text-white shadow-xl backdrop-blur dark:bg-white/90 dark:text-zinc-900">
        {message}
      </div>
    </div>
  )
}
