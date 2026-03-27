import {NavigateFunction} from "react-router-dom"

const navigateOrWindowOpen = (
  href: string,
  navigate: NavigateFunction,
  event: React.MouseEvent<HTMLElement, MouseEvent>
) => {
  if (event.metaKey || event.ctrlKey || event.button === 1) {
    window.open(`${__BASE__}${href}`, "_blank", "noreferrer")
    return
  }

  if (event.shiftKey) {
    window.open(`${__BASE__}${href}`, undefined, "noreferrer")
    return
  }

  navigate(href)
}

export default navigateOrWindowOpen
