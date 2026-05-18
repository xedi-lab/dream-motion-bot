declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void
        expand(): void
        close(): void
        colorScheme: 'dark' | 'light'
        initData: string
        initDataUnsafe: {
          user?: {
            id: number
            first_name: string
            username?: string
          }
        }
        BackButton: {
          show(): void
          hide(): void
          onClick(cb: () => void): void
          offClick(cb: () => void): void
        }
        HapticFeedback: {
          impactOccurred(style: 'light' | 'medium' | 'heavy'): void
          notificationOccurred(type: 'error' | 'success' | 'warning'): void
        }
      }
    }
  }
}

export function useTelegram() {
  const tg = window.Telegram?.WebApp

  return {
    tg,
    initData: tg?.initData ?? '',
    user: tg?.initDataUnsafe?.user ?? null,
    colorScheme: tg?.colorScheme ?? 'dark',
    ready: () => tg?.ready(),
    expand: () => tg?.expand(),
    haptic: tg?.HapticFeedback,
  }
}
