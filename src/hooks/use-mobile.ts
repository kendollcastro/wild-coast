import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const mql = React.useMemo(
    () =>
      typeof window === "undefined"
        ? null
        : window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`),
    []
  )

  return React.useSyncExternalStore(
    React.useCallback(
      (onStoreChange) => {
        if (!mql) return () => {}
        mql.addEventListener("change", onStoreChange)
        return () => mql.removeEventListener("change", onStoreChange)
      },
      [mql]
    ),
    () => (mql ? mql.matches : false),
    () => false
  )
}