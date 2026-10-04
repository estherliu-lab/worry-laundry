import { BottomSheet, MobileScroll, useKeyboard } from "./mobile";
import { LaundryGame } from "./game/LaundryGame";
export default function Prototype() {
  const keyboard = useKeyboard();
  return <LaundryGame Scroll={MobileScroll} Sheet={BottomSheet} beforeNavigate={keyboard.hide} />;
}
