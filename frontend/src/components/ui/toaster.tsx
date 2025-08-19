import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts } = useToast()
  return (
    <div className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]">
      {toasts.map(({ id, title, description, action, ...props }) => (
        <div
          key={id}
          className="mb-2 flex w-full items-center justify-between space-x-2 rounded-md bg-white p-4 shadow-lg"
          {...props}
        >
          <div className="grid gap-1">
            {title && <p className="font-medium">{title}</p>}
            {description && <p className="text-sm opacity-90">{description}</p>}
          </div>
          {action}
        </div>
      ))}
    </div>
  )
}
