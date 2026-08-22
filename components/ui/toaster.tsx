'use client'

import { useEffect, useState } from 'react'
import { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose } from './toast'

type ToastItem = {
  id: string
  title: string
  description?: string
  variant?: 'default' | 'destructive' | 'success'
}

let toastListeners: ((items: ToastItem[]) => void)[] = []
let toastItems: ToastItem[] = []

export function toast(item: Omit<ToastItem, 'id'>) {
  const id = Math.random().toString(36).slice(2)
  toastItems = [...toastItems, { ...item, id }]
  toastListeners.forEach(l => l(toastItems))
  setTimeout(() => {
    toastItems = toastItems.filter(t => t.id !== id)
    toastListeners.forEach(l => l(toastItems))
  }, 5000)
}

export function Toaster() {
  const [items, setItems] = useState<ToastItem[]>([])

  useEffect(() => {
    toastListeners.push(setItems)
    return () => {
      toastListeners = toastListeners.filter(l => l !== setItems)
    }
  }, [])

  return (
    <ToastProvider>
      {items.map(({ id, title, description, variant }) => (
        <Toast key={id} variant={variant}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </ToastProvider>
  )
}
